# syntax=docker/dockerfile:1
FROM node:14
WORKDIR ./
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
