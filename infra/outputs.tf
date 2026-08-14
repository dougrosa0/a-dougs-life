# These get copied into GitHub repo variables so CI can deploy.

output "cloud_run_url" {
  description = "Public URL of the Cloud Run service."
  value       = google_cloud_run_v2_service.app.uri
}

output "artifact_registry_repo" {
  description = "Docker image path prefix to push builds to."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}"
}

# The records to create in Cloudflare. Google returns these only after the
# mapping exists, so they are empty until the first successful apply.
output "dns_records" {
  description = "DNS records to add at the registrar, as type/name/value triples."
  value = {
    for k, m in {
      apex = google_cloud_run_domain_mapping.apex
      www  = google_cloud_run_domain_mapping.www
      } : k => [
      for r in m.status[0].resource_records : "${r.type}  ${coalesce(r.name, "@")}  ${r.rrdata}"
    ]
  }
}

output "wif_provider" {
  description = "Full resource name of the WIF provider, for the google-github-actions/auth step."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deployer_service_account" {
  description = "Email of the SA that GitHub Actions impersonates."
  value       = google_service_account.deployer.email
}
