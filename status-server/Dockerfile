FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install express node-fetch@2 cors
EXPOSE 3010
CMD ["node", "status-server.js"]
