# syntax=docker/dockerfile:1
FROM ubuntu:20.04
RUN "sudo add-apt-repository -y ppa:ethereum/ethereum"
RUN "sudo apt-get update"
RUN "sudo apt-get install ethereum"
CMD ["geth", "--goerli --syncmode light"]
CMD ["geth", "attach $HOME/.ethereum/goerli"]
