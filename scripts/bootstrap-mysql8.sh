#!/usr/bin/env bash

set -euo pipefail

CONTAINER_NAME="${CONTAINER_NAME:-database_dropstation}"
DB_NAME="${DB_NAME:-dropstation}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-gotechnies}"

mysql_exec() {
  docker exec -i "${CONTAINER_NAME}" mysql -uroot "-p${MYSQL_ROOT_PASSWORD}" "$@"
}

mysql_exec -e "DROP DATABASE IF EXISTS \`${DB_NAME}\`; CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql_exec "${DB_NAME}" < backend/inc/sql/dump231001.sql
mysql_exec "${DB_NAME}" < backend/inc/sql/mysql8_compat.sql
mysql_exec "${DB_NAME}" < backend/inc/sql/20250802_add_more_fields.sql
mysql_exec "${DB_NAME}" < backend/inc/sql/20260307_align_openapi_schema.sql
mysql_exec "${DB_NAME}" < backend/inc/sql/20260308_add_user_auth_fields.sql

echo "MySQL 8 bootstrap completed for database '${DB_NAME}'."
