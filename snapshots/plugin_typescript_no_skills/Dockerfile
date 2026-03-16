FROM oven/bun:1.3.8
WORKDIR /app
LABEL cyanprint.dev=true
COPY package.json .
COPY bun.lockb .
RUN bun install
COPY . .
CMD [ "bun", "run", "index.ts" ]
