# frontend/Dockerfile

FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Відкриваємо порт для Vite (зазвичай 5173)
EXPOSE 5173

CMD ["npm", "run", "dev"]
