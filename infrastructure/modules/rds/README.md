# Module `rds`

**Amazon RDS PostgreSQL** trong **private data subnet**, chỉ nhận kết nối từ security group ECS trên **5432**. Tạo resource **chỉ khi** `create_rds = true` (tránh phí khi dev chỉ dựng mạng). Hỗ trợ **Multi-AZ** qua biến `multi_az` (prod thường `true`).

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_db_subnet_group` (chỉ khi `create_rds`), `aws_db_instance` Postgres 16, gp3, `publicly_accessible = false`, `skip_final_snapshot = true` (mẫu — **đổi prod**), backup retention phụ thuộc multi_az. |
| **`variables.tf`** | Cờ tạo DB, subnet, SG RDS, tên DB, user, **password** (sensitive), class, storage, multi_az. |
| **`outputs.tf`** | `db_instance_endpoint`, `db_instance_address` — `null`/empty khi không tạo DB. |

---

## Biến đầu vào

| Biến | Kiểu | Mặc định | Ý nghĩa |
|------|------|----------|---------|
| `project_name` | string | — | Tiền tố |
| `environment` | string | — | `dev` / `prod` |
| `create_rds` | bool | `false` | `true` mới tạo RDS (**có phí**) |
| `private_data_subnet_ids` | list(string) | — | Subnet group — ít nhất 2 AZ khuyến nghị |
| `rds_security_group_id` | string | — | SG chỉ cho phép ECS |
| `db_name` | string | `spendwise` | Tên database logic |
| `db_username` | string | `appuser` | Master user |
| `db_password` | string | `""` | **Bắt buộc** khi `create_rds` — dùng secret manager ở prod |
| `instance_class` | string | `db.t4g.micro` | Class instance |
| `allocated_storage` | number | `20` | GB gp3 |
| `multi_az` | bool | `false` | Prod: thường `true` |

---

## Đầu ra

| Output | Ý nghĩa |
|--------|---------|
| `db_instance_endpoint` | `host:port` — env backend `DATABASE_URL` |
| `db_instance_address` | Hostname |

---

## Ghi chú

- **Prod:** bật `deletion_protection`, `skip_final_snapshot = false`, snapshot/final snapshot, password từ **Secrets Manager**.
- Engine version `16` có thể cần chỉnh minor theo region; kiểm tra trên console AWS trước khi apply.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
