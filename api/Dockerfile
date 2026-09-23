FROM node:24-alpine
WORKDIR /app

COPY api ./api
COPY shared ./shared

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

USER node
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3001/api/health || exit 1

CMD ["node", "api/server.mjs"]
