data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = slice(data.aws_availability_zones.available.names, 0, 2)
  # Build DATABASE_URL for the Cognito PostConfirmation Lambda.
  cognito_post_confirmation_database_url = var.create_rds && module.rds.db_instance_endpoint != null ? "postgresql://${var.db_username}:${var.db_password}@${module.rds.db_instance_endpoint}/${var.db_name}?sslmode=no-verify&schema=public" : null
  # Next.js frontend needs backend base URL for calls to /auth, /users, /wallets, ...
  frontend_api_url = "http://${module.alb.alb_dns_name}"
  # Application Auto Scaling — ALBRequestCountPerTarget (suffix sau loadbalancer/ + targetgroup/...)
  ecs_alb_request_count_resource_label = format(
    "%s/targetgroup/%s",
    regex(":loadbalancer/(.+)$", module.alb.alb_arn)[0],
    regex(":targetgroup/(.+)$", module.alb.target_group_arn)[0],
  )
  # Compose ECS env dynamically from module outputs to avoid hard-coded Cognito values.
  ecs_backend_environment = concat(
    var.create_rds && module.rds.db_instance_endpoint != null ? [
      {
        name  = "DATABASE_URL"
        value = "postgresql://${var.db_username}:${var.db_password}@${module.rds.db_instance_endpoint}/${var.db_name}?sslmode=no-verify&schema=public"
      }
    ] : [],
    var.ecs_backend_environment,
    [
      { name = "COGNITO_REGION", value = var.aws_region },
      { name = "COGNITO_USER_POOL_ID", value = module.cognito.user_pool_id },
      { name = "COGNITO_CLIENT_ID", value = module.cognito.user_pool_client_id },
    ]
  )
}

module "vpc" {
  source = "../../modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  availability_zones = local.azs
  enable_nat_gateway = var.enable_nat_gateway
}

module "security_groups" {
  source = "../../modules/security_groups"

  project_name              = var.project_name
  environment               = var.environment
  vpc_id                    = module.vpc.vpc_id
  app_container_port        = var.app_container_port
  enable_bastion_rds_access = var.create_bastion && var.create_rds
}

module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

module "amplify" {
  source = "../../modules/amplify"

  project_name = var.project_name
  environment  = var.environment

  repository_url = var.amplify_repository_url
  access_token   = var.amplify_access_token
  branch_name    = var.amplify_branch_name

  # Monorepo: amplify sẽ mặc định build từ repo root.
  # Vì frontend nằm ở ./frontend nên set appRoot để Amplify build đúng.
  build_spec = <<-EOF
version: 1
applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci --legacy-peer-deps
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
        discard-paths: yes
      cache:
        paths:
          - node_modules/**/*
EOF

  # Expose backend URL to the Next.js build (NEXT_PUBLIC_*).
  app_environment_variables = {
    AMPLIFY_MONOREPO_APP_ROOT = "frontend"
    NEXT_PUBLIC_API_URL = local.frontend_api_url
  }
}

module "cognito" {
  source = "../../modules/cognito"

  project_name = var.project_name
  environment  = var.environment

  # Phase strategy:
  # - create_rds=false: only create Cognito (trigger disabled)
  # - create_rds=true: enable PostConfirmation trigger to upsert into DB
  enable_post_confirmation_trigger = var.create_rds
  post_confirmation_database_url   = local.cognito_post_confirmation_database_url
  post_confirmation_subnet_ids     = module.vpc.private_data_subnet_ids
  # RDS SG allows Postgres inbound only from ECS tasks SG;
  # reuse the same SG for Lambda so it can reach RDS.
  post_confirmation_security_group_ids = [module.security_groups.ecs_tasks_security_group_id]
}

module "monitoring" {
  source = "../../modules/monitoring"

  project_name = var.project_name
  environment  = var.environment
}

module "alb" {
  source = "../../modules/alb"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  alb_security_group_id = module.security_groups.alb_security_group_id
  container_port        = var.app_container_port
  health_check_path     = var.alb_health_check_path
}

module "ecs" {
  source = "../../modules/ecs"

  project_name = var.project_name
  environment  = var.environment

  private_subnet_ids               = module.vpc.private_app_subnet_ids
  ecs_tasks_security_group_id      = module.security_groups.ecs_tasks_security_group_id
  target_group_arn                 = module.alb.target_group_arn
  container_image                  = "${module.ecr.repository_url}:${var.ecs_backend_image_tag}"
  container_port                   = var.app_container_port
  cloudwatch_log_group_name        = module.monitoring.ecs_log_group_name
  container_environment            = local.ecs_backend_environment
  desired_count                    = var.ecs_desired_count
  task_cpu                         = var.ecs_task_cpu
  task_memory                      = var.ecs_task_memory
  assign_public_ip                 = var.ecs_assign_public_ip
  autoscaling_min_capacity         = var.ecs_autoscaling_min_capacity
  autoscaling_max_capacity         = var.ecs_autoscaling_max_capacity
  alb_request_count_resource_label = local.ecs_alb_request_count_resource_label
  alb_request_count_target_value   = var.ecs_alb_request_count_target_value
}

module "rds" {
  source = "../../modules/rds"

  project_name            = var.project_name
  environment             = var.environment
  create_rds              = var.create_rds
  private_data_subnet_ids = module.vpc.private_data_subnet_ids
  rds_security_group_id   = module.security_groups.rds_security_group_id
  db_name                 = var.db_name
  db_username             = var.db_username
  db_password             = var.db_password
}

module "bastion" {
  count  = var.create_bastion ? 1 : 0
  source = "../../modules/bastion"

  project_name = var.project_name
  environment  = var.environment

  subnet_id                   = module.vpc.public_subnet_ids[0]
  security_group_id           = module.security_groups.bastion_security_group_id
  instance_type               = var.bastion_instance_type
  associate_public_ip_address = var.bastion_associate_public_ip
}
