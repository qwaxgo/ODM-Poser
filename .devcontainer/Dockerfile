# The development container (devcontainer.json, docker-compose*.yml): Node for Astro, Tailwind
# CSS and melta-lint; Python for tools/*.py (lint_ui.py drives Chromium with Playwright).
FROM node:24-bookworm

# System packages (as root)
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    zsh \
    git-flow \
    build-essential \
    openssh-client \
    keychain \
    ripgrep \
    python3 \
    python3-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# eza (a modern ls)
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://raw.githubusercontent.com/eza-community/eza/main/deb.asc | gpg --dearmor -o /etc/apt/keyrings/eza.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/eza.gpg] http://deb.gierens.de stable main" > /etc/apt/sources.list.d/eza.list && \
    apt-get update && apt-get install -y eza && \
    rm -rf /var/lib/apt/lists/*

# starship prompt
RUN curl -fsSL https://starship.rs/install.sh | sh -s -- -y

# zoxide
RUN curl -fsSL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | bash && \
    mv /root/.local/bin/zoxide /usr/local/bin/zoxide

# Python for tools/*.py: a venv on the PATH with Playwright (lint_ui.py), esprima (the syntax
# check in docs/HANDOFF.md) and Pillow (make_icons.py, make_card.py)
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir playwright esprima pillow && \
    chown -R node:node /opt/venv
ENV PATH=/opt/venv/bin:$PATH

# The shared libraries Chromium needs (the browser itself is installed per user below)
RUN playwright install-deps chromium && rm -rf /var/lib/apt/lists/*

# Claude Code
RUN npm install -g @anthropic-ai/claude-code

# zsh for the node user
RUN chsh -s /bin/zsh node

WORKDIR /workspace
RUN chown -R node:node /workspace

USER node
ENV SHELL=/bin/zsh

# global npm packages without root
RUN mkdir -p /home/node/.npm-global && \
    npm config set prefix '/home/node/.npm-global'
ENV PATH=/home/node/.npm-global/bin:$PATH
RUN npm install -g npm-check-updates

# antidote (zsh plugin manager)
RUN git clone --depth=1 https://github.com/mattmc3/antidote.git /home/node/.antidote

RUN mkdir -p /home/node/.ssh && chmod 700 /home/node/.ssh

COPY --chown=node:node .devcontainer/setup_zsh.sh /tmp/setup_zsh.sh
RUN chmod +x /tmp/setup_zsh.sh

RUN git config --global --add safe.directory /workspace && \
    git config --global --add safe.directory /workspace/design/melta-ui

# package files first, for the layer cache
COPY --chown=node:node package*.json ./
RUN npm ci

# Chromium for Playwright (lint_ui.py uses Edge where there is one, else this)
RUN playwright install chromium

COPY --chown=node:node . .

# 4321: Astro (npm run dev / preview), 8765: tools/serve.py
EXPOSE 4321 8765

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
