# Module `alb`

**Application Load Balancer** internet-facing trên **subnet public**, **target group kiểu IP** (chuẩn cho **Fargate**), listener **HTTP 80** forward toàn bộ traffic tới target group. Health check HTTP tới `health_check_path` (mặc định `/`). Tên ALB/TG bị **cắt 32 ký tự** và thay `_` bằng `-` (giới hạn AWS).

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_lb` (application), `aws_lb_target_group` `target_type = ip`, `health_check` (path, matcher 200, …), `aws_lb_listener` port 80 → forward default action tới target group. |
| **`variables.tf`** | VPC, subnet public, SG ALB, port container, đường dẫn health check. |
| **`outputs.tf`** | ARN/DNS/zone ALB, ARN target group — ECS service và DNS ghi chú. |

---

## Biến đầu vào

| Biến | Kiểu | Mặc định | Ý nghĩa |
|------|------|----------|---------|
| `project_name` | string | — | Tiền tố tên |
| `environment` | string | — | `dev` / `prod` |
| `vpc_id` | string | — | VPC |
| `public_subnet_ids` | list(string) | — | Ít nhất 2 AZ cho ALB |
| `alb_security_group_id` | string | — | SG từ `security_groups` |
| `container_port` | number | `3000` | Phải khớp task + SG ECS |
| `health_check_path` | string | `/` | Path health của app (nên có endpoint 200) |

---

## Đầu ra

| Output | Ý nghĩa |
|--------|---------|
| `alb_arn` | Gắn listener/rule sau này |
| `alb_dns_name` | DNS public — trỏ subdomain `api.` từ DNS ngoài hoặc origin CloudFront |
| `alb_zone_id` | Dùng cho alias record Route53 (nếu dùng) |
| `target_group_arn` | Gắn vào `aws_ecs_service` `load_balancer` block |

---

## Ghi chú

- **Chưa có ECS service** trong repo mẫu → target group có thể **healthy = 0** — bình thường cho tới khi có task đăng ký.
- HTTPS: thêm `aws_lb_listener` 443 + certificate ACM **cùng region** với ALB.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
