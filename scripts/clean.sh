#!/bin/bash
# Remove all generated folders e.g. build, node_modules, etc.

find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
find . -name 'build' -type d -prune -exec rm -rf '{}' +
find . -name 'dist' -type d -prune -exec rm -rf '{}' +
find . -name '.parcel-cache' -type d -prune -exec rm -rf '{}' +

echo "🧹 Deleted all auto generated folders 🧹"

exit 0
