variable "project_name" {
  type        = string
  description = "Prefix for resource names"
}

variable "environment" {
  type        = string
  description = "e.g. dev, prod"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC IPv4 CIDR"
}

variable "availability_zones" {
  type        = list(string)
  description = "Exactly two AZs in the region"
}

variable "enable_nat_gateway" {
  type        = bool
  default     = true
  description = "NAT cho private subnet ra internet (ECR, patches). Tắt dev nếu chỉ validate cấu trúc."
}
