# --- Stage 1: Prune Workspace ---
FROM node:20-alpine AS pruner
RUN apk add --no-libc6-compat
WORKDIR /app
RUN npm install -g turbo@^2.9.6
COPY . .
RUN turbo prune --scope=admin --docker

# --- Stage 2: Install & Build ---
FROM node:20-alpine AS builder
RUN apk add --no-libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=admin...

# --- Stage 3: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs
EXPOSE 3003
ENV PORT=3003

CMD ["node", "apps/admin/server.js"]
