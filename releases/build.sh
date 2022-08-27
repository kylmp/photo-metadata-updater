#!/bin/bash

# This script requires the following:
# releases/ folder must contain a subdirectory called release-build-dir with these files in it: 
#   readme.txt 
#   config.properties 
#   exiftool/
# Note - these files are in the repo as a zip, extract it first before trying to build
# In order for the git commands to work, the build script needs to be run within the repo
# Requires pkg (node app packager), jq (json parser), and gh (github CLI), npm (node package manager)
# (optional) argument 1: version number

scriptdir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

function create_github_release() {
  echo -e "\n\nUpdating version numbers"
  jq '.version = "'"$1"'"' $scriptdir/../package.json > $scriptdir/package.updated.root.json
  mv $scriptdir/package.updated.root.json $scriptdir/../package.json
  jq '.version = "'"$1"'"' $scriptdir/../backend/package.json > $scriptdir/package.updated.backend.json
  mv $scriptdir/package.updated.backend.json $scriptdir/../backend/package.json
  jq '.version = "'"$1"'"' $scriptdir/../frontend/package.json > $scriptdir/package.updated.frontend.json
  mv $scriptdir/package.updated.frontend.json $scriptdir/../frontend/package.json

  git add . && git commit -m "Version bump - $1"
  git push
  git tag -a v$1 -m "Version $1"
  git push origin v$1
  git tag -d v$1
  echo -e "\nVersion bumped, commit pushed and new tag created\n"

  read -p "Please fill out the release notes (press any key to continue)"
  nano $scriptdir/release-notes.txt
  echo -e "\nCreating the github release..."
  gh release create v$1 $scriptdir/$1/*.zip -t "v$1" -F $scriptdir/release-notes.txt
  rm $scriptdir/release-notes.txt
}

function build_distribution_zip() {
  echo "Creating dist zip for $2"
  mv $scriptdir/photo-metadata-updater-$2 $scriptdir/release-build-dir/photo-metadata-updater
  mkdir $PWD/photo-metadata-updater
  cp -R $scriptdir/release-build-dir/* $PWD/photo-metadata-updater
  zip -qr $scriptdir/$1/photo-metadata-updater-$2.zip photo-metadata-updater/
  rm -rf $PWD/photo-metadata-updater
  rm $scriptdir/release-build-dir/photo-metadata-updater
}

function build_release() {
  echo -e "\n\nBuilding frontend"
  npm run --prefix $scriptdir/../frontend build
  echo -e "\nFrontend built\n"

  echo -e "Creating executables\n"
  pkg $scriptdir/../backend/photo-metadata-updater.js --config $scriptdir/../package.json --compress GZip

  echo -e "Creating version folder\n"
  [ -d "$scriptdir/$1" ] && rm -rf $scriptdir/$1
  mkdir $scriptdir/$1

  build_distribution_zip $1 "macos-arm64"
  build_distribution_zip $1 "macos-x64"
  build_distribution_zip $1 "linux-arm64"
  build_distribution_zip $1 "linux-x64"

  echo
  read -p "Update version number, create tag, and draft github release? [y/n]: " -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    create_github_release $1
  else
    echo -e "\nGit operations ignored"
  fi

  echo -e "\nDone!\n"
}

function prompt_for_version() {
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
    build_release $opt1
  elif [ "$REPLY" -eq 2 ]; then
    build_release $opt2
  elif [ "$REPLY" -eq 3 ]; then
    build_release $opt3
  elif [ "$REPLY" -eq 4 ]; then
    build_release $version
  else 
    echo -e "\n\nInvalid selection, cancelled\n"
    exit 1
  fi
}

function use_version_argument() {
  [ -d "$scriptdir/$1" ] && echo -e "WARNING - Version $1 already exists, if you continue it will overwrite the existing release"
  read -p "Create release for v$1? [y/n]: " -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    build_release $1
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
