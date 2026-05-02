variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "enabled" {
  type        = bool
  default     = false
  description = "Enable Route53 + ACM resources for API custom domain."
}

variable "root_domain_name" {
  type        = string
  default     = ""
  description = "Root domain name, e.g. example.com."
}

variable "api_subdomain" {
  type        = string
  default     = "api"
  description = "API subdomain, e.g. api."
}

variable "create_hosted_zone" {
  type        = bool
  default     = false
  description = "Create a new hosted zone for root_domain_name. After first apply, add the output name_servers as NS at the PARENT DNS; until then ACM validation will not complete publicly (common cause of long hangs after destroy/min-cost cycles)."
}

variable "hosted_zone_id" {
  type        = string
  default     = ""
  description = "Existing Route53 hosted zone ID when create_hosted_zone=false."
}

variable "certificate_validation_create_timeout" {
  type        = string
  default     = "45m"
  description = "Max wait for ACM DNS validation. Shorter reduces hang time when parent NS is not delegated yet."
}
