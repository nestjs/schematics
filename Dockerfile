FROM node:carbon-alpine as builder
WORKDIR /nestjs/schematics
COPY . .
RUN npm install && \
    npm run -s lint:test && \
    npm run -s lint:src && \
    npm run -s test && \
    rm -rf schematics && mkdir schematics && \
    npm run -s build && \
    cp -R src/* schematics && \
    cp -R LICENSE package.json package-lock.json README.md schematics

FROM node:carbon-alpine
RUN npm install -g @angular-devkit/schematics-cli
WORKDIR /nestjs/schematics
COPY --from=builder /nestjs/schematics/schematics .
RUN npm install --production && npm link
WORKDIR /workspace
VOLUME [ "/workspace" ]
CMD [ "/bin/sh" ]