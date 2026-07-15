# infra (main module)

The full a-dougs-life cloud footprint, with **remote state** in the
`a-dougs-life-tfstate` bucket (created by `infra/bootstrap`). Run
`infra/bootstrap` first.

## What it creates

- **Networking** (`network.tf`) — a custom VPC, a regional subnet for Cloud Run
  Direct VPC egress, and firewall rules (Postgres 5432 reachable only from the
  subnet; SSH 22 only via Google's IAP range).
- **Database** (`database.tf`, `scripts/postgres-startup.sh`) — self-managed
  Postgres on an Always-Free `e2-micro` VM. A startup script installs Postgres,
  pulls the DB password from Secret Manager, and creates the `a_dougs_life`
  database + `app` role. The VM has a reserved private IP (stable DATABASE_URL
  host) and an ephemeral external IP used only for the one-time package install.
- **Artifact Registry** (`artifact_registry.tf`) — the `adl` Docker repo.
- **Secret Manager** (`secrets.tf`) — `database-url` (composed by Terraform),
  `session-secret`, `admin-password-hash`, `admin-password-salt`, and
  `db-password` (read by the VM).
- **Cloud Run v2** (`cloudrun.tf`) — the service, reaching Postgres over the VPC
  via Direct VPC egress, with secrets injected as env. Starts on a placeholder
  image; `ignore_changes` hands image/traffic ownership to CI/CD.
- **IAM** (`iam.tf`) — the `adl-run` runtime SA, `adl-deployer` CI SA, and
  `adl-db` VM SA, each least-privilege.
- **Workload Identity Federation** (`workload_identity.tf`) — GitHub OIDC trust
  scoped to `dougrosa0/a-dougs-life`, bound to the deployer SA. No JSON keys.

## Cost

~$3–4/mo, essentially all from the VM's external IPv4 charge. The `e2-micro`
compute and 30 GB standard disk are Always-Free; Cloud Run scales to zero.

## Apply (first time, by hand)

```bash
cp terraform.tfvars.example terraform.tfvars   # then fill in the 4 secret values
terraform init      # uses the gcs backend
terraform plan
terraform apply     # VM boots + installs Postgres over ~1-2 min after apply
```

`terraform.tfvars` is gitignored — never commit real secret values.

## Operating the DB

- SSH (no public port 22): `gcloud compute ssh adl-postgres --zone us-central1-a --tunnel-through-iap`
- Postgres version is whatever Debian 12 ships (15.x). Schema (SERIAL,
  timestamptz) is version-agnostic.
- **Durability is your responsibility now** (self-managed). Data lives on the
  VM boot disk. A follow-up worth doing: a nightly `pg_dump` to a GCS bucket.

## Outputs → GitHub (Phase 4)

`terraform output` prints the Cloud Run URL, Artifact Registry path, DB VM name,
DB private IP, WIF provider resource name, and deployer SA email.

## ⚠️ Phase 5 note: CI migrations vs. private DB

The DB is only reachable from inside the VPC, so a GitHub-hosted runner can't run
migrations against it directly. Phase 5 will run migrations from inside the VPC —
most likely a **Cloud Run Job** using Direct VPC egress (needs an image that
includes `node-pg-migrate`, which is currently a devDependency excluded from the
runtime image). Flagging so the private-DB choice is deliberate.
