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

These steps assume the action code is already built, the `./dist` folder
contains the build artifacts, and these changes are committed and pushed to the
`main` branch.

To release a new version of the action, follow these steps:

1. Check out the `main` branch locally.
1. Run `git pull` to fetch the latest changes.
1. Run `npm run release` and enter a new release tag, for example `v1.0.9`.
   > Note: The script sets the tag to the current commit and pushes it to
   > GitHub. Make sure you have committed and pushed all the changes you want to
   > include in the release to the `main` branch before running the script.
1. In the next prompt, type `y` to also move the `v1` tag to the current commit.
