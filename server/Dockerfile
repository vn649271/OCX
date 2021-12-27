# syntax=docker/dockerfile:1
FROM ubuntu:20.04
FROM node:14
WORKDIR ./
COPY . .
RUN mkdir -p $HOME/.ethereum/goerli
RUN npm install
#CMD ["./geth", "--goerli", "--syncmode", "light"]
CMD ["npm", "start"]
