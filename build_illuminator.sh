#!/bin/bash
# SPDX-License-Identifier: MIT OR Apache-2.0
# Build the Illuminator WASM engine the book's decoration layer runs on and
# drop the artifacts (illuminator.js / illuminator_bg.wasm) into web/.
#
# Same arrangement as build_web.sh and the Glossia engine, and for the same
# reasons: the engine is a Rust crate of its own (asherp/illuminator), versioned
# and tested on its own, and the book builds against a pinned release of it
# rather than carrying a copy of the source.
#
#   ILLUMINATOR_VERSION=x.y.z ./build_illuminator.sh   # a published crates.io release
#   ILLUMINATOR_REF=main ./build_illuminator.sh        # a git ref, when unpublished
#   ILLUMINATOR_DIR=~/src/illuminator ./build_illuminator.sh   # a local checkout
#   ./build_illuminator.sh --fetch-only                # fetch the source, no build
#
# TODO: the crate has not had its first crates.io release yet, so the default
# below is a git ref. Once v0.1.0 is published (pushing tag v0.1.0 in
# asherp/illuminator triggers its publish workflow), set ILLUMINATOR_VERSION
# here instead and this fetches a release tarball exactly as build_web.sh does.
set -e

ILLUMINATOR_VERSION="${ILLUMINATOR_VERSION:-}"
ILLUMINATOR_REF="${ILLUMINATOR_REF:-main}"
BUILD_DIR=".illuminator-build"

if [ -z "$ILLUMINATOR_DIR" ]; then
  if [ -n "$ILLUMINATOR_VERSION" ]; then
    ILLUMINATOR_DIR="$BUILD_DIR/illuminator-$ILLUMINATOR_VERSION"
    if [ ! -d "$ILLUMINATOR_DIR" ]; then
      echo "==> Fetching illuminator $ILLUMINATOR_VERSION from crates.io..."
      mkdir -p "$BUILD_DIR"
      crate="$BUILD_DIR/illuminator-$ILLUMINATOR_VERSION.crate"
      if ! curl -sSfL "https://static.crates.io/crates/illuminator/illuminator-$ILLUMINATOR_VERSION.crate" -o "$crate"; then
        echo "error: could not download illuminator $ILLUMINATOR_VERSION from crates.io." >&2
        echo "       Has that version been published? (Pushing tag v$ILLUMINATOR_VERSION in" >&2
        echo "       asherp/illuminator triggers its publish workflow.) To build from a git" >&2
        echo "       ref instead, set ILLUMINATOR_REF; from a local checkout, ILLUMINATOR_DIR." >&2
        exit 1
      fi
      tar -xzf "$crate" -C "$BUILD_DIR"
    fi
  else
    ILLUMINATOR_DIR="$BUILD_DIR/illuminator-$ILLUMINATOR_REF"
    if [ ! -d "$ILLUMINATOR_DIR" ]; then
      echo "==> Cloning illuminator @ $ILLUMINATOR_REF..."
      mkdir -p "$BUILD_DIR"
      if ! git clone --quiet --depth 1 --branch "$ILLUMINATOR_REF" \
          https://github.com/asherp/illuminator "$ILLUMINATOR_DIR"; then
        echo "error: could not clone asherp/illuminator at ref '$ILLUMINATOR_REF'." >&2
        echo "       Set ILLUMINATOR_VERSION for a published release, or ILLUMINATOR_DIR" >&2
        echo "       for a local checkout." >&2
        exit 1
      fi
    fi
  fi
fi

if [ "$1" = "--fetch-only" ]; then
  echo "==> Engine source ready at $ILLUMINATOR_DIR."
  exit 0
fi

echo "==> Building Illuminator WASM module from $ILLUMINATOR_DIR..."
(cd "$ILLUMINATOR_DIR" && wasm-pack build --target web --no-default-features --features wasm)

echo "==> Copying artifacts to web/..."
cp "$ILLUMINATOR_DIR/pkg/illuminator_bg.wasm" web/
cp "$ILLUMINATOR_DIR/pkg/illuminator.js" web/

echo "==> illuminator_bg.wasm: $(wc -c < web/illuminator_bg.wasm) B"

echo "==> Build complete."
