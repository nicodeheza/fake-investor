#!/bin/bash

COMPOSE="/usr/local/bin/docker-compose --ansi never"
DOCKER="/usr/bin/docker"

cd /home/nicolasdeheza/fake-investor/
$COMPOSE run certbot renew  && $COMPOSE kill -s SIGHUP nginx
$DOCKER system prune -a