FROM nginx:1.25

# remove nginx default .conf files
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

# Add the new .conf files created.
COPY nginx.conf /etc/nginx/nginx.conf