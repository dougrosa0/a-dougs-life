#!/bin/bash
# Provisions Postgres on first boot. Config values arrive via instance metadata;
# the DB password is pulled from Secret Manager using the VM's SA token so it is
# never stored in plaintext metadata. Idempotent: a marker file short-circuits
# re-runs on reboot.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

MARKER=/var/lib/adl-postgres-initialized
if [ -f "$MARKER" ]; then exit 0; fi

md() {
  curl -s -H "Metadata-Flavor: Google" \
    "http://metadata.google.internal/computeMetadata/v1/$1"
}

PROJECT_ID=$(md "project/project-id")
DB_NAME=$(md "instance/attributes/db-name")
DB_USER=$(md "instance/attributes/db-user")
SUBNET_CIDR=$(md "instance/attributes/subnet-cidr")

apt-get update
apt-get install -y postgresql jq

# Pull the app DB password from Secret Manager via the VM service account.
TOKEN=$(md "instance/service-accounts/default/token" | jq -r .access_token)
DB_PASSWORD=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
  "https://secretmanager.googleapis.com/v1/projects/${PROJECT_ID}/secrets/db-password/versions/latest:access" \
  | jq -r '.payload.data' | base64 -d)

# Create the app role and database if they don't exist. The password is
# base64url (no quotes/backslashes), so it's safe inside the SQL string literal.
sudo -u postgres psql -v ON_ERROR_STOP=1 -c \
  "DO \$do\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${DB_USER}') THEN CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}'; END IF; END \$do\$;"
sudo -u postgres psql -v ON_ERROR_STOP=1 -tc \
  "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}"

# Listen on all interfaces; restrict access to the Cloud Run subnet via pg_hba.
# The firewall additionally blocks 5432 from anywhere but the subnet.
PG_CONF=$(sudo -u postgres psql -tAc "SHOW config_file")
PG_DIR=$(dirname "$PG_CONF")
echo "listen_addresses = '*'" >> "$PG_CONF"
echo "host ${DB_NAME} ${DB_USER} ${SUBNET_CIDR} scram-sha-256" >> "${PG_DIR}/pg_hba.conf"
systemctl restart postgresql

touch "$MARKER"
