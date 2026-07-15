variable "project_id" {
  description = "GCP project ID."
  type        = string
  default     = "a-dougs-life"
}

variable "region" {
  description = "Region for Cloud Run, Cloud SQL, Artifact Registry, and the VPC subnet."
  type        = string
  default     = "us-central1"
}

variable "github_repo" {
  description = "owner/repo allowed to impersonate the deployer SA via Workload Identity Federation."
  type        = string
  default     = "dougrosa0/a-dougs-life"
}

variable "admin_username" {
  description = "Admin login username (not a secret)."
  type        = string
  default     = "doug"
}

# --- Postgres VM (Always Free e2-micro in us-central1/us-west1/us-east1) -----
variable "zone" {
  description = "Zone for the DB VM. Must be in an Always-Free region to stay free."
  type        = string
  default     = "us-central1-a"
}

variable "vm_machine_type" {
  description = "DB VM machine type. e2-micro is Always-Free-tier eligible."
  type        = string
  default     = "e2-micro"
}

variable "boot_disk_size" {
  description = "DB VM boot disk size in GB (standard PD). Free tier covers up to 30 GB-months."
  type        = number
  default     = 30
}

# --- Secrets (sensitive; populate via a gitignored terraform.tfvars) --------
variable "db_password" {
  description = "Password for the 'app' Cloud SQL user. Also embedded into the composed DATABASE_URL secret."
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "Express session cookie signing secret (>= 32 random bytes, hex)."
  type        = string
  sensitive   = true
}

variable "admin_password_hash" {
  description = "scrypt hash of the admin password, from `npm run create-admin`."
  type        = string
  sensitive   = true
}

variable "admin_password_salt" {
  description = "scrypt salt of the admin password, from `npm run create-admin`."
  type        = string
  sensitive   = true
}
