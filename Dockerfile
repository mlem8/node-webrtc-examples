FROM node:10-buster-slim

RUN mkdir /app
WORKDIR /app

RUN apt-get update && apt-get install libasound2-dev python3 build-essential -y

ADD examples examples
ADD html html
ADD lib lib
ADD *.js* ./

RUN npm install --production
ENTRYPOINT ["node", "index.js"]
