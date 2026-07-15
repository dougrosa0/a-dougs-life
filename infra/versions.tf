terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # Remote state in the bucket created by infra/bootstrap.
  backend "gcs" {
    bucket = "a-dougs-life-tfstate"
    prefix = "infra"
  }
}
