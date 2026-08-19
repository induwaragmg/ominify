# ============================================================
# Stage 1: Pruner
# Prune the monorepo to only email-service and its dependencies.
# ============================================================
FROM node:20-alpine AS pruner

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g turbo@2.9.6

COPY . .

RUN turbo prune --scope=email-service --docker


# ============================================================
# Stage 2: Builder
# Install dependencies and build email-service and workspace deps.
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-maxtimeout 120000 && \
    pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm turbo run build --filter=email-service...


# ============================================================
# Stage 3: Production dependency stage
# Create production deployment tree for email-service.
# ============================================================
FROM node:20-alpine AS production-deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=builder /app .

RUN pnpm --filter=email-service deploy --prod /tmp/email-service-deploy


# ============================================================
# Stage 4: Runner stage
# Final lightweight production image for email-service.
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/email-service-deploy/node_modules ./node_modules

COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/email-service-deploy/dist ./dist

COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/email-service-deploy/package.json ./package.json

# Copy email static image assets to dist and src paths for template rendering
COPY --from=builder \
    --chown=nodeuser \
    /app/apps/email-service/src/assets ./src/assets

COPY --from=builder \
    --chown=nodeuser \
    /app/apps/email-service/src/assets ./dist/assets

USER nodeuser

CMD ["node", "dist/index.js"]
