#!/bin/bash
set -xe
if [ $TRAVIS_BRANCH == 'master' ] ; then

    # setup ssh agent, git config and remote
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/travis_rsa

    cd dist

    git init
    git remote add deploy "travis@188.166.80.175:/var/www/cv.macruss.pp.ua"
    git config user.name "Travis CI"
    git config user.email "travis@macruss.pp.ua"

    # commit compressed files and push it to remote
    # rm -f .gitignore
    # cp .travis/deployignore .gitignore
    git add .
    git status # debug
    git commit -m "Deploy compressed files"
    git push -f deploy HEAD:refs/heads/master
else
    echo "Not deploying, since this branch isn't master."
fi