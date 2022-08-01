#!/bin/bash

# This script requires the following:
# releases/ folder must contain a subdirectory called release-build-dir with these files in it: 
# 	readme.txt 
# 	config.properties 
# 	exiftool/
# Note - these files are in the repo as a zip, extract it first before trying to build
# In order for the git commands to work, the build script needs to be run within the repo
# Requires pkg (node app packager), jq (json parser), and gh (github CLI)
# (optional) argument 1: version number

scriptdir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

function do_build_release() {
	echo -e "\n\nCreating executables"
	pkg $scriptdir/../photo-metadata-updater.js --config $scriptdir/../package.json --target macos,linux --out-path $scriptdir

	echo "Creating version folder"
	[ -d "$scriptdir/$1" ] && rm -rf $scriptdir/$1
	mkdir $scriptdir/$1

	echo "Creating macos zip file"
	mv $scriptdir/photo-metadata-updater-macos $scriptdir/release-build-dir/photo-metadata-updater
	mkdir $PWD/photo-metadata-updater
	cp -R $scriptdir/release-build-dir/* $PWD/photo-metadata-updater
	zip -qr $scriptdir/$1/photo-metadata-updater-macos.zip photo-metadata-updater/
	rm -rf $PWD/photo-metadata-updater
	rm $scriptdir/release-build-dir/photo-metadata-updater

	echo "Creating linux zip file"
	mv $scriptdir/photo-metadata-updater-linux $scriptdir/release-build-dir/photo-metadata-updater
	mkdir $PWD/photo-metadata-updater
	cp -R $scriptdir/release-build-dir/* $PWD/photo-metadata-updater
	zip -qr $scriptdir/$1/photo-metadata-updater-linux.zip photo-metadata-updater/
	rm -rf $PWD/photo-metadata-updater
	rm $scriptdir/release-build-dir/photo-metadata-updater

	echo "Updating version numbers"
	jq '.version = "'"$1"'"' $scriptdir/../package.json > $scriptdir/package.updated.backend.json
	mv $scriptdir/package.updated.backend.json $scriptdir/../package.json
	jq '.version = "'"$1"'"' $scriptdir/../src/frontend/package.json > $scriptdir/package.updated.frontend.json
	mv $scriptdir/package.updated.frontend.json $scriptdir/../src/frontend/package.json

	echo -e "\nDone!\n"
}

function prompt_for_version() {
	selected=""
	version=$(jq .version $scriptdir/../package.json)
	version="${version#?}"
	version="${version%?}"
	versionParts=(${version//\./ })
	opt1=$(echo "$((versionParts[0]+=1)).0.0")
	opt2=$(echo "${versionParts[0]}.$((versionParts[1]+=1)).0")
	opt3=$(echo "${versionParts[0]}.${versionParts[1]}.$((versionParts[2]+=1))")
	echo -e "Current version [$version] - Available version options:"
	echo -e " 1. $opt1\n 2. $opt2\n 3. $opt3\n 4. Overwrite $version\n"
	read -p "Version selection [1-4]: " -n 1 -r
	if [ "$REPLY" -eq 1 ]; then
		selected=$opt1
	elif [ "$REPLY" -eq 2 ]; then
		selected=$opt2
	elif [ "$REPLY" -eq 3 ]; then
		selected=$opt3
	elif [ "$REPLY" -eq 4 ]; then
		selected=$version
	else
		echo -e "\n\nInvalid selection, cancelled\n"
		exit 1
	fi
	do_build_release $selected
}

function use_version_argument() {
	[ -d "$scriptdir/$1" ] && echo -e "WARNING - Version $1 already exists, if you continue it will overwrite the existing release"
	echo
	read -p "Create release for v$1? [y/n]: " -n 1 -r
	if [[ $REPLY =~ ^[Yy]$ ]]; then
		do_build_release $1
	else
		echo -e "\n\nCancelled\n"
		exit 1
	fi
}

[ ! -d "$scriptdir/release-build-dir" ] && echo -e "No releases/release-build-dir folder!" && exit 2
[ ! -d "$scriptdir/release-build-dir/exiftool" ] && echo -e "No releases/release-build-dir/exiftool folder!" && exit 3
[ ! -f "$scriptdir/release-build-dir/readme.txt" ] && echo -e "No releases/release-build-dir/readme.txt file!" && exit 4
[ ! -f "$scriptdir/release-build-dir/config.properties" ] && echo -e "No releases/release-build-dir/config.properties file!" && exit 5

if [ "$#" -ne 1 ]; then
	prompt_for_version
else
	use_version_argument $1
fi
