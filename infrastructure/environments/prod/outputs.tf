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

output "alb_dns_name" {
  value = module.alb.alb_dns_name
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

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
}
