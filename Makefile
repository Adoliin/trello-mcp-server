include .env
export

run-build:
	npm run build

run-mcptools: run-build
	mcptools shell --server-logs node ./build/index.js
