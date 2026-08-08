# Node 24: Next 16 requires >= 20.9, and Node 18 has been end-of-life since April 2025.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# `npm ci` - the lockfile is now in sync, so builds are reproducible. The previous
# `npm install --legacy-peer-deps` existed to paper over a stale lockfile that
# pinned a different Next version than package.json declared.
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined at build time, so this has to be a build arg -
# setting it in compose's `environment:` (as the previous setup did, under a name
# nothing read) could never have worked. It also has to be an address the
# *browser* can reach, not the compose-internal `backend` hostname.
ARG NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "start"]
