# The container that builds the app (src-tauri) on its own, apart from the Astro / dev one:
# Ubuntu 22.04 (the AppImage then runs on systems with glibc 2.35 or newer), Rust, Node (for the
# site's build, which the app's web folder comes from), Tauri's CLI, and for the Windows exe the
# cross build with cargo-xwin (clang, lld, llvm-rc; the MSVC libraries come at the first build).
# Use: docker-compose.tauri.yml.
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive \
    RUSTUP_HOME=/opt/rustup CARGO_HOME=/opt/cargo \
    PATH=/opt/cargo/bin:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential curl wget file ca-certificates git pkg-config xdg-utils zip unzip \
      python3 libssl-dev libxdo-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev \
      patchelf clang lld llvm \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf "$(ls /usr/bin/llvm-rc-* | head -1)" /usr/local/bin/llvm-rc

# Node 24 (the version of the dev container)
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

# Rust, the Windows target, Tauri's CLI and the cross runner
RUN curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable \
    && rustup target add x86_64-pc-windows-msvc \
    && cargo install tauri-cli --version "^2" --locked \
    && cargo install cargo-xwin --locked

WORKDIR /workspace
