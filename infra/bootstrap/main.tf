provider "google" {
  project = var.project_id
  region  = var.region
}

# --- APIs -------------------------------------------------------------------
# Every API the whole a-dougs-life deployment needs, enabled once here so the
# main infra/ module and CI can assume they already exist. The first six are the
# ones called out in the plan; the rest are practically required by the main
# module (private-IP Cloud SQL, Terraform-managed IAM, WIF, and this bucket).
#
# disable_on_destroy = false: destroying the bootstrap module must NOT turn these
# APIs back off, or it would break the running service and the main module's state.
locals {
  services = [
    "run.googleapis.com",                  # Cloud Run
    "sqladmin.googleapis.com",             # Cloud SQL Admin
    "artifactregistry.googleapis.com",     # Artifact Registry
    "secretmanager.googleapis.com",        # Secret Manager
    "iam.googleapis.com",                  # IAM (service accounts, roles)
    "servicenetworking.googleapis.com",    # private services access -> Cloud SQL private IP
    "compute.googleapis.com",              # VPC, private IP range, Direct VPC egress
    "cloudresourcemanager.googleapis.com", # project-level IAM bindings via Terraform
    "iamcredentials.googleapis.com",       # STS token exchange for Workload Identity Federation
    "storage.googleapis.com",              # the Terraform remote-state bucket below
  ]
}

resource "google_project_service" "enabled" {
  for_each = toset(local.services)

  project = var.project_id
  service = each.value

  disable_on_destroy = false
}

# --- Remote-state bucket ----------------------------------------------------
# Backend bucket for the main infra/ module. Versioned so state history is kept;
# uniform access + enforced public-access-prevention because Terraform state holds
# secret values (session secret, DB URL, password hashes) in plaintext and must
# never be world-readable. force_destroy = false so `terraform destroy` here can
# never silently wipe the main module's state.
resource "google_storage_bucket" "tf_state" {
  name     = var.state_bucket_name
  project  = var.project_id
  location = var.region

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 10
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.enabled]
}
