variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "create_rds" {
  type        = bool
  default     = false
  description = "Bật true mới tạo RDS (tốn phí)"
}

variable "private_data_subnet_ids" {
  type = list(string)
}

variable "rds_security_group_id" {
  type = string
}

variable "db_name" {
  type    = string
  default = "spendwise"
}

variable "db_username" {
  type    = string
  default = "appuser"
}

variable "db_password" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Bắt buộc khi create_rds = true"
}

variable "instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "allocated_storage" {
  type    = number
  default = 20
}

variable "multi_az" {
  type    = bool
  default = false
}
