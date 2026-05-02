# Module `alb`

**Application Load Balancer** internet-facing trên subnet **public**, **target group kiểu `ip`** (Fargate `awsvpc`), health check **HTTP** tới `health_check_path` (mặc định `/`, matcher **200**). Tên ALB/TG bị **cắt 32 ký tự** và thay `_` bằng `-` (giới hạn AWS).

---

## Listener

| Port | Khi `enable_https_listener = false` | Khi `enable_https_listener = true` |
|------|-------------------------------------|-------------------------------------|
| **80** | `forward` → target group | `redirect` → **443** (301) |
| **443** | (không tạo) | `HTTPS` + `acm_certificate_arn`, `forward` → target group |

Chứng chỉ ACM phải **cùng region** với ALB. Nếu bật HTTPS mà `acm_certificate_arn` rỗng, Terraform fail sớm nhờ `lifecycle.precondition` trên listener 443.

---

## Các file

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_lb`, `aws_lb_target_group` (`target_type = ip`), listener **80** + tùy chọn **443**. |
| **`variables.tf`** | VPC, subnet public, SG ALB, port container, health path, `enable_https_listener`, `acm_certificate_arn`. |
| **`outputs.tf`** | ARN/DNS/zone ALB, ARN target group. |

---

## Biến đầu vào

| Biến | Kiểu | Mặc định | Ý nghĩa |
|------|------|----------|---------|
| `project_name` | string | — | Tiền tố tên |
| `environment` | string | — | `dev` / `prod` |
| `vpc_id` | string | — | VPC |
| `public_subnet_ids` | list(string) | — | Ít nhất 2 AZ |
| `alb_security_group_id` | string | — | SG gắn ALB |
| `container_port` | number | `3000` | Khớp `portMappings` + health trên task ECS |
| `health_check_path` | string | `/` | Path trả **200** |
| `enable_https_listener` | bool | `false` | Tạo listener 443; nên set từ input biết trước plan (tránh dùng ARN “known after apply” để quyết định `count`). |
| `acm_certificate_arn` | string | `""` | ARN ACM khi bật HTTPS |

---

## Đầu ra

| Output | Ý nghĩa |
|--------|---------|
| `alb_arn` | ARN ALB (WAF, metric, …) |
| `alb_dns_name` | DNS public |
| `alb_zone_id` | Hosted zone ID của ALB (alias A/AAAA nếu cần) |
| `target_group_arn` | Gắn `aws_ecs_service.load_balancer` |

---

## Ghi chú

- Target **healthy** chỉ khi task ECS đăng ký đúng port và health check thành công; ALB có thể trả **503** nếu không có target healthy.
- README cũ từng mô tả chỉ HTTP forward; bảng trên phản ánh hành vi hiện tại.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
