#!/bin/sh
cd ~/OpenchainTestVersion
cd geth-node
echo "********************************** docker build *****************************************************"
docker build -t openchaindex-geth-node-image-1 .
echo "********************************** gcloud auth login *****************************************************"
gcloud auth login
gcloud auth configure-docker
gcloud config set project openchaindex-geth-node
echo "********************************** gcloud build *****************************************************"
gcloud builds submit --tag gcr.io/openchaindex-geth-node/openchaindex-geth-node-image-1
echo "****************Built your docker image successfully. It's time to register with service **************"
