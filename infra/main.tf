provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  # DATABASE_URL the app (pg) reads. Points at the Postgres VM's reserved private
  # IP; Cloud Run reaches it over the VPC via Direct VPC egress. db_password is
  # base64url, so it needs no URL-encoding.
  database_url = "postgresql://${local.db_user}:${var.db_password}@${google_compute_address.db_private.address}:5432/${local.db_name}"
}
