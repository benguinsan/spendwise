output "password" {
  value       = local.db_password
  sensitive   = true
  description = "Effective DB password (same as stored in Secrets Manager)."
}

output "secret_arn" {
  value       = aws_secretsmanager_secret.db_password.arn
  description = "Secrets Manager ARN for the DB password (single string secret)."
}

output "secret_id" {
  value       = aws_secretsmanager_secret.db_password.id
  description = "Secrets Manager secret id."
}
