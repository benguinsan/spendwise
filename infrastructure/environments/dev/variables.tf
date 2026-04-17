variable "aws_region" {
  type        = string
  description = "Region triển khai (vd: ap-southeast-1)"
}

variable "project_name" {
  type        = string
  description = "Tiền tố tài nguyên"
  default     = "spendwise"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "enable_nat_gateway" {
  type        = bool
  default     = true
  description = "NAT cho ECS pull ECR / outbound"
}

variable "create_rds" {
  type        = bool
  default     = false
  description = "true = tạo RDS (có phí). Cần db_password trong tfvars."
}

variable "db_password" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Mật khẩu master RDS khi create_rds = true"
}

variable "app_container_port" {
  type        = number
  default     = 3000
  description = "Port ứng dụng trong container (NestJS thường 3000)"
}

variable "alb_health_check_path" {
  type    = string
  default = "/"
}
