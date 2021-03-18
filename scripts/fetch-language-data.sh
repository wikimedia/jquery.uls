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

cd "$BASEDIR";
echo "Transforming language-data"
JSONDATA="$CLONEDIR/data/language-data.json"
cat "$BASEDIR"/scripts/jquery.uls.data.template.js | sed -e "/languagedata/r $JSONDATA" -e "/languagedata/d" > "$DEST"/jquery.uls.data.js

echo "language-data written to $DEST/jquery.uls.data.js"
