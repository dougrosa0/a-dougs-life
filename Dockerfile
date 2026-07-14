FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY scripts ./scripts

ENV PORT=3000
ENV DB_PATH=/app/data/a-dougs-life.sqlite
EXPOSE 3000

VOLUME ["/app/data"]

CMD ["node", "src/server.js"]
