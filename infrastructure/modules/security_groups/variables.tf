variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "app_container_port" {
  type        = number
  default     = 3000
  description = "Port container backend listen (NestJS thường 3000/5000 — chỉnh theo Dockerfile)"
}

variable "enable_bastion_rds_access" {
  type        = bool
  default     = false
  description = "Allow bastion security group to connect to RDS on 5432"
}
