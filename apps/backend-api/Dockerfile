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
RUN pnpm --filter @fake.sh/backend-api install --frozen-lockfile

# Prune all the unnecessary files from node_modules
RUN curl -sf https://gobinaries.com/tj/node-prune | sh
RUN find . -name 'node_modules' -type d -prune -exec node-prune '{}' +

# ----------------------------- #
# -------- EXECUTE APP -------- #
# ----------------------------- #
FROM base as dist
USER node

ENV NODE_ENV="production"
ENV PORT=3001
WORKDIR /app

COPY --from=build --chown=node:node /build/node_modules ./node_modules
COPY --from=build --chown=node:node /build/apps/backend-api ./apps/backend-api
COPY --from=build --chown=node:node /build/packages/backend-common ./packages/backend-common

ENTRYPOINT ["bun", "run", "./apps/backend-api/src/index.ts"]
EXPOSE 3001
