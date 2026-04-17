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

resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/${local.name}/backend"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${local.name}-ecs-logs"
  }
}

# Mở rộng: aws_cloudwatch_metric_alarm cho ALB 5xx, ECS CPU, RDS free storage...
