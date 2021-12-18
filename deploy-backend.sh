#!/bin/sh
cd ~/OpenchainTestVersion
git pull
cd server
echo "********************************** docker build *****************************************************"
docker build -t openchaindex-backend-image-1 .
echo "********************************** gcloud auth login *****************************************************"
gcloud auth login
gcloud auth configure-docker
gcloud config set project openchaindex-backend
echo "********************************** gcloud build *****************************************************"
gcloud builds submit --tag gcr.io/openchaindex-backend/openchaindex-backend-image-1
echo "****************Built your docker image successfully. It's time to register with service **************"
