#!/bin/bash

set -o errexit -o nounset -o pipefail

BASEDIR=$(dirname "$(dirname "$(readlink -f "$0")")")
DEST="$BASEDIR/src/"
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

if [ -d "$BASEDIR"/node_modules/browserify ]
then
	echo "browserify already installed"
else (
	echo "Installing browserify"
	cd "$BASEDIR";
	npm install browserify
) fi

echo "Transforming language-data"

"$BASEDIR"/node_modules/browserify/bin/cmd.js "$CLONEDIR"/language-data.json -t "$BASEDIR"/scripts/transform.js -o "$DEST"/jquery.uls.data.js

echo "language-data wrote to $DEST/jquery.uls.data.js"
