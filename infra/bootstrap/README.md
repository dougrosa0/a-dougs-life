# infra/bootstrap

One-time, hand-applied Terraform that prepares the GCP project for the main
`infra/` module. It has **local state** (there's no remote bucket yet — this is
what creates it) and does two things:

1. Enables every GCP API the deployment needs (Cloud Run, Cloud SQL Admin,
   Artifact Registry, Secret Manager, IAM, Service Networking, plus Compute /
   Resource Manager / IAM Credentials / Storage that the main module relies on).
2. Creates the versioned, private GCS bucket that the main `infra/` module uses
   as its remote-state backend.

## Prerequisites

- `gcloud auth application-default login` has been run (Terraform uses ADC).
- The project exists and billing is enabled. Project ID: `a-dougs-life`.

## Apply

```bash
cd infra/bootstrap
terraform init
terraform plan
terraform apply
```

Defaults (project `a-dougs-life`, region `us-central1`, bucket
`a-dougs-life-tfstate`) work as-is. To override, copy
`terraform.tfvars.example` to `terraform.tfvars`.

If `apply` fails because the bucket name is globally taken, set
`state_bucket_name` to something unique (e.g. append the project number).

## Output

`terraform output state_bucket_name` — plug this into the `backend "gcs"` block
of the main `infra/` module (Phase 3).

## Note on state

`terraform.tfstate` here is local and tiny. It's gitignored. Because it only
tracks API enablement + an empty bucket (no secrets), losing it is low-stakes —
re-running `apply` reconciles. Do **not** run `terraform destroy` casually: the
bucket holds the main module's state.
