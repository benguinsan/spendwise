terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  name = "${var.project_name}-${var.environment}"
}

resource "aws_ecs_cluster" "this" {
  name = "${local.name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${local.name}-ecs"
  }
}

# Tiếp theo (không tạo sẵn để tránh task definition giả):
# - aws_ecs_task_definition (Fargate, execution role pull ECR + CloudWatch logs)
# - aws_ecs_service (network_configuration: private subnets + ecs security group)
# - Gán target group từ module alb vào load_balancer block của service
