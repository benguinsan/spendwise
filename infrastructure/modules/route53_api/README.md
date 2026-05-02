# route53_api module

Cost-optimized Route53 + ACM setup for an API custom domain.

This module intentionally creates only:

- optional hosted zone
- ACM certificate
- DNS validation records

It does not create health checks, query logging, or additional records by default.

## New hosted zone + ACM (after destroy / no zone yet)

If `create_hosted_zone=true`, this module creates a **delegated** zone: ACM public DNS validation only succeeds after the **parent** zone publishes **NS** for this suffix pointing to `name_servers` output. Until then, `aws_acm_certificate_validation` may wait until timeout. Typical flow: `terraform apply` → read `name_servers` → add NS at parent → wait for propagation → re-apply or let the current apply finish validating.
