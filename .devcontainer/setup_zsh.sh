#!/bin/bash
set -e

# Note: System packages (zsh, eza, starship, zoxide, etc.) are installed in
# the Dockerfile as root. This script handles user-level configuration only.
#
# Where the zsh settings come from, first found wins:
#   1. github.com/qwaxgo/dotfiles, cloned (or pulled) into ~/.dotfiles: .zshrc, .zsh_plugins.txt
#   2. the host's, from devcontainer.json's "mounts" (read-only):
#      /tmp/mounted_zshrc, /tmp/mounted_zsh_plugins.txt   ~/.zshrc, ~/.zsh_plugins.txt
#   3. a minimal ~/.zshrc written here
# ~/.zshrc is made from that file, not linked to it: fix_zshrc drops the host-only lines (keychain,
# BROWSER=/mnt/c/...; host-only settings belong in the host's ~/.zshrc.local, which is not mounted)
# and fixes what does not work here, then container_overrides is added.
# Also from the host: /tmp/host_ssh/known_hosts and config, copied into ~/.ssh (no keys: the host's
# ssh-agent is forwarded by VS Code), and ~/.config/git (git's settings).

DOTFILES_REPO="https://github.com/qwaxgo/dotfiles"
DOTFILES_DIR="/home/node/.dotfiles"
MOUNTED_ZSHRC="/tmp/mounted_zshrc"
MOUNTED_PLUGINS="/tmp/mounted_zsh_plugins.txt"
HOST_SSH="/tmp/host_ssh"
TARGET_ZSHRC="/home/node/.zshrc"
TARGET_PLUGINS="/home/node/.zsh_plugins.txt"

# zsh history in the odm-poser-zsh-history volume, so it outlives a rebuild
container_overrides() {
  echo ""
  echo "# --- DevContainer overrides ---"
  echo 'export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"'
  echo 'HISTFILE=/commandhistory/.zsh_history'
}

# $1 -> ~/.zshrc: without the host-only lines; eza's --icons takes a value now (a bare "--icons"
# eats the next argument, so "ls dir" fails), so it gets "=auto"
fix_zshrc() {
  grep -v \
    -e 'keychain' \
    -e '/mnt/c/' \
    "$1" | sed -E 's/--icons([^=]|$)/--icons=auto\1/g' > "$TARGET_ZSHRC" || true
  container_overrides >> "$TARGET_ZSHRC"
}

write_minimal_zshrc() {
  cat > "$TARGET_ZSHRC" << 'MINIMAL'
export LANG=en_US.UTF-8
export EDITOR=vim
HISTSIZE=10000
SAVEHIST=10000
setopt hist_ignore_dups
setopt share_history
autoload -U colors && colors
autoload -U compinit && compinit
eval "$(starship init zsh)"
eval "$(zoxide init zsh)"
alias ls='eza --icons=auto'
alias ll='eza -l --icons=auto --git'
MINIMAL
  container_overrides >> "$TARGET_ZSHRC"
}

# --- Check git username ---
# not "git config --global": git 2.39 (bookworm) reads only ~/.gitconfig with it once that file
# exists (the Dockerfile makes it), and the host's settings are in ~/.config/git/config
GIT_USER=$(git config --get user.name 2>/dev/null || true)
echo "Detected git user: $GIT_USER"

if [ "$GIT_USER" != "qwaxgo" ]; then
  echo "Git user is not qwaxgo (got: '$GIT_USER'). Skipping dotfiles/zsh/ssh import, using minimal config."
  write_minimal_zshrc
  exit 0
fi

# --- SSH: known_hosts and config only ---
mkdir -p /home/node/.ssh
chmod 700 /home/node/.ssh
for f in known_hosts config; do
  if [ -s "$HOST_SSH/$f" ]; then
    echo "Importing ~/.ssh/$f..."
    cp "$HOST_SSH/$f" "/home/node/.ssh/$f"
    chmod 600 "/home/node/.ssh/$f"
  fi
done
if ssh-add -l > /dev/null 2>&1; then
  echo "ssh-agent: forwarded from the host."
else
  echo "ssh-agent: no keys from the host (start ssh-agent there and ssh-add; README.md)."
fi

# --- GitHub over SSH ---
# github.com's host keys, from GitHub's own list (https://api.github.com/meta, over TLS), unless
# ~/.ssh/known_hosts has them already: ssh then does not stop at "Host key verification failed"
if ! ssh-keygen -F github.com -f /home/node/.ssh/known_hosts > /dev/null 2>&1; then
  echo "Adding github.com's host keys to ~/.ssh/known_hosts..."
  curl -fsS --max-time 20 https://api.github.com/meta \
    | python3 -I -c 'import json,sys; [print("github.com " + k) for k in json.load(sys.stdin)["ssh_keys"]]' \
    >> /home/node/.ssh/known_hosts \
    || echo "Could not fetch GitHub's host keys; the first ssh to github.com will ask."
  chmod 600 /home/node/.ssh/known_hosts
fi
# push over SSH (the host's ssh-agent holds the key, so no passphrase here); fetch and clone of
# public repositories stay on https
git config --global url."git@github.com:".pushInsteadOf "https://github.com/"

# --- dotfiles (a public repository: no login; a failure falls back to the host's files) ---
# credential.helper emptied: the ~/.gitconfig VS Code copies in can name the Windows gh.exe
if [ -d "$DOTFILES_DIR/.git" ]; then
  echo "Updating dotfiles in $DOTFILES_DIR..."
  git -C "$DOTFILES_DIR" -c credential.helper= pull --ff-only --quiet \
    || echo "Could not update dotfiles; using what is in $DOTFILES_DIR."
else
  echo "Cloning $DOTFILES_REPO into $DOTFILES_DIR..."
  git -c credential.helper= clone --depth=1 --quiet "$DOTFILES_REPO" "$DOTFILES_DIR" \
    || echo "Could not clone dotfiles; using the host's zsh settings."
fi

# --- Zsh plugins ---
if [ -s "$DOTFILES_DIR/.zsh_plugins.txt" ]; then
  echo "Using .zsh_plugins.txt from dotfiles..."
  cp "$DOTFILES_DIR/.zsh_plugins.txt" "$TARGET_PLUGINS"
elif [ -s "$MOUNTED_PLUGINS" ]; then
  echo "Importing .zsh_plugins.txt from the host..."
  cp "$MOUNTED_PLUGINS" "$TARGET_PLUGINS"
fi

# --- Zsh config ---
if [ -s "$DOTFILES_DIR/.zshrc" ]; then
  echo "Using .zshrc from dotfiles..."
  fix_zshrc "$DOTFILES_DIR/.zshrc"
elif [ -s "$MOUNTED_ZSHRC" ]; then
  echo "Importing .zshrc from the host..."
  fix_zshrc "$MOUNTED_ZSHRC"
else
  echo "No .zshrc found, creating minimal config..."
  write_minimal_zshrc
fi
