variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "s3_bucket_id" {
  type = string
}

variable "s3_bucket_arn" {
  type = string
}

variable "s3_regional_domain_name" {
  type = string
}

variable "default_root_object" {
  type        = string
  default     = "index.html"
  description = "Static export Next.js hoặc index.html"
}
