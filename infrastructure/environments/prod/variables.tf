variable "aws_region" {
  type = string
}

variable "project_name" {
  type    = string
  default = "spendwise"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "enable_nat_gateway" {
  type    = bool
  default = true
}

variable "create_rds" {
  type    = bool
  default = true
}

variable "db_password" {
  type      = string
  sensitive = true
  default   = ""
}

variable "app_container_port" {
  type    = number
  default = 3000
}

variable "alb_health_check_path" {
  type    = string
  default = "/"
}
