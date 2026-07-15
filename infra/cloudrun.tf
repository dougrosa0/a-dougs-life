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

    # Direct VPC egress: how Cloud Run reaches the Postgres VM's private IP.
    vpc_access {
      network_interfaces {
        network    = google_compute_network.vpc.id
        subnetwork = google_compute_subnetwork.app.id
      }
      egress = "PRIVATE_RANGES_ONLY"
    }

    containers {
      # Placeholder public image. CI/CD owns the real image — see the
      # ignore_changes lifecycle block below.
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      ports {
        container_port = 8080 # Cloud Run injects PORT=8080; server.js honors it
      }

      # Non-secret env.
      env {
        name  = "ADMIN_USERNAME"
        value = var.admin_username
      }
      env {
        name  = "SECURE_COOKIES"
        value = "true" # served over HTTPS
      }

      # Secret env, sourced from Secret Manager.
      dynamic "env" {
        for_each = {
          DATABASE_URL        = "database-url"
          SESSION_SECRET      = "session-secret"
          ADMIN_PASSWORD_HASH = "admin-password-hash"
          ADMIN_PASSWORD_SALT = "admin-password-salt"
        }
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.app[env.value].secret_id
              version = "latest"
            }
          }
        }
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

  # Ownership split: Terraform owns the service's existence / networking /
  # secrets; CI/CD owns the deployed image and traffic split. Without ignoring
  # the image, `terraform apply` would revert CD's deploy back to the placeholder.
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }

  depends_on = [
    google_secret_manager_secret_version.app,
    google_secret_manager_secret_iam_member.runtime_access,
  ]
}

# Public site: allow unauthenticated requests.
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.app.name
  location = google_cloud_run_v2_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
