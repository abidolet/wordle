#!/bin/sh
set -e

SSL_DIR=/etc/kong/ssl
CERT_FILE="$SSL_DIR/kong.crt"
KEY_FILE="$SSL_DIR/kong.key"

if [ ! -f "$SSL_DIR/kong.crt" ]; then
    openssl req -x509 -nodes -days $KONG_SSL_DAYS -newkey rsa:2048 \
        -keyout $KEY_FILE \
        -out $CERT_FILE \
        -subj "/CN=${KONG_SSL_CN}"
    chmod 600 "$KEY_FILE"
fi

exec /docker-entrypoint.sh kong docker-start
