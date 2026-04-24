output "db_instance_endpoint" {
  value       = try(aws_db_instance.this[0].endpoint, null)
  description = "host:port khi create_rds = true"
}

output "db_instance_address" {
  value = try(aws_db_instance.this[0].address, null)
}
