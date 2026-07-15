terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # Bootstrap deliberately uses LOCAL state (the default backend): it is what
  # *creates* the remote-state bucket, so it can't store its own state there.
  # This tiny state file is applied by hand once and rarely changes.
}
