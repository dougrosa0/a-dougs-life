resource "google_cloud_run_v2_service" "app" {
  name     = "a-dougs-life"
  location = var.region

  ingress = "INGRESS_TRAFFIC_ALL" # public site

  template {
    service_account = google_service_account.runtime.email

    scaling {
      min_instance_count = 0 # scale to zero — cheapest for low traffic
      max_instance_count = 3
    }

    # No vpc_access block: the site is entirely static content compiled into
    # the image, so there is nothing private to reach. That is also why there
    # are no env vars or secrets here; Cloud Run injects PORT and that is all
    # server.js needs.

    containers {
      # Placeholder public image. CI/CD owns the real image — see the
      # ignore_changes lifecycle block below.
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      ports {
        container_port = 8080 # Cloud Run injects PORT=8080; server.js honors it
      }

      startup_probe {
        http_get {
          path = "/healthz"
        }
        initial_delay_seconds = 5
        period_seconds        = 5
        failure_threshold     = 6
      }

      liveness_probe {
        http_get {
          path = "/healthz"
        }
      }
    }
  }

  # Ownership split: Terraform owns the service's existence; CI/CD owns the
  # deployed image and traffic split. Without ignoring the image,
  # `terraform apply` would revert CD's deploy back to the placeholder.
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }
}

# Public site: allow unauthenticated requests.
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.app.name
  location = google_cloud_run_v2_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
