# Custom domain for the site.
#
# Cloud Run's own domain mapping is used rather than a global external load
# balancer. The load balancer is more capable but its forwarding rule alone
# costs more per month than everything else here combined, and this site is
# static content served from one region.
#
# Prerequisite: the domain must be verified to the Google account running
# Terraform, via Search Console. Terraform cannot do that step; it is a TXT
# record proving ownership. Without it, apply fails with a 403 on the mapping.
#
# Certificates are Google-managed and provisioned automatically once the DNS
# records below resolve. In Cloudflare the records must be "DNS only" (grey
# cloud): proxying them intercepts Google's domain-control validation and the
# certificate never issues.

resource "google_cloud_run_domain_mapping" "apex" {
  name     = var.domain
  location = var.region

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.app.name
  }
}

# Serves the same site at www, so a typed "www." does not dead-end.
resource "google_cloud_run_domain_mapping" "www" {
  name     = "www.${var.domain}"
  location = var.region

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.app.name
  }
}
