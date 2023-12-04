#!/bin/bash

npx next telemetry disable
npx update-browserslist-db@latest

if [ "$NODE_ENV" == "production" ]; then
	npm run build
	npm run start
else
	npm --node-options=--inspect=0.0.0.0 run dev
fi
