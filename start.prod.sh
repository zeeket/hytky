#!/bin/sh
echo "Starting server in production mode..."
echo $(pwd)
ls -la node_modules
ls -la
cat package.json
printenv

node server.js