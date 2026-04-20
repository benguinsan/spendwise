data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = slice(data.aws_availability_zones.available.names, 0, 2)
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

module "s3_frontend" {
  source = "../../modules/s3_frontend"

  project_name = var.project_name
  environment  = var.environment
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name            = var.project_name
  environment             = var.environment
  s3_bucket_id            = module.s3_frontend.bucket_id
  s3_bucket_arn           = module.s3_frontend.bucket_arn
  s3_regional_domain_name = module.s3_frontend.bucket_regional_domain_name
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

  project_name            = var.project_name
  environment             = var.environment
  create_rds              = var.create_rds
  private_data_subnet_ids = module.vpc.private_data_subnet_ids
  rds_security_group_id   = module.security_groups.rds_security_group_id
  db_password             = var.db_password
  multi_az                = true
}
