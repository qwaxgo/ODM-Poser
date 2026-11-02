#!/bin/bash
set -e

# Note: System packages (zsh, eza, starship, zoxide, etc.) are installed in
# the Dockerfile as root. This script handles user-level configuration only.

MOUNTED_ZSHRC="/tmp/mounted_zshrc"
MOUNTED_PLUGINS="/tmp/mounted_zsh_plugins.txt"
MOUNTED_GITCONFIG="/home/node/.gitconfig"
TARGET_ZSHRC="/home/node/.zshrc"
TARGET_PLUGINS="/home/node/.zsh_plugins.txt"

# --- Check git username ---
GIT_USER=""
if [ -f "$MOUNTED_GITCONFIG" ]; then
  GIT_USER=$(grep -A1 '\[user\]' "$MOUNTED_GITCONFIG" | grep 'name' | sed 's/.*=\s*//' | tr -d '[:space:]')
  echo "Detected git user: $GIT_USER"
fi

if [ "$GIT_USER" != "qwaxgo" ]; then
  echo "Git user is not qwaxgo (got: '$GIT_USER'). Skipping zsh/ssh import, using minimal config."
  cat > "$TARGET_ZSHRC" << 'MINIMAL'
export LANG=en_US.UTF-8
export EDITOR=vim
HISTFILE=~/.zsh_history
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
  exit 0
fi

# --- SSH setup ---
mkdir -p /home/node/.ssh
chmod 700 /home/node/.ssh
if [ -d /tmp/mounted_ssh ]; then
  echo "Importing SSH keys..."
  cp /tmp/mounted_ssh/id_* /home/node/.ssh/ 2>/dev/null || true
  cp /tmp/mounted_ssh/known_hosts /home/node/.ssh/ 2>/dev/null || true
  cp /tmp/mounted_ssh/config /home/node/.ssh/ 2>/dev/null || true
  chmod 600 /home/node/.ssh/id_* 2>/dev/null || true
  chmod 644 /home/node/.ssh/*.pub 2>/dev/null || true
fi

# --- Zsh plugins ---
if [ -f "$MOUNTED_PLUGINS" ] && [ -s "$MOUNTED_PLUGINS" ]; then
  echo "Importing .zsh_plugins.txt..."
  cp "$MOUNTED_PLUGINS" "$TARGET_PLUGINS"
fi

# --- Zsh config ---
if [ -f "$MOUNTED_ZSHRC" ] && [ -s "$MOUNTED_ZSHRC" ]; then
  echo "Importing .zshrc (filtered for container)..."
  grep -v \
    -e '/usr/bin/keychain' \
    -e 'source.*\.keychain/' \
    "$MOUNTED_ZSHRC" | \
  sed \
    -e 's|source \${ZDOTDIR:-~}/\.antidote/antidote\.zsh|source /home/node/.antidote/antidote.zsh|g' \
    > "$TARGET_ZSHRC"
  echo "" >> "$TARGET_ZSHRC"
  echo "# --- DevContainer overrides ---" >> "$TARGET_ZSHRC"
  echo 'export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"' >> "$TARGET_ZSHRC"
else
  echo "No .zshrc found, creating minimal config..."
  cat > "$TARGET_ZSHRC" << 'MINIMAL'
export LANG=en_US.UTF-8
export EDITOR=vim
HISTFILE=~/.zsh_history
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
fi
