# <%= name %>

## Description

<%= description %>

## Installation

```bash
$ <%= packageManager %> install
```

## Running the app

```bash
# development
$ <%= packageManager %> run start

# watch mode (with [nodemon](https://nodemon.io/))
$ <%= packageManager %> run start:dev

# watch mode (with Webpack and Hot Reload enabled)
$ <%= packageManager %> run start:hmr

# production mode
<%= packageManager %> run start:prod
```

## Test

```bash
# unit tests
$ <%= packageManager %> run test

# e2e tests
$ <%= packageManager %> run test:e2e

# test coverage
$ <%= packageManager %> run test:cov
```

