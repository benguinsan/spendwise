variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnets for Fargate tasks (thường private_app)"
}

variable "ecs_tasks_security_group_id" {
  type = string
}

variable "target_group_arn" {
  type        = string
  description = "ALB target group (target_type = ip) đăng ký task"
}

variable "container_image" {
  type        = string
  description = "URI image đầy đủ kèm tag (ECR)"
}

variable "container_port" {
  type        = number
  description = "Port lắng nghe trong container"
}

variable "cloudwatch_log_group_name" {
  type = string
}

variable "container_environment" {
  type = list(object({
    name  = string
    value = string
  }))
  default     = []
  description = "Biến môi trường container (không chứa secret nhạy cảm trong state)"
}

variable "desired_count" {
  type        = number
  default     = 1
  description = "Giá trị ban đầu; sau đó Application Auto Scaling quản lý (Terraform ignore_changes)"
}

variable "task_cpu" {
  type    = number
  default = 256
}

variable "task_memory" {
  type    = number
  default = 512
}

variable "assign_public_ip" {
  type        = bool
  default     = false
  description = "Fargate trong subnet private thường false; endpoint VPC thay NAT khi cần"
}

variable "autoscaling_min_capacity" {
  type    = number
  default = 1
}

variable "autoscaling_max_capacity" {
  type    = number
  default = 4
}

variable "alb_request_count_resource_label" {
  type        = string
  description = "Nhãn cho ALBRequestCountPerTarget: app/lb-name/lb-id/targetgroup/tg-name/tg-id"
}

variable "alb_request_count_target_value" {
  type        = number
  default     = 200
  description = "Số request trung bình mỗi target mỗi phút để target tracking scale out"
}
