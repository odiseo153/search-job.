# ──────────────────────────────────────────
# Ever Jobs API — Makefile
# ──────────────────────────────────────────
.PHONY: install dev build test lint clean clean-start help

# ── Development ───────────────────────────
install:         ## Install dependencies
	npm install

dev:             ## Start dev server with hot-reload
	npm run start:dev

build:           ## Compile TypeScript
	npm run build

test:            ## Run tests
	npx jest --forceExit

lint:            ## Lint code
	npx eslint "apps/**/*.ts" "packages/**/*.ts"

clean:           ## Remove dist and node_modules
	rm -rf dist node_modules .nx
clean-start:     ## Full clean rebuild
	rm -rf dist node_modules .nx
	npm install
	npm run build
	npm run start

# ── Help ──────────────────────────────────
help:            ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
