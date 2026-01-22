FROM node:24.12.0-alpine3.23

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json ./

RUN npm ci
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

CMD ["npm", "run", "start:prod"]
