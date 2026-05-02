output "cluster_id" {
  value = aws_ecs_cluster.this.id
}

output "cluster_arn" {
  value = aws_ecs_cluster.this.arn
}

output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "service_name" {
  value = aws_ecs_service.backend.name
}

output "service_id" {
  value = aws_ecs_service.backend.id
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.backend.arn
}

output "task_definition_family" {
  value       = aws_ecs_task_definition.backend.family
  description = "Dùng với aws ecs run-task --task-definition <family> (latest revision)"
}

output "execution_role_arn" {
  value = aws_iam_role.ecs_execution.arn
}

output "task_role_arn" {
  value = aws_iam_role.ecs_task.arn
}
