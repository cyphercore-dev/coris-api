FROM node:12-alpine

WORKDIR /usr

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/main.js" ]