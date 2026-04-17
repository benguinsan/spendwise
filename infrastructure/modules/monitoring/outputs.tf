output "ecs_log_group_name" {
  value = aws_cloudwatch_log_group.ecs_backend.name
}

output "ecs_log_group_arn" {
  value = aws_cloudwatch_log_group.ecs_backend.arn
}
