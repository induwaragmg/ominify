# Use Node 20 Alpine consistently for all build stages.
FROM node:20-alpine AS pruner

# Install libc compatibility required by some Node packages on Alpine.
RUN apk add --no-cache libc6-compat

# Set the monorepo working directory.
WORKDIR /app

# Install the exact Turborepo version used by this project.
RUN npm install -g turbo@2.9.6

# Copy the repository so Turborepo can determine workspace dependencies.
COPY . .

# Keep only the files/packages required by auth-service.
RUN turbo prune --scope=auth-service --docker


# Create a dedicated dependency/build stage.
FROM node:20-alpine AS builder

# Install libc compatibility for the build environment.
RUN apk add --no-cache libc6-compat

# Set the monorepo working directory.
WORKDIR /app

#  Enable Corepack and activate the project's pnpm version.
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

#  Copy only the pruned package manifests first for Docker layer caching.
COPY --from=pruner /app/out/json/ .

#  Copy the pruned lockfile.
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

#  Copy the pruned workspace definition.
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

#  Install dependencies using the locked dependency graph.
RUN pnpm install --frozen-lockfile

#  Copy the actual source code after dependency installation.
COPY --from=pruner /app/out/full/ .

#  Build auth-service and its required workspace dependencies.
RUN pnpm turbo run build --filter=auth-service...


#  Create a separate production dependency stage.
FROM builder AS production-deps

#  Generate a production-only deployment containing auth-service.
RUN pnpm --filter=auth-service deploy --prod /tmp/auth-deploy


#  Start a clean runtime image containing only production artifacts.
FROM node:20-alpine AS runner

#  Set production environment mode.
ENV NODE_ENV=production

#  Create a non-root group for container security.
RUN addgroup --system --gid 1001 nodejs

#  Create a non-root application user.
RUN adduser --system --uid 1001 nodeuser

#  Set the runtime working directory.
WORKDIR /app

#  Copy only production node_modules; do not copy source files or .env.
COPY --from=production-deps --chown=nodeuser:nodejs /tmp/auth-deploy/node_modules ./node_modules

#  Copy only the compiled Auth Service JavaScript.
COPY --from=production-deps --chown=nodeuser:nodejs /tmp/auth-deploy/dist ./dist

#  Copy only the package metadata required by Node.js.
COPY --from=production-deps --chown=nodeuser:nodejs /tmp/auth-deploy/package.json ./package.json

#  Run the service as a non-root user.
USER nodeuser

#  Document the port exposed by auth-service.
EXPOSE 8003

#  Start the compiled production JavaScript entry point.
CMD ["node", "dist/index.js"]