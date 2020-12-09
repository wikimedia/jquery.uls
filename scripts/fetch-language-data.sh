#!/bin/bash

set -o errexit -o nounset -o pipefail

scriptdir() { perl -MCwd -e 'print Cwd::abs_path shift;' "$1"; }
BASEDIR=$(dirname "$(dirname "$(scriptdir "$0")")")
DEST="$BASEDIR/src"
CLONEDIR="$BASEDIR/vendor/language-data"
UPSTREAM="https://github.com/wikimedia/language-data.git"

echo "Getting latest language-data from $UPSTREAM"

if [ -d "$CLONEDIR" ]
then (
	cd "$CLONEDIR"
	git pull
) else
	git clone "$UPSTREAM" "$CLONEDIR"
fi

# This re-installs it every time, but guarantees we have the right version
echo "Installing browserify"
cd "$BASEDIR";
npm install --no-save browserify@v16.5.2

echo "Transforming language-data"

"$BASEDIR"/node_modules/browserify/bin/cmd.js "$CLONEDIR"/data/language-data.json -t "$BASEDIR"/scripts/transform.js -o "$DEST"/jquery.uls.data.js

echo "language-data written to $DEST/jquery.uls.data.js"
