# App secrets in Secret Manager. database-url is composed by Terraform (it embeds
# the VM's private IP, known only after the address is reserved); the rest come
# from sensitive variables (gitignored terraform.tfvars / TF_VAR_* in CI).
locals {
  # Injected into Cloud Run as env vars.
  app_secrets = {
    "database-url"        = local.database_url
    "session-secret"      = var.session_secret
    "admin-password-hash" = var.admin_password_hash
    "admin-password-salt" = var.admin_password_salt
  }

  # Everything to store, including the raw DB password the VM reads at boot.
  all_secrets = merge(local.app_secrets, {
    "db-password" = var.db_password
  })
}

resource "google_secret_manager_secret" "app" {
  for_each  = local.all_secrets
  secret_id = each.key

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "app" {
  for_each    = local.all_secrets
  secret      = google_secret_manager_secret.app[each.key].id
  secret_data = each.value
}
