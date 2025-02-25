#! /bin/bash

: " Configurations "

# server
BACKEND_SERVICE="backend"
BACKEND_HEALTH_URL="/healthcheck"
BACKEND_PORT="8000"
BACKEND_REPLICAS="2"

# client

# docker
COMPOSE_FILE="docker-compose.yaml"

# nginx
NGINX_SERVICE="nginx"

set -euo pipefail

trap exit EXIT

function exit(){
    echo "🚀 Your script exited. Check at the logs for more info"
}

function reload_nginx() {
    local result
    docker compose exec "$NGINX_SERVICE" nginx -t &> /dev/null
    result="$?"
    if [[ "$result" -eq 0 ]]; then
        docker compose exec "$NGINX_SERVICE" nginx -s reload &> /dev/null
        sleep 2
        echo "✅ Nginx reloaded successfully."
    else
        printf "❌ ERROR: Nginx configuration test failed %d\n" "$result"
        echo "❌ Exiting ..."
        exit 1
    fi
}

function perform_healthcheck() {
    local url="http://$1"
    echo "🩺 Checking health of $url"

    for _ in {1..30}; do
      if curl --silent --fail "$url"; then
        echo "✅ Health check passed!"
        return 0
      fi
      echo "👋️ Waiting for health check."
      sleep 1
    done
    # healthcheck was not successfull
    echo "❌ Health check failed after multiple attempts!"
    return 1
}

function deploy_backend() {
    local new_container_id
    local new_container_ip

    echo "🚀 Scaling backend service ..."
    docker compose up -d --build --scale $BACKEND_SERVICE=$(("$BACKEND_REPLICAS" + 1)) --no-recreate "$BACKEND_SERVICE"

    # Get the latest container ID
    new_container_id=$(docker ps --latest -f name="$BACKEND_SERVICE" -q | head -n 1)

    if [[ -n "$new_container_id" ]]; then
        new_container_ip=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$new_container_id")

        # perform healthcheck
        if perform_healthcheck "$new_container_ip:$BACKEND_PORT$BACKEND_HEALTH_URL"; then
            echo "🛠  Health check passed! Performing rolling update..."
            # Reload nginx to proxy requests to the new container.
            reload_nginx

            # Remove one of the old containers
            old_container_id=$(docker ps -f name="$BACKEND_SERVICE" -q | tail -n 1)
            docker stop "$old_container_id"
            docker rm "$old_container_id"

            docker compose up -d --no-deps --scale $BACKEND_SERVICE="$BACKEND_REPLICAS" --force-recreate "$BACKEND_SERVICE"
            reload_nginx
        else
            echo "❌ Health check failed! Rolling back..."
            docker stop "$new_container_id"
            docker rm "$new_container_id"
        fi

    else
        echo "ERROR: Could not get the latest container id."
        exit 1
    fi
}

# start the deployment process
running=$(docker compose -f "$COMPOSE_FILE" ps | wc -l)
if [[ "$running" -gt 1 ]]; then
    echo "Already running. Deploying the latest changes."
    deploy_backend
else
    echo "No running containers. Starting/recreating all the services"
    docker compose -f "$COMPOSE_FILE" up -d --build
fi
