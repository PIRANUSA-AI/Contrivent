# ---- build stage ---------------------------------------------------------
# Full frame set is ~120 MB, so never COPY ./ first: it makes every rebuild
# re-transfer the build context. Copy only what the build actually reads.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY tsconfig.json vite.config.ts index.html ./
COPY public/frames ./public/frames
COPY public/favicon.* public/favicon-*.png public/robots.txt public/sitemap.xml public/og-cover.webp public/llms.txt ./public/
COPY src ./src

RUN npm run build

# ---- runtime stage -------------------------------------------------------
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO/ http://127.0.0.1/ || exit 1
