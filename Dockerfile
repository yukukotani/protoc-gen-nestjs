# syntax=docker/dockerfile:1.4
FROM node:20.18-bullseye-slim AS build
RUN npm install -g pnpm
WORKDIR /app
COPY --link package.json pnpm-workspace.yaml pnpm-lock.yaml .
COPY --link plugin/package.json ./plugin/
RUN pnpm install --filter '!demo' --frozen-lockfile --prod

FROM node:20.18-bullseye-slim
ARG VERSION
COPY --link --from=build /app /app
USER nobody
LABEL "build.buf.plugins.config.owner"="yuku"
LABEL "build.buf.plugins.config.name"="nestjs"
LABEL "build.buf.plugins.config.version"=$VERSION
ENTRYPOINT [ "/app/plugin/node_modules/.bin/protoc-gen-nestjs" ]