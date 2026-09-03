# infra (main module)

The whole a-dougs-life cloud footprint. State lives remotely in the
`a-dougs-life-tfstate` bucket, which `infra/bootstrap` creates, so run that module
first.

The site is static content compiled into a container image. There is no database, no
VPC, and no secret material at runtime, which is why this module is as short as it is.

## What it creates

- **Cloud Run v2** (`cloudrun.tf`) is the service itself. Public ingress, scales to
  zero, capped at three instances. It starts life on a placeholder image; the
  `ignore_changes` block hands ownership of the image and the traffic split to CI/CD.
- **Domain mapping** (`domain.tf`) serves the apex and `www` from the same service,
  with Google-managed certificates.
- **Artifact Registry** (`artifact_registry.tf`) is the `adl` Docker repository.
- **IAM** (`iam.tf`) is the `adl-run` runtime service account, the `adl-deployer` CI
  service account, and the Artifact Registry read grant the Cloud Run service agent
  needs to pull images.
- **Workload Identity Federation** (`workload_identity.tf`) trusts GitHub's OIDC
  issuer, scoped to `dougrosa0/a-dougs-life` and bound to the deployer account. There
  are no JSON keys anywhere.

## Cost

Roughly a dollar a month, essentially all of it Artifact Registry storage. Cloud Run
scales to zero and the free tier absorbs the traffic; the domain mapping is free, which
is the reason it is used instead of a global external load balancer.

## Apply

Applied by hand, from a laptop. There is no Terraform pipeline.

```bash
terraform init      # uses the gcs backend
terraform plan
terraform apply
```

`terraform.tfvars` is gitignored. It is not needed for a normal apply; every variable
in `variables.tf` has a working default.

## Two things that will bite you

**The domain must be verified before the mapping will apply.** Ownership is proved with
a TXT record through Search Console, and Terraform cannot do that step for you. Without
it, `apply` fails with a 403 on the domain mapping.

**In Cloudflare, the DNS records must be grey-cloud (DNS only).** Proxying them
intercepts Google's domain-control validation and the managed certificate never issues.

## Outputs

`terraform output` prints the Cloud Run URL, the Artifact Registry path, the WIF
provider resource name, the deployer service account email, and the DNS records to
create at the registrar. The first four are copied into GitHub repository variables so
the workflow can deploy; they are not secrets, because WIF is keyless.
