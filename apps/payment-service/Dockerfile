# --- Stage 1: Pruner ---
FROM node:20-alpine AS pruner
RUN apk add --no-libc6-compat
WORKDIR /app
RUN npm install -g turbo@^2.9.6
COPY . .
RUN turbo prune --scope=payment-service --docker

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
RUN apk add --no-libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm turbo run build --filter=payment-service...

# --- Stage 3: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

COPY --from=builder --chown=nodeuser:nodejs /app .

USER nodeuser
EXPOSE 5004

CMD ["node", "apps/payment-service/dist/index.js"]
