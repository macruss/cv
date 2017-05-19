#!/bin/bash
set -x
if [ $TRAVIS_BRANCH == 'master' ] ; then
    # Initialize a new git repo in _site, and push it to our server.
    cd _site
    git init

    git remote add deploy "deploy@188.166.80.175:/var/www/cv.macruss.pp.ua"
    git config user.name "Travis CI"
    git config user.email "ruslan.makarenko+travisCI@gmail.com"

    git add .
    git commit -m "Deploy"
    git push --force deploy master
else
    echo "Not deploying, since this branch isn't master."
fi