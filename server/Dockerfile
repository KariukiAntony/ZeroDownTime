# Build stage
FROM node:18.20.4-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .
RUN npm run build


# Production stage
FROM node:20.14.0-alpine AS production

ENV PORT=3000
ENV WORKDIR=/usr/src/app

RUN mkdir -p ${WORKDIR}
RUN chown -R node:node ${WORKDIR}
WORKDIR ${WORKDIR}

COPY --chown=node:node package*.json ./

USER node
RUN npm install --production
COPY --chown=node:node --from=build /app/dist ./dist

EXPOSE "${PORT}"

CMD ["npm", "run", "prod"]