<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

<p align="center">
<a href="https://www.npmjs.com/package/nest-schematics-prisma"><img src="https://img.shields.io/npm/v/nest-schematics-prisma.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nest-schematics-prisma"><img src="https://img.shields.io/npm/l/nest-schematics-prisma.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nest-schematics-prisma"><img src="https://img.shields.io/npm/dm/nest-schematics-prisma.svg" alt="NPM Downloads" /></a>
<a href="https://coveralls.io/github/mahdi-ko/nest-schematics-prisma?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/mahdi-ko/nest-schematics-prisma/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

## Description

`nest-schematics-prisma` extends the NestJS CLI with support for Prisma, adding CRUD operations and validation using either [Zod](https://github.com/colinhacks/zod) or [class-transformer](https://github.com/typestack/class-transformer). This package simplifies the setup of Prisma in NestJS projects and provides robust validation options out of the box.

This package was created by **Mahdi Al Komaiha** based on the original package made by Nest team and tested by **Abed Al Ghani**.

## Features

- **Prisma Support**: Seamless integration of Prisma for handling database operations.
- **Validation**: Choose between Zod or class-transformer for validating your entities.

## Installation

```bash
$ npm install -g nest-schematics-prisma
```

## Usage

- install Prisma and have an already made schema
- create the model that you want to generate prisma crud for using
  `npx prisma generate`
- create a service for prisma that is called PrismaService (needed for importing inside the service)
- In your `nest-cli.json`, set the `collection` attribute to `nest-schematics-prisma`:

```json
{
  "collection": "nest-schematics-prisma"
}
```

Alternatively, use the --collection flag when running the Nest CLI commands:

```bash
$ nest g resource user --collection nest-schematics-prisma
```

- follow the questions to generate the crud you want!

for the full documentation on the original schematics go to the [official documentation](https://docs.nestjs.com/).

### Notes

this package is synced to the version 10.1.4 of [@nestjs/schematics](https://www.npmjs.com/package/@nestjs/schematics)
Currently Prisma crud is only supported for Rest Api, graphql support is coming next stay tuned!

## Stay in touch

- GitHub - [nest-schematics-prisma](https://github.com/mahdi-ko/nest-schematics-prisma)
- NPM - [nest-schematics-prisma](https://www.npmjs.com/package/nest-schematics-prisma)

## License

Nest is [MIT licensed](LICENSE).
