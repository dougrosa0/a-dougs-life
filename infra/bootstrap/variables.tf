variable "project_id" {
  description = "GCP project ID hosting a-dougs-life."
  type        = string
  default     = "a-dougs-life"
}

variable "region" {
  description = "Default region for regional resources (this state bucket, and later Cloud Run / Cloud SQL in the main module)."
  type        = string
  default     = "us-central1"
}

variable "state_bucket_name" {
  description = "Globally-unique name for the GCS bucket holding the main infra/ module's remote state. If the default is already taken, append the project number."
  type        = string
  default     = "a-dougs-life-tfstate"
}
