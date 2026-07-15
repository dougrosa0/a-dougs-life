output "state_bucket_name" {
  description = "Name of the GCS remote-state bucket. Use this as the backend `bucket` in the main infra/ module."
  value       = google_storage_bucket.tf_state.name
}

output "enabled_services" {
  description = "GCP APIs enabled by this bootstrap module."
  value       = sort([for s in google_project_service.enabled : s.service])
}
