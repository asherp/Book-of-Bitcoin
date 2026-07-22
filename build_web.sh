#!/bin/bash
# Build the Glossia WASM engine the Bitcoin Book runs on and drop the
# artifacts (glossia.js / glossia_bg.wasm) into web/.
#
# The engine lives in the separate asherp/glossia repository. This script
# uses an existing checkout if GLOSSIA_DIR points at one (or ../glossia
# exists), otherwise it shallow-clones the repo into .glossia-build/.
set -e

GLOSSIA_DIR="${GLOSSIA_DIR:-}"
if [ -z "$GLOSSIA_DIR" ]; then
  if [ -d ../glossia ]; then
    GLOSSIA_DIR=../glossia
  else
    GLOSSIA_DIR=.glossia-build
    if [ ! -d "$GLOSSIA_DIR" ]; then
      echo "==> Cloning asherp/glossia into $GLOSSIA_DIR..."
      git clone --depth 1 https://github.com/asherp/glossia.git "$GLOSSIA_DIR"
    fi
  fi
fi

echo "==> Building Glossia WASM module from $GLOSSIA_DIR..."
(cd "$GLOSSIA_DIR" && wasm-pack build --target web --no-default-features --features wasm)

echo "==> Copying artifacts to web/..."
cp "$GLOSSIA_DIR/pkg/glossia_bg.wasm" web/
cp "$GLOSSIA_DIR/pkg/glossia.js" web/

echo "==> glossia_bg.wasm: $(wc -c < web/glossia_bg.wasm) B"

echo "==> Build complete."
echo "    Serve the web/ directory, e.g.:"
echo "    python3 -m http.server -d web 8080"
