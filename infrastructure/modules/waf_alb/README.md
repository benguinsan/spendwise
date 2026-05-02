# waf_alb

Regional **AWS WAFv2** Web ACL associated with an **Application Load Balancer**.

- Uses **AWS Managed Rules — Common Rule Set** (baseline OWASP-style protections).
- CloudWatch metrics for the ACL and rules are **off by default** to limit extra cost; enable via `enable_cloudwatch_metrics` when debugging.

WAF still incurs its own service pricing; use a toggle in the environment to disable in cheap dev stacks.
