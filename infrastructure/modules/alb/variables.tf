variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "alb_security_group_id" {
  type = string
}

variable "container_port" {
  type    = number
  default = 3000
}

variable "health_check_path" {
  type    = string
  default = "/"
}

variable "acm_certificate_arn" {
  type        = string
  default     = ""
  description = "ACM certificate ARN for HTTPS listener on ALB. Leave empty to keep HTTP-only."
}

variable "enable_https_listener" {
  type        = bool
  default     = false
  description = "Create HTTPS listener (443). Set from known inputs (e.g. custom domain flag); do not infer solely from acm_certificate_arn when that value is only known after apply."
}
