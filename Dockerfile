FROM node:20.10-alpine3.18

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm install
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

CMD ["npm", "run", "start:prod"]
