FROM node:20-alpine AS pruner

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g turbo@2.9.6

COPY . .

RUN turbo prune --scope=product-service --docker


FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=pruner /app/out/json/ .

COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm turbo run build --filter=product-service...


FROM node:20-alpine AS production-deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=builder /app .

# CHANGE 1: Deploy the production dependencies for product-service.
RUN pnpm --filter=product-service deploy --prod /tmp/product-service-deploy

# CHANGE 2: Copy the already-built product-db files into the deployed
# workspace package because pnpm deploy does not include this workspace
# package's compiled dist/ directory automatically.
RUN mkdir -p /tmp/product-service-deploy/node_modules/@repo/product-db/dist && \
    cp -R /app/packages/product-db/dist/. \
    /tmp/product-service-deploy/node_modules/@repo/product-db/dist/


FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs

RUN adduser --system --uid 1001 nodeuser

COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/product-service-deploy/node_modules ./node_modules

COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/product-service-deploy/dist ./dist

COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/product-service-deploy/package.json ./package.json

USER nodeuser

EXPOSE 8000

CMD ["node", "dist/index.js"]