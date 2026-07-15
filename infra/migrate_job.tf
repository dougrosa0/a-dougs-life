# Migrations run here — a Cloud Run Job on the VPC, so it can reach the private
# Postgres VM (a GitHub-hosted runner cannot). CI updates the image to the freshly
# built migrate image and executes it before shifting traffic. Terraform owns the
# job's existence/wiring; CI owns the image (ignore_changes below).
resource "google_cloud_run_v2_job" "migrate" {
  name     = "adl-migrate"
  location = var.region

  template {
    template {
      service_account = google_service_account.runtime.email
      max_retries     = 1

      vpc_access {
        network_interfaces {
          network    = google_compute_network.vpc.id
          subnetwork = google_compute_subnetwork.app.id
        }
        egress = "PRIVATE_RANGES_ONLY"
      }

      containers {
        # Placeholder; CI replaces this with the real migrate image per deploy.
        image = "us-docker.pkg.dev/cloudrun/container/hello"

        env {
          name = "DATABASE_URL"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.app["database-url"].secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].template[0].containers[0].image,
      client,
      client_version,
    ]
  }

  depends_on = [
    google_secret_manager_secret_version.app,
    google_secret_manager_secret_iam_member.runtime_access,
  ]
}
