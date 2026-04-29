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
