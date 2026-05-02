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
  description = "true = tạo RDS (có phí). Mật khẩu lấy từ Secrets Manager (module db_password_secret); để db_password rỗng để tự sinh."
}

variable "db_password" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Khi create_rds=true: nếu rỗng Terraform tự sinh mật khẩu và lưu vào Secrets Manager; nếu có giá trị thì dùng giá trị đó (vẫn được ghi vào SM). Không commit mật khẩu thật vào git."
}

variable "db_password_secret_recovery_window_days" {
  type        = number
  default     = 0
  description = "Secrets Manager recovery window cho secret db password. 0 = xóa ngay (dev). Prod nên 7–30."
}

variable "enable_waf" {
  type        = bool
  default     = false
  description = "Bật WAFv2 regional gắn ALB (có phí dịch vụ WAF). Tắt mặc định để tiết kiệm dev."
}

variable "waf_enable_cloudwatch_metrics" {
  type        = bool
  default     = false
  description = "Bật metric CloudWatch cho WAF (thêm chi phí nhẹ). Giữ false khi không cần."
}

variable "db_username" {
  type        = string
  default     = "appuser"
  description = "RDS master username and runtime DB username for backend"
}

variable "db_name" {
  type        = string
  default     = "spendwise"
  description = "Application database name on RDS"
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

variable "alb_acm_certificate_arn" {
  type        = string
  default     = ""
  description = "ACM certificate ARN in the same region as the ALB for HTTPS. Issue/validate ACM at your DNS provider (e.g. PointHQ); no Route53 required for ALB."
}

variable "enable_amplify_hosted_zone" {
  type        = bool
  default     = false
  description = "Create a public Route53 hosted zone for Amplify custom-domain DNS (CNAME/verification). Not used by the ALB."
}

variable "amplify_hosted_zone_name" {
  type        = string
  default     = ""
  description = "FQDN for the new hosted zone when enable_amplify_hosted_zone=true (e.g. app.dev.example.com). Delegate NS from the parent zone to output amplify_route53_name_servers."
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

variable "create_bastion" {
  type        = bool
  default     = false
  description = "Create a bastion EC2 for SSM port forwarding to RDS"
}

variable "bastion_instance_type" {
  type    = string
  default = "t3.nano"
}

variable "bastion_associate_public_ip" {
  type        = bool
  default     = true
  description = "Set true when placing bastion in public subnet"
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
