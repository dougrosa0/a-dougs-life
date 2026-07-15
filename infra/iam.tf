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

# Identity for the Postgres VM.
resource "google_service_account" "db_vm" {
  account_id   = "adl-db"
  display_name = "a-dougs-life Postgres VM"
}

# --- Runtime SA permissions -------------------------------------------------

# Read access scoped per-secret to just the four secrets the app consumes
# (not db-password, which only the VM needs).
resource "google_secret_manager_secret_iam_member" "runtime_access" {
  for_each  = local.app_secrets
  secret_id = google_secret_manager_secret.app[each.key].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
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

# --- DB VM SA permissions ---------------------------------------------------

# The VM's startup script reads the DB password from Secret Manager.
resource "google_secret_manager_secret_iam_member" "db_vm_password" {
  secret_id = google_secret_manager_secret.app["db-password"].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.db_vm.email}"
}

resource "google_project_iam_member" "db_vm_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.db_vm.email}"
}

# --- Cloud Run image pulls --------------------------------------------------

data "google_project" "this" {
  project_id = var.project_id
}

# The Cloud Run service agent pulls the app/migrate images. Same-project access
# is usually auto-granted, but making it explicit avoids first-deploy image-pull
# failures. Scoped to just the adl repo.
resource "google_artifact_registry_repository_iam_member" "run_agent_reader" {
  location   = google_artifact_registry_repository.app.location
  repository = google_artifact_registry_repository.app.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:service-${data.google_project.this.number}@serverless-robot-prod.iam.gserviceaccount.com"
}
