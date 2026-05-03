data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = slice(data.aws_availability_zones.available.names, 0, 2)
  frontend_api_url_alb_only = trimspace(var.alb_acm_certificate_arn) != "" ? (
    trimspace(var.alb_public_api_base_url) != "" ? trimsuffix(trimspace(var.alb_public_api_base_url), "/") : "https://${module.alb.alb_dns_name}"
  ) : "http://${module.alb.alb_dns_name}"
  frontend_api_url = var.enable_api_cloudfront ? trimsuffix(module.cloudfront_api[0].api_base_url, "/") : local.frontend_api_url_alb_only
  ecs_alb_request_count_resource_label = format(
    "%s/targetgroup/%s",
    regex(":loadbalancer/(.+)$", module.alb.alb_arn)[0],
    regex(":targetgroup/(.+)$", module.alb.target_group_arn)[0],
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

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  app_container_port = var.app_container_port
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
      cache:
        paths:
          - node_modules/**/*
EOF

  app_environment_variables = {
    AMPLIFY_MONOREPO_APP_ROOT = "frontend"
    NEXT_PUBLIC_API_URL       = local.frontend_api_url
  }
}

module "cognito" {
  source = "../../modules/cognito"

  project_name = var.project_name
  environment  = var.environment
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
  enable_https_listener = trimspace(var.alb_acm_certificate_arn) != ""
  acm_certificate_arn   = var.alb_acm_certificate_arn
}

module "cloudfront_api" {
  count  = var.enable_api_cloudfront ? 1 : 0
  source = "../../modules/cloudfront_alb"

  project_name           = var.project_name
  environment            = var.environment
  alb_dns_name           = module.alb.alb_dns_name
  alb_origin_use_https   = trimspace(var.alb_acm_certificate_arn) != ""
}

module "ecs" {
  source = "../../modules/ecs"

  depends_on = [module.alb]

  project_name = var.project_name
  environment  = var.environment

  private_subnet_ids               = module.vpc.private_app_subnet_ids
  ecs_tasks_security_group_id      = module.security_groups.ecs_tasks_security_group_id
  target_group_arn                 = module.alb.target_group_arn
  container_image                  = "${module.ecr.repository_url}:${var.ecs_backend_image_tag}"
  container_port                   = var.app_container_port
  cloudwatch_log_group_name        = module.monitoring.ecs_log_group_name
  container_environment = concat(
    var.ecs_backend_environment,
    [{ name = "CORS_ORIGIN", value = "https://${var.amplify_branch_name}.${module.amplify.default_domain}" }]
  )
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
  db_password             = var.db_password
  multi_az                = var.rds_multi_az
}
