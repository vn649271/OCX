#!/bin/sh
cd ~/OpenchainTestVersion
git pull
cd Frontend
echo "********************************** docker build *****************************************************"
docker build -t openchaindex-frontend-image-1 .
echo "********************************** gcloud auth login *****************************************************"
gcloud auth login
gcloud auth configure-docker
gcloud config set project openchaindex-frontend
echo "********************************** gcloud build *****************************************************"
gcloud builds submit --tag gcr.io/openchaindex-frontend/openchaindex-frontend-image-1
echo "****************Built your docker image successfully. It's time to register with service **************"
