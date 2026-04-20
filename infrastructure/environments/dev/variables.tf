variable "aws_region" {
  type        = string
  description = "Region triển khai (vd: ap-southeast-1)"
}

variable "project_name" {
  type        = string
  description = "Tiền tố tài nguyên"
  default     = "spendwise"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "enable_nat_gateway" {
  type        = bool
  default     = true
  description = "NAT cho ECS pull ECR / outbound"
}

variable "create_rds" {
  type        = bool
  default     = false
  description = "true = tạo RDS (có phí). Cần db_password trong tfvars."
}

variable "db_password" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Mật khẩu master RDS khi create_rds = true"
}

variable "app_container_port" {
  type        = number
  default     = 3000
  description = "Port ứng dụng trong container (NestJS thường 3000)"
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
  description = "Biến môi trường container backend (vd NODE_ENV)"
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
  type        = bool
  default     = false
  description = "Giữ false cho task trong private_app; dùng VPC endpoint + NAT tùy môi trường"
}

variable "ecs_autoscaling_min_capacity" {
  type    = number
  default = 1
}

variable "ecs_autoscaling_max_capacity" {
  type    = number
  default = 4
}

variable "ecs_alb_request_count_target_value" {
  type        = number
  default     = 200
  description = "Target tracking: request trung bình mỗi task mỗi phút (ALBRequestCountPerTarget)"
}
