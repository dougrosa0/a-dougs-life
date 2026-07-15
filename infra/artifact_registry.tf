resource "google_artifact_registry_repository" "app" {
  location      = var.region
  repository_id = "adl"
  format        = "DOCKER"
  description   = "Container images for a-dougs-life"
}
