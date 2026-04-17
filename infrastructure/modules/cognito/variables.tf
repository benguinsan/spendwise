variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "enable_post_confirmation_trigger" {
  type        = bool
  default     = false
  description = "Enable Cognito PostConfirmation trigger to sync user into app DB."
}

variable "post_confirmation_database_url" {
  type        = string
  default     = null
  description = "DATABASE_URL for the PostConfirmation Lambda (e.g. postgres://user:pass@host:5432/db)."
}

variable "post_confirmation_subnet_ids" {
  type        = list(string)
  default     = []
  description = "Private subnet IDs for Lambda VPC config (optional)."
}

variable "post_confirmation_security_group_ids" {
  type        = list(string)
  default     = []
  description = "Security group IDs for Lambda VPC config (optional)."
}
