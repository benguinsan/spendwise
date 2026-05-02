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

## Deploy AWS Infrastructure (Terraform)

Run from project root:

```bash
terraform -chdir="infrastructure/environments/dev" init
terraform -chdir="infrastructure/environments/dev" plan -var-file="terraform.tfvars"
terraform -chdir="infrastructure/environments/dev" apply -var-file="terraform.tfvars"
```

Destroy when needed:

```bash
terraform -chdir="infrastructure/environments/dev" destroy -var-file="terraform.tfvars"
```

## Build and Push Backend Image to ECR

Run from project root. Use the same `aws_region` as in `infrastructure/environments/dev/terraform.tfvars` for `REGION` below.

1) Read values from Terraform (ECR, ECS, networking):

```bash
terraform -chdir="infrastructure/environments/dev" output -raw ecr_repository_url
terraform -chdir="infrastructure/environments/dev" output -raw ecs_cluster_name
terraform -chdir="infrastructure/environments/dev" output -raw ecs_service_name
terraform -chdir="infrastructure/environments/dev" output -raw ecs_task_definition_family
terraform -chdir="infrastructure/environments/dev" output -raw ecs_private_app_subnet_ids_csv
terraform -chdir="infrastructure/environments/dev" output -raw ecs_tasks_security_group_id
terraform -chdir="infrastructure/environments/dev" output -raw ecs_fargate_assign_public_ip
```

2) Set shell variables (replace `TAG` so it matches `ecs_backend_image_tag` in `terraform.tfvars`, or update that variable after changing the tag):

```bash
export TF_DIR="infrastructure/environments/dev"
export TAG=v3
export ECR_URL=$(terraform -chdir="$TF_DIR" output -raw ecr_repository_url)
export CLUSTER=$(terraform -chdir="$TF_DIR" output -raw ecs_cluster_name)
export SERVICE=$(terraform -chdir="$TF_DIR" output -raw ecs_service_name)
export TASK_FAMILY=$(terraform -chdir="$TF_DIR" output -raw ecs_task_definition_family)
export SUBNETS=$(terraform -chdir="$TF_DIR" output -raw ecs_private_app_subnet_ids_csv)
export ECS_SG=$(terraform -chdir="$TF_DIR" output -raw ecs_tasks_security_group_id)
export ASSIGN_PUBLIC=$(terraform -chdir="$TF_DIR" output -raw ecs_fargate_assign_public_ip)
export REGION=<aws-region>
export REGISTRY="${ECR_URL%%/*}"
```

3) Login Docker to ECR:

```bash
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"
```

4) Build and push image (`linux/amd64` matches the backend Dockerfile):

```bash
docker build --platform linux/amd64 -t "spendwise-backend:${TAG}" ./backend
docker tag "spendwise-backend:${TAG}" "${ECR_URL}:${TAG}"
docker push "${ECR_URL}:${TAG}"
```

5) If `TAG` changed, set `ecs_backend_image_tag` in `terraform.tfvars` to the same value, then apply:

```bash
terraform -chdir="infrastructure/environments/dev" apply -var-file="terraform.tfvars"
```

## Run Database Migration (ECS one-off task)

After RDS is up and the task definition includes `DATABASE_URL`, you can run Prisma against the live DB. The backend `start.sh` also runs `prisma migrate deploy` on each container start; use this when you want migrations only.

1) Re-use `REGION`, `CLUSTER`, `TASK_FAMILY`, `SUBNETS`, `ECS_SG`, `ASSIGN_PUBLIC` from the section above (same `export` block).

2) Start the task and wait until it stops:

```bash
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

- Exit code `0` means success. On failure, inspect the stopped task and logs: `terraform -chdir="infrastructure/environments/dev" output -raw ecs_log_group`.

3) Force ECS to roll out tasks (new image or new task definition):

```bash
aws ecs update-service \
  --region "$REGION" \
  --cluster "$CLUSTER" \
  --service "$SERVICE" \
  --force-new-deployment
```

## Frontend (Amplify) Notes

- Amplify build config is defined in `amplify.yml`.
- For CI/CD: push branch -> open PR -> merge to tracked branch -> Amplify auto rebuilds.
- Ensure `NEXT_PUBLIC_API_URL` points to the intended backend endpoint for each environment.
