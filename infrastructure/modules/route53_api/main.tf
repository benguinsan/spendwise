locals {
  should_create_zone = var.enabled && var.create_hosted_zone
  api_fqdn           = var.enabled ? "${var.api_subdomain}.${var.root_domain_name}" : ""
  zone_id = var.enabled ? (
    var.create_hosted_zone ? aws_route53_zone.this[0].zone_id : var.hosted_zone_id
  ) : ""
}

resource "aws_route53_zone" "this" {
  count = local.should_create_zone ? 1 : 0
  name  = var.root_domain_name

  tags = {
    Name = "${var.project_name}-${var.environment}-zone"
  }
}

resource "aws_acm_certificate" "this" {
  count             = var.enabled ? 1 : 0
  domain_name       = local.api_fqdn
  validation_method = "DNS"

  # When creating a new zone, wait for it before requesting ACM (clearer graph; avoids odd edge cases).
  depends_on = [aws_route53_zone.this]

  lifecycle {
    create_before_destroy = true
    precondition {
      condition     = var.create_hosted_zone || trimspace(var.hosted_zone_id) != ""
      error_message = "Either create_hosted_zone=true (new zone; delegate its NS at the parent before ACM can validate publicly) or set hosted_zone_id to an existing Route53 zone."
    }
  }
}

resource "aws_route53_record" "validation" {
  for_each = var.enabled ? {
    for dvo in aws_acm_certificate.this[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id         = local.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.record]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "this" {
  count                   = var.enabled ? 1 : 0
  certificate_arn         = aws_acm_certificate.this[0].arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]

  timeouts {
    create = var.certificate_validation_create_timeout
  }
}
