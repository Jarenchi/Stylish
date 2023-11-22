FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --omit cypress
EXPOSE 5173
CMD ["npm", "run", "dev"]