#!/bin/bash
set -x # Show the output of the following commands (useful for debugging)

rvm install 2.2.2
# Import the SSH deployment key
openssl aes-256-cbc -K $encrypted_8b31a5c0241d_key -iv $encrypted_8b31a5c0241d_iv -in .travis/travis_rsa.enc -out ~/.ssh/travis_rsa -d
rm travis_rsa.enc # Don't need it anymore
chmod 600 ~/.ssh/travis_rsa
# mv deploy-key ~/.ssh/id_rsa
