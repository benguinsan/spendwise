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

resource "aws_db_subnet_group" "this" {
  count      = var.create_rds ? 1 : 0
  name       = "${local.name}-db-subnets"
  subnet_ids = var.private_data_subnet_ids

  tags = {
    Name = "${local.name}-db-subnet-group"
  }
}

resource "aws_db_instance" "this" {
  count = var.create_rds ? 1 : 0

  identifier                 = "${local.name}-postgres"
  engine                     = "postgres"
  engine_version             = "16"
  instance_class             = var.instance_class
  allocated_storage          = var.allocated_storage
  storage_type               = "gp3"
  db_name                    = var.db_name
  username                   = var.db_username
  password                   = var.db_password
  db_subnet_group_name       = aws_db_subnet_group.this[0].name
  vpc_security_group_ids     = [var.rds_security_group_id]
  # Cost-optimized defaults for non-production workloads.
  multi_az                   = false
  skip_final_snapshot        = true
  publicly_accessible        = false
  backup_retention_period    = 0
  delete_automated_backups   = true
  deletion_protection        = false
  auto_minor_version_upgrade = true

  tags = {
    Name = "${local.name}-rds"
  }
}
