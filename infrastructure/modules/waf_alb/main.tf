terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  name        = "${var.project_name}-${var.environment}"
  metric_safe = replace("${local.name}-waf", "-", "_")
}

resource "aws_wafv2_web_acl" "this" {
  name  = "${local.name}-alb-acl"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = var.enable_cloudwatch_metrics
    metric_name                = "${local.metric_safe}_acl"
    sampled_requests_enabled   = var.enable_cloudwatch_metrics
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 10

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = var.enable_cloudwatch_metrics
      metric_name                = "${local.metric_safe}_crs"
      sampled_requests_enabled   = var.enable_cloudwatch_metrics
    }
  }

  tags = {
    Name = "${local.name}-waf"
  }
}

resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = var.alb_arn
  web_acl_arn  = aws_wafv2_web_acl.this.arn
}



