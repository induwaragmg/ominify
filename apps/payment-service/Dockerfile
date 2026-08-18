# CHANGE 1: Use Node 20 Alpine as the base image and create a pruning stage.
FROM node:20-alpine AS pruner

# CHANGE 2: Install libc compatibility required by some Node dependencies.
RUN apk add --no-cache libc6-compat

# CHANGE 3: Set the working directory inside the image.
WORKDIR /app

# CHANGE 4: Install the same Turbo version used by the monorepo.
RUN npm install -g turbo@2.9.6

# CHANGE 5: Copy the monorepo so Turbo can determine Payment Service dependencies.
COPY . .

# CHANGE 6: Create a minimal Docker build context containing only Payment Service dependencies.
RUN turbo prune --scope=payment-service --docker


# CHANGE 7: Start a separate build stage.
FROM node:20-alpine AS builder

# CHANGE 8: Set the build working directory.
WORKDIR /app

# CHANGE 9: Install libc compatibility.
RUN apk add --no-cache libc6-compat

# CHANGE 10: Enable pnpm 9, matching the repository package manager.
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# CHANGE 11: Copy only the pruned package manifests first to improve Docker layer caching.
COPY --from=pruner /app/out/json/ .

# CHANGE 12: Copy the pruned lockfile.
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# CHANGE 13: Copy the pruned workspace configuration.
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# CHANGE 14: Install only dependencies required by the pruned workspace.
RUN pnpm install --frozen-lockfile

# CHANGE 15: Copy the actual pruned source code.
COPY --from=pruner /app/out/full/ .

# CHANGE 16: Build Payment Service and its workspace dependencies.
RUN pnpm turbo run build --filter=payment-service...


# CHANGE 17: Create a production dependency stage.
FROM node:20-alpine AS production-deps

# CHANGE 18: Set the production working directory.
WORKDIR /app

# CHANGE 19: Enable the repository's pnpm version.
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# CHANGE 20: Copy the built workspace into this stage.
COPY --from=builder /app .

# CHANGE 21: Deploy only Payment Service production dependencies into a standalone directory.
RUN pnpm --filter=payment-service deploy --prod /tmp/payment-service-deploy


# CHANGE 22: Create the final lightweight runtime image.
FROM node:20-alpine AS runner

# CHANGE 23: Set the runtime working directory.
WORKDIR /app

# CHANGE 24: Create a non-root group for security.
RUN addgroup --system --gid 1001 nodejs

# CHANGE 25: Create a non-root user for running the service.
RUN adduser --system --uid 1001 nodeuser

# CHANGE 26: Copy production dependencies into the runtime image.
COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/payment-service-deploy/node_modules ./node_modules

# CHANGE 27: Copy the compiled Payment Service application.
COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/payment-service-deploy/dist ./dist

# CHANGE 28: Copy Payment Service package metadata.
COPY --from=production-deps \
    --chown=nodeuser \
    /tmp/payment-service-deploy/package.json ./package.json

# CHANGE 29: Run the service as a non-root user.
USER nodeuser

# CHANGE 30: Expose the Payment Service HTTP port.
EXPOSE 8002

# CHANGE 31: Start the compiled Payment Service.
CMD ["node", "dist/index.js"]