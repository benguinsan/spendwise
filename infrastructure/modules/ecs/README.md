# Module `ecs`

Tạo **ECS Cluster** với **Container Insights** bật. **Chưa** khai báo `aws_ecs_task_definition` hay `aws_ecs_service` — tránh task giả và IAM phức tạp; bạn bổ sung khi đã có image ECR, execution role, và muốn nối **target group ALB**.

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_ecs_cluster` tên `{project}-{env}-cluster`, `setting containerInsights = enabled`. Comment trong file liệt kê bước tiếp: task definition Fargate, service trong private subnet + SG ECS, gắn LB. |
| **`variables.tf`** | `project_name`, `environment`. |
| **`outputs.tf`** | `cluster_id`, `cluster_arn`, `cluster_name` — tham chiếu khi tạo service. |

---

## Biến đầu vào

| Biến | Kiểu | Ý nghĩa |
|------|------|---------|
| `project_name` | string | Tiền tố |
| `environment` | string | `dev` / `prod` |

---

## Đầu ra

| Output | Ý nghĩa |
|--------|---------|
| `cluster_id` | ID cluster |
| `cluster_arn` | ARN |
| `cluster_name` | Tên — dùng trong `aws_ecs_service` |

---

## Bước triển khai tiếp (ngoài module hiện tại)

1. **IAM:** execution role (pull ECR, ghi CloudWatch Logs) + task role (gọi AWS API nếu cần).
2. **`aws_ecs_task_definition`:** Fargate CPU/memory, container image = `module.ecr.repository_url:tag`, `awslogs` config trỏ tới log group `monitoring`.
3. **`aws_ecs_service`:** `network_configuration` subnets = `private_app_subnet_ids`, security groups = ECS SG, `load_balancer` → `module.alb.target_group_arn`.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
