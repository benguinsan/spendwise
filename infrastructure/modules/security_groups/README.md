# Module `security_groups`

Ba **security group** theo tầng: **ALB** (mở 80/443 từ internet), **ECS tasks** (chỉ nhận traffic từ ALB trên port ứng dụng), **RDS** (chỉ PostgreSQL 5432 từ ECS). Phù hợp diagram: ALB → Fargate → RDS.

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_security_group` **alb**: ingress 80, 443 từ `0.0.0.0/0`, egress all. **ecs_tasks**: ingress từ SG ALB tới `app_container_port`, egress all. **rds**: ingress 5432 từ SG ECS, egress all. |
| **`variables.tf`** | `vpc_id`, tên dự án/môi trường, `app_container_port` (mặc định 3000). |
| **`outputs.tf`** | ID của từng security group để gắn vào ALB, ECS service, RDS. |

---

## Biến đầu vào

| Biến | Kiểu | Mặc định | Ý nghĩa |
|------|------|----------|---------|
| `project_name` | string | — | Tiền tố tên |
| `environment` | string | — | `dev` / `prod` |
| `vpc_id` | string | — | VPC nơi tạo SG (từ module `vpc`) |
| `app_container_port` | number | `3000` | Port container NestJS/backend lắng nghe — **khớp** với Dockerfile và module `alb` |

---

## Đầu ra

| Output | Gắn vào |
|--------|---------|
| `alb_security_group_id` | `module.alb` |
| `ecs_tasks_security_group_id` | ECS service (khi bạn thêm task/service) |
| `rds_security_group_id` | `module.rds` |

---

## Ghi chú

- Nếu backend listen cổng khác (ví dụ 5000), đổi **cùng lúc** `app_container_port` ở root/`security_groups` và `container_port` ở `alb`.
- HTTPS listener trên ALB thường cần **ACM** ở cùng region; module `alb` hiện chỉ có listener **HTTP 80** — mở rộng sau khi có chứng chỉ.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
