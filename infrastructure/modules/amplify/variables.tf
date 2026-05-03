variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "repository_url" {
  type        = string
  description = "Git repository URL for Amplify (GitHub/GitLab/Bitbucket)"
}

variable "access_token" {
  type        = string
  sensitive   = true
  description = "Personal access token used by Amplify to connect repository"
}

variable "branch_name" {
  type        = string
  default     = "main"
  description = "Git branch to deploy"
}

variable "framework" {
  type        = string
  default     = "Next.js - SSR"
  description = "Amplify branch framework; use Next.js - SSR for App Router / SSR on WEB_COMPUTE (Amplify rejects plain Next.js for SSR deploys)."
}

variable "branch_stage" {
  type        = string
  default     = "DEVELOPMENT"
  description = "Amplify branch stage"
}

variable "enable_auto_build" {
  type    = bool
  default = true
}

variable "build_spec" {
  type        = string
  default     = null
  description = "Optional custom Amplify buildspec YAML"
}

variable "app_environment_variables" {
  type        = map(string)
  default     = {}
  description = "App-level environment variables"
}

variable "branch_environment_variables" {
  type        = map(string)
  default     = {}
  description = "Branch-level environment variables"
}
