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

variable "rds_multi_az" {
  type        = bool
  default     = true
  description = "RDS Multi-AZ standby (recommended for prod; ~2× instance cost)."
}

variable "app_container_port" {
  type    = number
  default = 3000
}

variable "alb_health_check_path" {
  type    = string
  default = "/"
}

variable "alb_acm_certificate_arn" {
  type        = string
  default     = ""
  description = "ACM certificate ARN for ALB HTTPS listener. Required for HTTPS backend endpoint."
}

variable "alb_public_api_base_url" {
  type        = string
  default     = ""
  description = "When HTTPS is enabled: NEXT_PUBLIC_API_URL base (must match ACM), e.g. https://api.example.com — no trailing slash; DNS CNAME to ALB."
}

variable "enable_api_cloudfront" {
  type        = bool
  default     = false
  description = "CloudFront default HTTPS URL in front of ALB for Amplify NEXT_PUBLIC_API_URL (no custom domain)."
}

variable "ecs_backend_image_tag" {
  type        = string
  default     = "latest"
  description = "Tag image trên ECR cho service backend Fargate"
}

variable "ecs_backend_environment" {
  type = list(object({
    name  = string
    value = string
  }))
  default     = []
  description = "Biến môi trường container backend"
}

variable "ecs_desired_count" {
  type    = number
  default = 1
}

variable "ecs_task_cpu" {
  type    = number
  default = 256
}

variable "ecs_task_memory" {
  type    = number
  default = 512
}

variable "ecs_assign_public_ip" {
  type    = bool
  default = false
}

variable "ecs_autoscaling_min_capacity" {
  type    = number
  default = 1
}

variable "ecs_autoscaling_max_capacity" {
  type    = number
  default = 10
}

variable "ecs_alb_request_count_target_value" {
  type        = number
  default     = 200
  description = "Target tracking ALB requests per target per minute"
}

variable "amplify_repository_url" {
  type        = string
  description = "Git repository URL for Amplify (GitHub/GitLab/Bitbucket)"
}

variable "amplify_access_token" {
  type        = string
  sensitive   = true
  description = "Personal access token used by Amplify to connect repository"
}

variable "amplify_branch_name" {
  type        = string
  default     = "main"
  description = "Git branch to deploy on Amplify"
}
