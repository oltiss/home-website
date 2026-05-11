FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
WORKDIR /usr/share/nginx/html
COPY index.html script.js style.css ./
COPY images/ ./images/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
