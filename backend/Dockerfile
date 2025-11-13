FROM node:18-alpine

# Ustaw katalog roboczy
WORKDIR /app

# Kopiuj package.json i package-lock.json (jeśli jest)
COPY package*.json ./

# Instaluj zależności
RUN npm install

# Kopiuj resztę plików
COPY . .

# Expose port na którym działa serwer Node.js
EXPOSE 3000

# Uruchom serwer
CMD ["npm", "start"]
