output "alb_dns_name" {
  description = "Public DNS name of the ALB (HTTPS when alb_acm_certificate_arn is set)."
  value       = module.alb.alb_dns_name
}

output "ecr_repository_url" {
  value = module.ecr.repository_url
}

output "cognito_user_pool_id" {
  value = module.cognito.user_pool_id
}

output "cognito_client_id" {
  value = module.cognito.user_pool_client_id
}

output "amplify_default_domain" {
  description = "Amplify custom domain (or <app-id>.amplifyapp.com if not mapped)"
  value       = module.amplify.default_domain
}

output "amplify_app_id" {
  description = "Amplify app id"
  value       = module.amplify.app_id
}

output "amplify_branch_name" {
  description = "Amplify branch name"
  value       = module.amplify.branch_name
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}

output "ecs_service_name" {
  value       = module.ecs.service_name
  description = "ECS backend service name (aws ecs update-service --force-new-deployment)."
}

output "ecs_task_definition_family" {
  value       = module.ecs.task_definition_family
  description = "Task definition family for aws ecs run-task (latest active revision)."
}

output "ecs_private_app_subnet_ids_csv" {
  value       = join(",", module.vpc.private_app_subnet_ids)
  description = "Comma-separated private app subnet IDs for Fargate awsvpc."
}

output "ecs_tasks_security_group_id" {
  value       = module.security_groups.ecs_tasks_security_group_id
  description = "Security group attached to ECS tasks (same as running service)."
}

output "ecs_fargate_assign_public_ip" {
  value       = var.ecs_assign_public_ip ? "ENABLED" : "DISABLED"
  description = "ENABLED or DISABLED for assignPublicIp in run-task / service network."
}

output "ecs_log_group" {
  value = module.monitoring.ecs_log_group_name
}

output "rds_endpoint" {
  value       = module.rds.db_instance_endpoint
  description = "null nếu create_rds = false"
}

output "bastion_instance_id" {
  value       = var.create_bastion ? module.bastion[0].instance_id : null
  description = "EC2 instance id for SSM port forwarding (null nếu create_bastion = false)"
}

output "amplify_route53_zone_id" {
  value       = var.enable_amplify_hosted_zone ? aws_route53_zone.amplify[0].zone_id : null
  description = "Hosted zone ID for Amplify DNS when enable_amplify_hosted_zone=true."
}

output "amplify_route53_name_servers" {
  value       = var.enable_amplify_hosted_zone ? sort(aws_route53_zone.amplify[0].name_servers) : []
  description = "Delegate these NS from the parent DNS provider to use this zone for Amplify custom domain records."
}

output "db_password_secret_arn" {
  value       = var.create_rds ? module.db_password_secret[0].secret_arn : null
  description = "Secrets Manager ARN for RDS password (plain string secret)."
  sensitive   = false
}
