variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "plaintext_password" {
  type        = string
  sensitive   = true
  default     = ""
  description = "If non-empty, stored in Secrets Manager and used as DB password. If empty, a random password is generated."
}

variable "recovery_window_in_days" {
  type        = number
  default     = 0
  description = "Secrets Manager recovery window. Use 0 for dev (immediate delete). Use 7–30 in prod."
}
