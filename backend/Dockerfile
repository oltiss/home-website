FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Change the port if your application uses a different one
EXPOSE 3000

CMD ["npm", "start"]
