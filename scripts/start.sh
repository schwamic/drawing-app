#!/bin/bash
# Build and run the app locally for review purposes.

# Start database
cd ./packages/server/docker && docker compose up -d

# Install Modules
cd ../../..
npm install

# Init Shared
cd ./packages/shared
npm run build

# Init Client
cd ../client
npm run build

# Init Server
cd ../server
npm run db:generate
npm run build
npm run db:push
npm run db:seed

# Start Drawing App
cd ../..
npm run start:server

exit 0
