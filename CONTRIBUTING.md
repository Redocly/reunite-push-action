# Redocly Reunite Push GitHub Action Contributing Guide

- [Development setup](#development-setup)
- [NPM scripts](#npm-scripts)
- [Release flow](#release-flow)

## Development setup

[Node.js](http://nodejs.org) at v20.4.0+ and NPM v9.0.0+ are required.

To install modules run:

```bash
npm install # or npm i
```

## NPM scripts

- `npm run lint` - to run linter for codebase
- `npm run prettier:check` - to run prettier check (used for CI)
- `npm run prettier` - to run prettier with fixing errors (used for local)
- `npm run test` - for running unit tests
- `npm run test:watch` - for running unit tests in watch mode
- `npm run test:coverage` - for check unit tests coverage
- `npm run test:ci` - for running unit tests in ci mode
- `npm run bundle` - package the TypeScript for distribution
- `npm run all` - runs prettier, lint, tests, coverage and bundle. Recommended
  to run before creating PR and sending to review.
- `npm run fake-server:start` - fake server needed for smoke tests in CI.

## Release flow

We use git tags for releases. After merging a PR with your changes to main
branch, you should do next steps:

1. Checkout to main branch locally.
1. Run `git pull` to fetch latest changes.
1. Go to `script` folder (`cd script`) and run `./release` script.
1. Type in a new release tag, e.g. `v1.0.9`.
1. And then type `y` or `n` if you want also to point `v1` version to the
   current commit.
