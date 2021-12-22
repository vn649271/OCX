# syntax=docker/dockerfile:1
FROM node:14
WORKDIR ./
COPY . .
RUN sudo add-apt-repository -y ppa:ethereum/ethereum
RUN sudo apt-get update
RUN sudo apt-get install ethereum
RUN export PATH="$PATH:$HOME/go-ethereum/build/bin"
RUN export GETH_DATA_DIR="$HOME/.ethereum"
RUN export CLEF_LOCATION="$HOME/.clef"
RUN export IPC_LOCATION="$HOME/.ethereum/goerli/geth.ipc"
RUN npm install
CMD ["npm", "start"]
