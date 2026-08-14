variable "project_id" {
  description = "GCP project ID."
  type        = string
  default     = "a-dougs-life"
}

variable "region" {
  description = "Region for Cloud Run, Artifact Registry, and the WIF pool."
  type        = string
  default     = "us-central1"
}

variable "domain" {
  description = "Apex domain the site is served from. Must be verified in Search Console first."
  type        = string
  default     = "a-dougs-life.com"
}

variable "github_repo" {
  description = "owner/repo allowed to impersonate the deployer SA via Workload Identity Federation."
  type        = string
  default     = "dougrosa0/a-dougs-life"
}
