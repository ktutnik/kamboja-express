#!/bin/bash

cd ~/Documents/kambojajs/kamboja-express
git pull origin master && npm install 
npm version prerelease

cd ~/Documents/ktutnik/kamboja-express

