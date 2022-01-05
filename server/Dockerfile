# syntax=docker/dockerfile:1
FROM ubuntu:20.04
FROM node:14
WORKDIR ./
COPY . .
COPY ./geth-binaries/* /usr/local/bin
RUN mkdir -p $HOME/.ethereum/goerli
RUN npm install

CMD ["npm", "start"]
