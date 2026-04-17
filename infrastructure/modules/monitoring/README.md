# Module `monitoring`

**CloudWatch Log Group** cho log container backend (đường dẫn `/ecs/{project}-{env}/backend`), có **retention** (ngày). Đây là nền cho observability; **metric alarms** (ALB 5xx, CPU ECS, RDS storage) có thể thêm trong `main.tf` sau.

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_cloudwatch_log_group` với `retention_in_days`. Comment gợi ý `aws_cloudwatch_metric_alarm`. |
| **`variables.tf`** | `project_name`, `environment`, `log_retention_days` (mặc định 14). |
| **`outputs.tf`** | `ecs_log_group_name`, `ecs_log_group_arn` — điền vào `aws_ecs_task_definition` `logConfiguration`. |

---

## Biến đầu vào

| Biến | Kiểu | Mặc định | Ý nghĩa |
|------|------|----------|---------|
| `project_name` | string | — | Tiền tố |
| `environment` | string | — | `dev` / `prod` |
| `log_retention_days` | number | `14` | Số ngày giữ log (giảm chi phí = giảm retention) |

---

## Đầu ra

| Output | Ý nghĩa |
|--------|---------|
| `ecs_log_group_name` | Tên log group — `awslogs-group` trong task definition |
| `ecs_log_group_arn` | ARN — IAM policy ghi log |

---

## Ghi chú

- Execution role của ECS cần quyền `logs:CreateLogStream`, `logs:PutLogEvents` trên ARN này.
- Container Insights trên cluster (module `ecs`) bổ sung metric ở cấp cluster/service — khác với log group từng app.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
