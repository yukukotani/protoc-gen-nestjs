# syntax=docker/dockerfile:1.4
FROM node:18.12-bullseye-slim AS build
WORKDIR /app
COPY --link package.json package-lock.json .
RUN npm ci

FROM node:18.12-bullseye-slim
COPY --link --from=build /app /app
USER nobody
LABEL "build.buf.plugins.config.owner"="yuku"
LABEL "build.buf.plugins.config.name"="nestjs"
LABEL "build.buf.plugins.config.version"="v0.1.1-5"
ENTRYPOINT [ "/app/node_modules/.bin/protoc-gen-nestjs" ]