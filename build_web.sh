#!/bin/bash
# SPDX-License-Identifier: MIT OR Apache-2.0
# Build the Glossia WASM engine the Book of Bitcoin runs on and drop the
# artifacts (glossia.js / glossia_bg.wasm) into web/.
#
# By default this builds the *published* glossia crate pinned below, fetched
# from crates.io — so the book always builds against a released engine version.
# To bump the engine, publish a new glossia version and update the pin here.
#
#   GLOSSIA_VERSION=x.y.z ./build_web.sh   # build a different published version
#   GLOSSIA_DIR=~/src/glossia ./build_web.sh   # build an unreleased local checkout
#   ./build_web.sh --fetch-only            # download+extract the crate, no build
set -e

GLOSSIA_VERSION="${GLOSSIA_VERSION:-0.5.0}"

if [ -z "$GLOSSIA_DIR" ]; then
  GLOSSIA_DIR=".glossia-build/glossia-$GLOSSIA_VERSION"
  if [ ! -d "$GLOSSIA_DIR" ]; then
    echo "==> Fetching glossia $GLOSSIA_VERSION from crates.io..."
    mkdir -p .glossia-build
    crate=".glossia-build/glossia-$GLOSSIA_VERSION.crate"
    if ! curl -sSfL "https://static.crates.io/crates/glossia/glossia-$GLOSSIA_VERSION.crate" -o "$crate"; then
      echo "error: could not download glossia $GLOSSIA_VERSION from crates.io." >&2
      echo "       Has that version been published? (Pushing tag v$GLOSSIA_VERSION in" >&2
      echo "       asherp/glossia triggers its publish workflow.) To build from a local" >&2
      echo "       checkout instead, set GLOSSIA_DIR=/path/to/glossia." >&2
      exit 1
    fi
    tar -xzf "$crate" -C .glossia-build
  fi
fi

if [ "$1" = "--fetch-only" ]; then
  echo "==> Engine source ready at $GLOSSIA_DIR."
  exit 0
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
