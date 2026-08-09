#!/bin/bash
# SPDX-License-Identifier: MIT OR Apache-2.0
# Build the Scriptorium WASM engine the book's decoration layer runs on and
# drop the artifacts (scriptorium.js / scriptorium_bg.wasm) into web/.
#
# Same arrangement as build_web.sh and the Glossia engine, and for the same
# reasons: the engine is a Rust crate of its own — `scriptorium`, which lives
# in the asherp/illuminator repository — versioned and tested on its own, so
# the book builds against a pinned release of it rather than carrying a copy
# of the source.
#
#   SCRIPTORIUM_VERSION=x.y.z ./build_scriptorium.sh   # a published crates.io release
#   SCRIPTORIUM_REF=main ./build_scriptorium.sh        # a git ref, when unpublished
#   SCRIPTORIUM_DIR=~/src/scriptorium ./build_scriptorium.sh   # a local checkout
#   ./build_scriptorium.sh --fetch-only                # fetch the source, no build
#
# TODO: the crate has not had its first crates.io release yet, so the default
# below is a git ref. Once v0.1.0 is published (pushing tag v0.1.0 in
# asherp/illuminator triggers its publish workflow), set SCRIPTORIUM_VERSION
# here instead and this fetches a release tarball exactly as build_web.sh does.
set -e

SCRIPTORIUM_VERSION="${SCRIPTORIUM_VERSION:-}"
SCRIPTORIUM_REF="${SCRIPTORIUM_REF:-main}"
BUILD_DIR=".scriptorium-build"

if [ -z "$SCRIPTORIUM_DIR" ]; then
  if [ -n "$SCRIPTORIUM_VERSION" ]; then
    SCRIPTORIUM_DIR="$BUILD_DIR/scriptorium-$SCRIPTORIUM_VERSION"
    if [ ! -d "$SCRIPTORIUM_DIR" ]; then
      echo "==> Fetching scriptorium $SCRIPTORIUM_VERSION from crates.io..."
      mkdir -p "$BUILD_DIR"
      crate="$BUILD_DIR/scriptorium-$SCRIPTORIUM_VERSION.crate"
      if ! curl -sSfL "https://static.crates.io/crates/scriptorium/scriptorium-$SCRIPTORIUM_VERSION.crate" -o "$crate"; then
        echo "error: could not download scriptorium $SCRIPTORIUM_VERSION from crates.io." >&2
        echo "       Has that version been published? (Pushing tag v$SCRIPTORIUM_VERSION in" >&2
        echo "       asherp/illuminator triggers its publish workflow.) To build from a git" >&2
        echo "       ref instead, set SCRIPTORIUM_REF; from a local checkout, SCRIPTORIUM_DIR." >&2
        exit 1
      fi
      tar -xzf "$crate" -C "$BUILD_DIR"
    fi
  else
    SCRIPTORIUM_DIR="$BUILD_DIR/scriptorium-$SCRIPTORIUM_REF"
    if [ ! -d "$SCRIPTORIUM_DIR" ]; then
      echo "==> Cloning scriptorium @ $SCRIPTORIUM_REF..."
      mkdir -p "$BUILD_DIR"
      if ! git clone --quiet --depth 1 --branch "$SCRIPTORIUM_REF" \
          https://github.com/asherp/illuminator "$SCRIPTORIUM_DIR"; then
        echo "error: could not clone asherp/illuminator at ref '$SCRIPTORIUM_REF'." >&2
        echo "       Set SCRIPTORIUM_VERSION for a published release, or SCRIPTORIUM_DIR" >&2
        echo "       for a local checkout." >&2
        exit 1
      fi
    fi
  fi
fi

if [ "$1" = "--fetch-only" ]; then
  echo "==> Engine source ready at $SCRIPTORIUM_DIR."
  exit 0
fi

echo "==> Building Scriptorium WASM module from $SCRIPTORIUM_DIR..."
(cd "$SCRIPTORIUM_DIR" && wasm-pack build --target web --no-default-features --features wasm)

echo "==> Copying artifacts to web/..."
cp "$SCRIPTORIUM_DIR/pkg/scriptorium_bg.wasm" web/
cp "$SCRIPTORIUM_DIR/pkg/scriptorium.js" web/

echo "==> scriptorium_bg.wasm: $(wc -c < web/scriptorium_bg.wasm) B"

echo "==> Build complete."
