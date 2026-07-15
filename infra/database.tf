# Self-managed Postgres on a free-tier e2-micro VM (Always Free in us-central1).
# Cheaper than Cloud SQL: only the external IPv4 (~$3-4/mo) is billed. The app
# reaches it over the VPC private IP via Cloud Run Direct VPC egress; Postgres is
# never exposed publicly (see firewall rules in network.tf).

locals {
  db_name = "a_dougs_life"
  db_user = "app"
}

# Reserved internal IP so DATABASE_URL has a stable host.
resource "google_compute_address" "db_private" {
  name         = "adl-db-private-ip"
  region       = var.region
  subnetwork   = google_compute_subnetwork.app.id
  address_type = "INTERNAL"
}

resource "google_compute_instance" "db" {
  name         = "adl-postgres"
  machine_type = var.vm_machine_type
  zone         = var.zone
  tags         = ["postgres"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = var.boot_disk_size
      type  = "pd-standard" # standard disk keeps it within the Always Free tier
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.app.id
    network_ip = google_compute_address.db_private.address

    # Ephemeral external IP: outbound only, so the startup script can apt-install
    # Postgres. Inbound is governed entirely by the firewall rules.
    access_config {}
  }

  service_account {
    email  = google_service_account.db_vm.email
    scopes = ["cloud-platform"] # actual access is bounded by the SA's IAM roles
  }

  metadata = {
    startup-script = file("${path.module}/scripts/postgres-startup.sh")
    db-name        = local.db_name
    db-user        = local.db_user
    subnet-cidr    = google_compute_subnetwork.app.ip_cidr_range
  }

  # Let config changes apply via stop/start instead of forcing a rebuild (which
  # would wipe the boot-disk data).
  allow_stopping_for_update = true

  depends_on = [
    google_secret_manager_secret_version.app, # db-password must exist first
  ]
}
