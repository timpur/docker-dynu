FROM node:alpine

WORKDIR /usr/app

COPY package.json package-lock.json index.js ./

RUN npm ci

ENTRYPOINT [ "node" ]

CMD [ "index.js" ]
