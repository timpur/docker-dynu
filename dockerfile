FROM node:alpine

WORKDIR /usr/app

COPY . .

RUN npm ci

ENTRYPOINT [ "node" ]

CMD [ "index.js" ]
