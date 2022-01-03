FROM node:12

RUN apt-get update && apt-get upgrade -y
WORKDIR /usr/app

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

CMD ["node", "test.js"]