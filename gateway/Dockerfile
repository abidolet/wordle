FROM kong:alpine

USER root

RUN apk add --no-cache openssl

RUN mkdir -p /etc/kong/ssl

COPY ./entrypoint.sh /tmp/entrypoint.sh

RUN chmod +x /tmp/entrypoint.sh

ENTRYPOINT ["/tmp/entrypoint.sh"]
