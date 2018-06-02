FROM node:10.2.1-alpine

WORKDIR /usr/app

COPY package.json .
RUN npm install --quiet
RUN npm install -g typescript
RUN npm install -g tslint

COPY . .