#!/bin/sh
cd ~/OpenchainTestVersion
git pull
cd Frontend
echo "********************************** docker build *****************************************************"
docker build -t openchaindex-image-1 .
echo "********************************** gcloud auth login *****************************************************"
gcloud auth login
gcloud auth configure-docker
gcloud config set project openchaindex
echo "********************************** gcloud build *****************************************************"
gcloud builds submit --tag gcr.io/openchaindex/openchaindex-image-1
echo "Built registered your docker image successfully. It's time to register with service"
