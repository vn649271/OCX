docker build -t openchaindex:1.0.0
docker run --name openchaindex -d -p 8080:8080 openchaindex:1.0.0
