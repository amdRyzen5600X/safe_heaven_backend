FROM node:23-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./

RUN npm run build && npm prune --production


FROM node:23-slim

ENV PORT=3000
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules

# # Migrations compiled while npm run build was call
# RUN rm -rf /app/dist/migrations/*.d.ts /app/dist/migrations/*.map
# COPY --from=build /app/package.json /app/package.json
# COPY --from=build /app/scripts/wait-for-it.sh /app/wait-for-it.sh
# RUN chmod +x wait-for.sh

EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "dist/main.js" ]
