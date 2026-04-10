# syntax=docker/dockerfile:1
# Build context: repository root (package.json and src/).

FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
# Omit lifecycle scripts (prepare/husky) in the image build.
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# --- Runtime ---
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
# Must match ALB target group port (e.g. 8080); ECS can override PORT.
ENV PORT=8080

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nodejs

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs db ./db

USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const p=process.env.PORT||8080;require('http').get('http://127.0.0.1:'+p+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
