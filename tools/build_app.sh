#!/bin/sh
# Builds the app inside the container of docker-compose.tauri.yml (see there for the command).
#   sh tools/build_app.sh [linux|windows|all]
# linux: release/ODM-Poser-v<version>-linux-x86_64.AppImage
# windows: release/ODM-Poser-v<version>-windows-x64.zip (the exe cross-built with cargo-xwin, not signed)
set -eu
what="${1:-all}"
case "$what" in linux | windows | all) ;; *) echo "usage: build_app.sh [linux|windows|all]" >&2; exit 2 ;; esac
cd "$(dirname "$0")/.."

# the files made here belong to whoever started the container, not to root
give_back() {
  if [ -n "${HOST_UID:-}" ]; then
    chown -R "$HOST_UID:${HOST_GID:-$HOST_UID}" release app dist src-tauri/Cargo.lock src-tauri/gen 2>/dev/null || true
  fi
}
trap give_back EXIT

ver=$(node -p "require('./package.json').version")
mkdir -p release
npm ci
python3 tools/make_app_web.py                    # npm run build, then app/web (the app's page)

if [ "$what" = linux ] || [ "$what" = all ]; then
  cargo tauri build --bundles appimage
  cp "$CARGO_TARGET_DIR"/release/bundle/appimage/*.AppImage "release/ODM-Poser-v$ver-linux-x86_64.AppImage"
fi
if [ "$what" = windows ] || [ "$what" = all ]; then
  cargo tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle
  python3 tools/make_app_zip.py "$CARGO_TARGET_DIR/x86_64-pc-windows-msvc/release/ODM-Poser.exe"
fi
ls -l release
