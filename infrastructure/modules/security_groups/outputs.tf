output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "ecs_tasks_security_group_id" {
  value = aws_security_group.ecs_tasks.id
}

output "bastion_security_group_id" {
  value = aws_security_group.bastion.id
}

output "rds_security_group_id" {
  value = aws_security_group.rds.id
}
