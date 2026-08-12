# --- Service accounts -------------------------------------------------------

# Runtime identity for the Cloud Run service (the app's own identity).
resource "google_service_account" "runtime" {
  account_id   = "adl-run"
  display_name = "a-dougs-life Cloud Run runtime"
}

# CI/CD identity, assumed from GitHub Actions via Workload Identity Federation.
resource "google_service_account" "deployer" {
  account_id   = "adl-deployer"
  display_name = "a-dougs-life GitHub Actions deployer"
}

# --- Deployer SA permissions ------------------------------------------------

locals {
  deployer_roles = [
    "roles/run.developer",           # deploy revisions + shift traffic
    "roles/artifactregistry.writer", # push images
  ]
}

resource "google_project_iam_member" "deployer" {
  for_each = toset(local.deployer_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.deployer.email}"
}

# Deploying a revision that runs *as* the runtime SA requires actAs on it.
resource "google_service_account_iam_member" "deployer_actas_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}

# --- Cloud Run image pulls --------------------------------------------------

data "google_project" "this" {
  project_id = var.project_id
}

# The Cloud Run service agent pulls the app image. Same-project access is
# usually auto-granted, but making it explicit avoids first-deploy image-pull
# failures. Scoped to just the adl repo.
resource "google_artifact_registry_repository_iam_member" "run_agent_reader" {
  location   = google_artifact_registry_repository.app.location
  repository = google_artifact_registry_repository.app.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:service-${data.google_project.this.number}@serverless-robot-prod.iam.gserviceaccount.com"
}
