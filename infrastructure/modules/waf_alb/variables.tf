variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "alb_arn" {
  type        = string
  description = "Application Load Balancer ARN to associate with the Web ACL."
}

variable "enable_cloudwatch_metrics" {
  type        = bool
  default     = false
  description = "Disable to reduce CloudWatch metrics cost (WAF ACL monthly fee still applies)."
}
