data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = slice(data.aws_availability_zones.available.names, 0, 2)
  # Build DATABASE_URL for the Cognito PostConfirmation Lambda.
  # Note: RDS module defaults are db_username="appuser", db_name="spendwise".
  cognito_post_confirmation_database_url = var.create_rds && module.rds.db_instance_endpoint != null ? "postgresql://appuser:${var.db_password}@${module.rds.db_instance_endpoint}:5432/spendwise" : null
  # Application Auto Scaling — ALBRequestCountPerTarget (suffix sau loadbalancer/ + targetgroup/...)
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

  project_name         = var.project_name
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  app_container_port   = var.app_container_port
}

module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

module "s3_frontend" {
  source = "../../modules/s3_frontend"

  project_name = var.project_name
  environment  = var.environment
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name              = var.project_name
  environment               = var.environment
  s3_bucket_id              = module.s3_frontend.bucket_id
  s3_bucket_arn             = module.s3_frontend.bucket_arn
  s3_regional_domain_name   = module.s3_frontend.bucket_regional_domain_name
}

module "cognito" {
  source = "../../modules/cognito"

  project_name = var.project_name
  environment  = var.environment

  # Phase strategy:
  # - create_rds=false: only create Cognito (trigger disabled)
  # - create_rds=true: enable PostConfirmation trigger to upsert into DB
  enable_post_confirmation_trigger     = var.create_rds
  post_confirmation_database_url      = local.cognito_post_confirmation_database_url
  post_confirmation_subnet_ids         = module.vpc.private_data_subnet_ids
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

  private_subnet_ids              = module.vpc.private_app_subnet_ids
  ecs_tasks_security_group_id     = module.security_groups.ecs_tasks_security_group_id
  target_group_arn                = module.alb.target_group_arn
  container_image                 = "${module.ecr.repository_url}:${var.ecs_backend_image_tag}"
  container_port                  = var.app_container_port
  cloudwatch_log_group_name       = module.monitoring.ecs_log_group_name
  container_environment           = var.ecs_backend_environment
  desired_count                   = var.ecs_desired_count
  task_cpu                        = var.ecs_task_cpu
  task_memory                     = var.ecs_task_memory
  assign_public_ip                = var.ecs_assign_public_ip
  autoscaling_min_capacity          = var.ecs_autoscaling_min_capacity
  autoscaling_max_capacity          = var.ecs_autoscaling_max_capacity
  alb_request_count_resource_label  = local.ecs_alb_request_count_resource_label
  alb_request_count_target_value    = var.ecs_alb_request_count_target_value
}

module "rds" {
  source = "../../modules/rds"

  project_name             = var.project_name
  environment              = var.environment
  create_rds               = var.create_rds
  private_data_subnet_ids  = module.vpc.private_data_subnet_ids
  rds_security_group_id    = module.security_groups.rds_security_group_id
  db_password              = var.db_password
}
