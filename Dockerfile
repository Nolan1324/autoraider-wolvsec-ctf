FROM node:12-slim

WORKDIR /app

COPY ./app ./

RUN npm install

COPY ./app/package*.json ./
ENV FLAG=wsc{wRiT!nG_c0d3_t@kE3_t!M3_}

EXPOSE 80

CMD [ "npm", "start" ]