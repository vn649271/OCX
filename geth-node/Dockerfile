# syntax=docker/dockerfile:1
FROM ubuntu:20.04
WORKDIR ./
COPY . .
RUN mkdir -p $HOME/.ethereum/goerli
CMD ["./geth", "--goerli", "--syncmode", "light"]
#CMD ["./geth", "attach", "/root/.ethereum/goerli/geth.ipc"]
