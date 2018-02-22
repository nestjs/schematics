FROM node:carbon-alpine
WORKDIR /usr/local/app
COPY . .
RUN npm install
