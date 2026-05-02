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
