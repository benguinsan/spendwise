# SpendWiseApp

Expense management app with:

- `frontend/`: Next.js (Amplify hosting)
- `backend/`: NestJS + Prisma (ECS Fargate)
- `infrastructure/`: Terraform (VPC, ALB, ECS, RDS, Cognito, Amplify, ECR)

## Cloud Architecture

![SpendWise AWS Architecture](assets/aws-architecture.jpg)

## Run Locally with Docker

### Option A: Full stack

```bash
docker compose -f docker-compose.yml up --build
```

- App via Nginx: `http://localhost:3000`
- Backend direct: `http://localhost:5001`

Stop:

```bash
docker compose -f docker-compose.yml down
```

Reset including volumes:

```bash
docker compose -f docker-compose.yml down -v
```

### Option B: App only (external DB)

```bash
docker compose -f docker-compose.app.yml up --build
```

## Backend deploy workflow (dev): Terraform apply → Docker push (ECR) → Migration

Run commands from the **repository root** unless noted. AWS CLI and Docker must use credentials for the **same AWS account** that owns the ECR repository and ECS cluster.

Set once:

```bash
export TF_DIR="infrastructure/environments/dev"
export TFVARS="$TF_DIR/terraform.tfvars"
```

### 1) Terraform apply

Creates/updates VPC, RDS, ECR, ECS task definition (image = `ecr_repository_url` + `ecs_backend_image_tag` from `terraform.tfvars`), Cognito, Amplify wiring, etc.

```bash
terraform -chdir="$TF_DIR" init
terraform -chdir="$TF_DIR" plan -var-file="$TFVARS"
terraform -chdir="$TF_DIR" apply -var-file="$TFVARS"
```

Destroy when needed:

```bash
terraform -chdir="$TF_DIR" destroy -var-file="$TFVARS"
```

**Outputs missing from state** (`terraform output -raw …` errors): refresh once, then re-run exports below.

```bash
terraform -chdir="$TF_DIR" apply -refresh-only -var-file="$TFVARS"
```

### 2) Docker build and push to ECR

The pushed image tag **must match** `ecs_backend_image_tag` in `terraform.tfvars` (also exposed as Terraform output `ecs_backend_image_tag`). Set that variable to a non-empty tag (for example `v1`) before relying on `export TAG=$(terraform output -raw ecs_backend_image_tag)`. If you change the tag, update `terraform.tfvars` and run **apply** again so the task definition points at the new tag.

Load values from Terraform:

```bash
export TAG=$(terraform -chdir="$TF_DIR" output -raw ecs_backend_image_tag)
export ECR_URL=$(terraform -chdir="$TF_DIR" output -raw ecr_repository_url)
export CLUSTER=$(terraform -chdir="$TF_DIR" output -raw ecs_cluster_name)
export SERVICE=$(terraform -chdir="$TF_DIR" output -raw ecs_service_name)
export TASK_FAMILY=$(terraform -chdir="$TF_DIR" output -raw ecs_task_definition_family)
export SUBNETS=$(terraform -chdir="$TF_DIR" output -raw ecs_private_app_subnet_ids_csv)
export ECS_SG=$(terraform -chdir="$TF_DIR" output -raw ecs_tasks_security_group_id)
export ASSIGN_PUBLIC=$(terraform -chdir="$TF_DIR" output -raw ecs_fargate_assign_public_ip)
export REGION=$(terraform -chdir="$TF_DIR" output -raw aws_region)
export REGISTRY="${ECR_URL%%/*}"
```

Login to ECR, build for Fargate (`linux/amd64`), tag, and push:

```bash
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

docker build --platform linux/amd64 -t "spendwise-backend:${TAG}" ./backend
docker tag "spendwise-backend:${TAG}" "${ECR_URL}:${TAG}"
docker push "${ECR_URL}:${TAG}"
```

After the **first** push (or whenever you overwrite the same tag with new layers), roll the service so tasks pull the image:

```bash
aws ecs update-service \
  --region "$REGION" \
  --cluster "$CLUSTER" \
  --service "$SERVICE" \
  --force-new-deployment
```

### 3) Database migration (one-off Fargate task)

Run after RDS exists and Terraform has registered the ECS task definition with `DATABASE_URL` (normal after apply with `create_rds = true`). The task below uses the **same task definition family** as the running backend service, so the container sees the **same `DATABASE_URL`** Terraform composed from the RDS password in **Secrets Manager** (via the `db_password_secret` module at apply time—not a hand-pasted password in the shell).

This runs **only** `prisma migrate deploy`. The backend `start.sh` may also run migrations on container start; use this block when you want an explicit migrate.

`backend/prisma/migrations` is a **single baseline** aligned with `schema.prisma`. If dev RDS has a broken `_prisma_migrations` history, reset once (e.g. `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`) via bastion/SSM, then run migrate again.

`REGION` and `ASSIGN_PUBLIC` are read from `terraform.tfvars` so they stay in sync with your deploy config; ECS identifiers come from Terraform state.

```bash
export TF_DIR="infrastructure/environments/dev"
export TFVARS="$TF_DIR/terraform.tfvars"

REGION=$(grep -E '^[[:space:]]*aws_region[[:space:]]*=' "$TFVARS" | head -1 | sed -E 's/.*"([^"]+)".*/\1/')
ASSIGN_PUBLIC=DISABLED
grep -E '^[[:space:]]*ecs_assign_public_ip[[:space:]]*=[[:space:]]*true' "$TFVARS" >/dev/null 2>&1 && ASSIGN_PUBLIC=ENABLED

export REGION ASSIGN_PUBLIC
export CLUSTER=$(terraform -chdir="$TF_DIR" output -raw ecs_cluster_name)
export TASK_FAMILY=$(terraform -chdir="$TF_DIR" output -raw ecs_task_definition_family)
export SUBNETS=$(terraform -chdir="$TF_DIR" output -raw ecs_private_app_subnet_ids_csv)
export ECS_SG=$(terraform -chdir="$TF_DIR" output -raw ecs_tasks_security_group_id)

export TASK_ARN=$(aws ecs run-task \
  --region "$REGION" \
  --cluster "$CLUSTER" \
  --launch-type FARGATE \
  --task-definition "$TASK_FAMILY" \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS}],securityGroups=[${ECS_SG}],assignPublicIp=${ASSIGN_PUBLIC}}" \
  --overrides '{"containerOverrides":[{"name":"backend","command":["npx","prisma","migrate","deploy"]}]}' \
  --query 'tasks[0].taskArn' \
  --output text)

aws ecs wait tasks-stopped --region "$REGION" --cluster "$CLUSTER" --tasks "$TASK_ARN"
aws ecs describe-tasks --region "$REGION" --cluster "$CLUSTER" --tasks "$TASK_ARN" \
  --query 'tasks[0].containers[0].exitCode' --output text
```

- Exit code `0` means success. Logs: `terraform -chdir="$TF_DIR" output -raw ecs_log_group`.
- If `REGION` is empty, ensure `aws_region` in `terraform.tfvars` is a quoted string (e.g. `"us-east-1"`) or set `REGION` manually.

After migrations (or any task-definition change outside this doc), you can force a deployment again with the same `aws ecs update-service … --force-new-deployment` command as in step 2.

### Dev Terraform outputs

Output names and descriptions are defined in `infrastructure/environments/dev/outputs.tf`. List values: `terraform -chdir="$TF_DIR" output` (add `-json` for scripts).

## Frontend (Amplify) Notes

- Amplify build config is defined in `amplify.yml`.
- For CI/CD: push branch -> open PR -> merge to tracked branch → Amplify auto rebuilds.
- **`NEXT_PUBLIC_*` is baked at build time** — after changing Amplify env vars (including API URL), trigger a new deployment.

### CloudFront in front of ALB (no custom domain)

Set **`enable_api_cloudfront = true`** in `infrastructure/environments/dev/terraform.tfvars` (see `variables.tf`). Terraform creates a CloudFront distribution with the **default** `https://dxxxx.cloudfront.net` certificate, origin = ALB (HTTP :80 unless the ALB already has HTTPS). `NEXT_PUBLIC_API_URL` becomes that HTTPS URL — **no ACM on ALB and no rented domain** required for the browser.

After `terraform apply`, **redeploy Amplify** so the client bundle picks up the new env var. Outputs: `api_cloudfront_url`, `api_cloudfront_domain_name`.

ECS receives **`CORS_ORIGIN`** = `https://<amplify-branch>.<amplify-default-domain>` so NestJS allows the Amplify origin. Do not add a second `CORS_ORIGIN` in `ecs_backend_environment` (duplicate env keys will fail).

### Amplify (HTTPS) calling ALB with your own domain (ACM)

Browsers block HTTP API calls from an HTTPS Amplify app (**mixed content**). Alternatively use **`alb_acm_certificate_arn`** (ACM in the **same region** as the ALB) for a hostname you control. Validate ACM via DNS at any DNS provider.

Then:

1. Add a **CNAME** from that hostname to the ALB DNS name (`alb_dns_name` from Terraform output).
2. Set **`alb_public_api_base_url`** in `terraform.tfvars` to `https://api.example.com` (same host as the cert, no trailing slash).
3. `terraform apply` — Terraform updates Amplify `NEXT_PUBLIC_API_URL`.
4. Run a **new Amplify build** so the frontend bundle picks up the URL.
