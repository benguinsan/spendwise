variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "subnet_id" {
  type        = string
  description = "Subnet for bastion instance (usually public subnet)"
}

variable "security_group_id" {
  type        = string
  description = "Security group attached to bastion instance"
}

variable "instance_type" {
  type    = string
  default = "t3.nano"
}

variable "associate_public_ip_address" {
  type        = bool
  default     = true
  description = "Set true when bastion is in public subnet"
}
