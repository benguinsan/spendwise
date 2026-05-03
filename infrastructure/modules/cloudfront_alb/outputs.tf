output "distribution_id" {
  value       = aws_cloudfront_distribution.api.id
  description = "CloudFront distribution ID."
}

output "distribution_domain_name" {
  value       = aws_cloudfront_distribution.api.domain_name
  description = "Default CloudFront domain (dxxxx.cloudfront.net)."
}

output "api_base_url" {
  value       = "https://${aws_cloudfront_distribution.api.domain_name}"
  description = "HTTPS base URL for NEXT_PUBLIC_API_URL (no trailing slash)."
}
