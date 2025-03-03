


FROM node


WORKDIR /app

# Копіюємо файли package.json та package-lock.json (якщо є)
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо решту коду
COPY . .

# Відкриваємо порт, на якому працює сервер
EXPOSE 5000

# Запускаємо сервер
CMD ["npm", "run", "dev"]
