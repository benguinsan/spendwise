output "web_acl_arn" {
  value       = aws_wafv2_web_acl.this.arn
  description = "Regional WAF Web ACL ARN."
}

output "web_acl_id" {
  value       = aws_wafv2_web_acl.this.id
  description = "Regional WAF Web ACL id."
}
