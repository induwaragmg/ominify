# ============================================================
# CHANGE 1: Pruner stage
# Prune the monorepo to only the dependencies required by
# order-service and its workspace dependencies.
# ============================================================
FROM node:20-alpine AS pruner

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g turbo@2.9.6

COPY . .

RUN turbo prune --scope=order-service --docker


# ============================================================
# CHANGE 2: Builder stage
# Install dependencies and build order-service together with
# its workspace dependencies.
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=pruner /app/out/json/ .

COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm turbo run build --filter=order-service...


# ============================================================
# CHANGE 3: Production dependency stage
# pnpm deploy creates the production dependency tree for
# order-service, including its workspace dependencies.
# ============================================================
FROM node:20-alpine AS production-deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=builder /app .

RUN pnpm --filter=order-service deploy --prod /tmp/order-service-deploy


# ============================================================
# CHANGE 4: Runner stage
# Create the final lightweight production image.
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs

RUN adduser --system --uid 1001 nodeuser

COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/order-service-deploy/node_modules ./node_modules

COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/order-service-deploy/dist ./dist

COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/order-service-deploy/package.json ./package.json

USER nodeuser

EXPOSE 8001

CMD ["node", "dist/index.js"]
