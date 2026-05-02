terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

locals {
  name = "${var.project_name}-${var.environment}"
  # When plaintext is empty, random_password is created. Otherwise use the provided password only.
  db_password = length(random_password.db) > 0 ? random_password.db[0].result : trimspace(var.plaintext_password)
}

resource "random_password" "db" {
  count   = trimspace(var.plaintext_password) == "" ? 1 : 0
  length  = 24
  special = true
  # RDS allows many specials; avoid @, /, space, quotes for fewer surprises.
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${local.name}/db/password"
  recovery_window_in_days = var.recovery_window_in_days

  tags = {
    Name = "${local.name}-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = local.db_password
}

