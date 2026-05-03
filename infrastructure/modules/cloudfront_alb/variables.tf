variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "alb_dns_name" {
  type        = string
  description = "Public DNS name of the ALB (custom origin)."
}

variable "alb_origin_use_https" {
  type        = bool
  default     = false
  description = "If true, CloudFront connects to ALB on 443 (set when ALB has HTTPS listener). If false, origin uses HTTP :80."
}

variable "price_class" {
  type        = string
  default     = "PriceClass_100"
  description = "CloudFront price class (e.g. PriceClass_100 for US/EU/IL edges — lower cost)."
}
