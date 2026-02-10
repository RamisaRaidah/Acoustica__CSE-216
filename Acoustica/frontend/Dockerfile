FROM nginx:alpine

COPY public/index.html /usr/share/nginx/html/index.html

COPY public/favicon.ico /usr/share/nginx/html/favicon.ico

COPY src/ /usr/share/nginx/html/src/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]