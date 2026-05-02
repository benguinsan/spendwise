output "api_fqdn" {
  value       = local.api_fqdn
  description = "API custom domain FQDN."
}

output "zone_id" {
  value       = local.zone_id
  description = "Route53 hosted zone ID used for records."
}

output "certificate_arn" {
  value       = var.enabled ? aws_acm_certificate_validation.this[0].certificate_arn : ""
  description = "Validated ACM certificate ARN for API domain."
}

output "name_servers" {
  value       = var.enabled && var.create_hosted_zone ? sort(aws_route53_zone.this[0].name_servers) : []
  description = "When create_hosted_zone=true: NS records to set at the parent zone so this zone is public; required before ACM DNS validation can succeed."
}
