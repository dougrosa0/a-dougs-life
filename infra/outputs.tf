# These get copied into GitHub repo secrets/variables (Phase 4) so CI can deploy.

output "cloud_run_url" {
  description = "Public URL of the Cloud Run service."
  value       = google_cloud_run_v2_service.app.uri
}

output "artifact_registry_repo" {
  description = "Docker image path prefix to push builds to."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}"
}

output "db_vm_name" {
  description = "Name of the Postgres VM (for gcloud compute ssh --tunnel-through-iap)."
  value       = google_compute_instance.db.name
}

output "db_private_ip" {
  description = "Reserved private IP the app connects to over the VPC."
  value       = google_compute_address.db_private.address
}

output "wif_provider" {
  description = "Full resource name of the WIF provider, for the google-github-actions/auth step."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deployer_service_account" {
  description = "Email of the SA that GitHub Actions impersonates."
  value       = google_service_account.deployer.email
}
