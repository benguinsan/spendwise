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

resource "aws_amplify_app" "this" {
  name                        = "${local.name}-frontend"
  repository                  = var.repository_url
  access_token                = var.access_token
  platform                    = "WEB_COMPUTE"
  enable_branch_auto_deletion = false

  build_spec = var.build_spec

  environment_variables = var.app_environment_variables

  tags = {
    Name = "${local.name}-amplify-app"
  }
}

resource "aws_amplify_branch" "this" {
  app_id      = aws_amplify_app.this.id
  branch_name = var.branch_name
  framework   = var.framework
  stage       = var.branch_stage

  enable_auto_build = var.enable_auto_build

  environment_variables = var.branch_environment_variables

  tags = {
    Name = "${local.name}-amplify-branch-${var.branch_name}"
  }
}
