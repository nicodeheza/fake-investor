FROM node:16
WORKDIR /APP
COPY package.json .
RUN npm install --omit=dev;
COPY . ./
ENV PORT 4000
EXPOSE $PORT
CMD ["node", "app/index.js"]