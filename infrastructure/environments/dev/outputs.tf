output "cloudfront_domain" {
  description = "CNAME/ALIAS tại DNS ngoài trỏ tới domain này (hoặc dùng *.cloudfront.net khi test)"
  value       = module.cloudfront.distribution_domain_name
}

output "alb_dns_name" {
  description = "DNS ALB — có thể làm origin thứ 2 của CloudFront cho /api hoặc subdomain api."
  value       = module.alb.alb_dns_name
}

output "ecr_repository_url" {
  value = module.ecr.repository_url
}

output "cognito_user_pool_id" {
  value = module.cognito.user_pool_id
}

output "cognito_client_id" {
  value     = module.cognito.user_pool_client_id
  sensitive = false
}

output "s3_frontend_bucket_id" {
  value = module.s3_frontend.bucket_id
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
