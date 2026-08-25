# syntax=docker/dockerfile:1

FROM oven/bun:1.3.14-alpine AS install

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN bun install \
  --frozen-lockfile \
  --production \
  --filter @gitccino/api

FROM oven/bun:1.3.14-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=install --chown=bun:bun /app/node_modules ./node_modules
COPY --from=install --chown=bun:bun /app/apps/api/node_modules ./apps/api/node_modules
COPY --chown=bun:bun package.json ./package.json
COPY --chown=bun:bun apps/api/package.json ./apps/api/package.json
COPY --chown=bun:bun apps/api/src ./apps/api/src
COPY --chown=bun:bun apps/api/drizzle ./apps/api/drizzle

WORKDIR /app/apps/api

USER bun

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["bun", "-e", "const response = await fetch('http://127.0.0.1:3000/health'); if (!response.ok) process.exit(1)"]

CMD ["bun", "run", "start"]
