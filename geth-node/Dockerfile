# syntax=docker/dockerfile:1
FROM geth:1.9
WORKDIR ./

RUN sudo add-apt-repository -y ppa:ethereum/ethereum
RUN sudo apt-get update
RUN sudo apt-get install ethereum

RUN export PATH="$PATH:$HOME/go-ethereum/build/bin"
RUN export GETH_DATA_DIR="$HOME/.ethereum"
RUN export CLEF_LOCATION="$HOME/.clef"
RUN export IPC_LOCATION="$HOME/.ethereum/goerli


CMD ["clef", "--keystore $GETH_DATA_DIR/keystore --chainid 5"]
CMD ["geth", "--goerli --syncmode \"light\" --http --signer=$CLEF_LOCATION/clef.ipc"]
CMD ["geth", "attach $IPC_LOCATION"]
