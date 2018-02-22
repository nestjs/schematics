FROM node:carbon-alpine
VOLUME [ "/usr/local/app" ]
WORKDIR /usr/local/app
COPY . .
RUN npm install
#RUN rm -rf src test node_modules tsconfig.json tslint.json
