# ----------------------------- #
# --------- SETUP ENV --------- #
# ----------------------------- #
FROM node:21-slim as base

# Install Bun v1.0.22
RUN apt update && apt install -y bash curl unzip && \
  curl https://bun.sh/install | bash -s bun-v1.0.22
ENV PATH="${PATH}:/root/.bun/bin"

# Install pnpm
RUN npm install -g pnpm

# ----------------------------- #
# --------- BUILD APP --------- #
# ----------------------------- #
FROM base as build
WORKDIR /build

COPY . .
RUN pnpm --filter @fake.sh/tenant-api install --frozen-lockfile

# Prune all the unnecessary files from node_modules
RUN curl -sf https://gobinaries.com/tj/node-prune | sh
RUN find . -name 'node_modules' -type d -prune -exec node-prune '{}' +

# ----------------------------- #
# -------- EXECUTE APP -------- #
# ----------------------------- #
FROM base as dist
USER node

ENV NODE_ENV="production"
WORKDIR /app

COPY --from=build --chown=node:node /build/node_modules ./node_modules
COPY --from=build /build/apps/tenant-api ./apps/tenant-api

ENTRYPOINT ["bun", "run", "./apps/tenant-api/src/index.ts"]
EXPOSE 3000
