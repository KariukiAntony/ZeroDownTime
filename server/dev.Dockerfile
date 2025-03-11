FROM node:18 AS build

ARG PORT=3000

WORKDIR /server

COPY package*.json /server/

RUN npm install

COPY . /server/


EXPOSE $PORT

CMD [ "npm", "run", "dev" ]