# Custom VPC (no auto subnets). Cloud Run reaches the Postgres VM over this
# network via Direct VPC egress.
resource "google_compute_network" "vpc" {
  name                    = "adl-vpc"
  auto_create_subnetworks = false
}

# Regional subnet shared by Cloud Run's egress interface and the DB VM.
resource "google_compute_subnetwork" "app" {
  name          = "adl-subnet"
  region        = var.region
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.10.0.0/24"

  # Lets the VM reach Google APIs (e.g. Secret Manager) privately.
  private_ip_google_access = true
}

# Postgres (5432) is reachable ONLY from inside the subnet — i.e. from Cloud
# Run's Direct VPC egress interface. Never from the public internet.
resource "google_compute_firewall" "postgres_from_subnet" {
  name      = "adl-allow-postgres-from-subnet"
  network   = google_compute_network.vpc.name
  direction = "INGRESS"

  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }

  source_ranges = [google_compute_subnetwork.app.ip_cidr_range]
  target_tags   = ["postgres"]
}

# SSH only through Google's IAP TCP-forwarding range, so port 22 is never open
# to the public even though the VM has an external IP. Connect with:
#   gcloud compute ssh adl-postgres --tunnel-through-iap
resource "google_compute_firewall" "ssh_from_iap" {
  name      = "adl-allow-ssh-iap"
  network   = google_compute_network.vpc.name
  direction = "INGRESS"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["35.235.240.0/20"] # Google IAP range
  target_tags   = ["postgres"]
}
