FROM node:14-slim

WORKDIR /app

COPY ./app ./

RUN npm install

COPY ./app/package*.json ./

EXPOSE 8080

CMD [ "npm", "start" ]