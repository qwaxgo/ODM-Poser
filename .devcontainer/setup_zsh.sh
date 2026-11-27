#!/bin/bash
set -e

# Note: System packages (zsh, eza, starship, zoxide, etc.) are installed in
# the Dockerfile as root. This script handles user-level configuration only.
#
# What comes from the host (devcontainer.json, "mounts"), all read-only:
#   /tmp/mounted_zshrc, /tmp/mounted_zsh_plugins.txt   ~/.zshrc, ~/.zsh_plugins.txt
#   /tmp/host_ssh/known_hosts, /tmp/host_ssh/config    copied into ~/.ssh (no keys: the host's
#                                                      ssh-agent is forwarded by VS Code)
#   ~/.config/git                                      git's settings (read with ~/.gitconfig)
# Host-only settings (keychain, BROWSER=/mnt/c/..., etc.) belong in the host's ~/.zshrc.local,
# which is not mounted; the filter below drops them in case they are still in ~/.zshrc.

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
alias ls='eza --icons'
alias ll='eza -l --icons --git'
MINIMAL
  container_overrides >> "$TARGET_ZSHRC"
}

# --- Check git username (~/.config/git/config from the host, or ~/.gitconfig) ---
GIT_USER=$(git config --global --get user.name 2>/dev/null || true)
echo "Detected git user: $GIT_USER"

if [ "$GIT_USER" != "qwaxgo" ]; then
  echo "Git user is not qwaxgo (got: '$GIT_USER'). Skipping zsh/ssh import, using minimal config."
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

# --- Zsh plugins ---
if [ -s "$MOUNTED_PLUGINS" ]; then
  echo "Importing .zsh_plugins.txt..."
  cp "$MOUNTED_PLUGINS" "$TARGET_PLUGINS"
fi

# --- Zsh config ---
if [ -s "$MOUNTED_ZSHRC" ]; then
  echo "Importing .zshrc..."
  grep -v \
    -e 'keychain' \
    -e '/mnt/c/' \
    "$MOUNTED_ZSHRC" > "$TARGET_ZSHRC" || true
  container_overrides >> "$TARGET_ZSHRC"
else
  echo "No .zshrc found, creating minimal config..."
  write_minimal_zshrc
fi
