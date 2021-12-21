# syntax=docker/dockerfile:1
# FROM geth:1.9
# WORKDIR ./

CMD ["sudo add-apt-repository", "-y ppa:ethereum/ethereum"]
CMD ["sudo apt-get", "update"]
CMD ["sudo apt-get", "install ethereum"]

CMD ["export", "PATH=\"$PATH:$HOME/go-ethereum/build/bin\""]
CMD ["export", "GETH_DATA_DIR=\"$HOME/.ethereum\""]
CMD ["export", "CLEF_LOCATION=\"$HOME/.clef\""]
CMD ["export", "IPC_LOCATION=\"$HOME/.ethereum/goerli\""]

CMD ["clef", "--keystore $GETH_DATA_DIR/keystore --chainid 5"]
CMD ["geth", "--goerli --syncmode \"light\" --http --signer=$CLEF_LOCATION/clef.ipc"]
CMD ["geth", "attach $IPC_LOCATION"]
