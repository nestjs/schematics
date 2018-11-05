FROM node:carbon-alpine as dev-dependencies
WORKDIR /nestjs/schematics
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

FROM node:carbon-alpine as prod-dependencies
WORKDIR /nestjs/schematics
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install --production

FROM node:carbon-alpine as linter
WORKDIR /nestjs/schematics
COPY --from=dev-dependencies /nestjs/schematics .
COPY src src
COPY test test
COPY tsconfig.json tsconfig.json
COPY tslint.json tslint.json
RUN npm run -s lint:src && npm run -s lint:test

FROM node:carbon-alpine as tester
WORKDIR /nestjs/schematics
COPY --from=linter /nestjs/schematics .
RUN npm test -s

FROM node:carbon-alpine as builder
WORKDIR /nestjs/schematics
COPY --from=tester /nestjs/schematics .
RUN npm run -s build

FROM node:carbon-alpine
RUN npm install -g @angular-devkit/schematics-cli
WORKDIR /nestjs/schematics

COPY --from=prod-dependencies /nestjs/schematics .
COPY --from=builder /nestjs/schematics/dist .
COPY src/collection.json collection.json
COPY LICENSE LICENSE
COPY README.md README.md
COPY src .

RUN ls
RUN npm link
WORKDIR /workspace
VOLUME [ "/workspace" ]
CMD [ "/bin/sh" ]