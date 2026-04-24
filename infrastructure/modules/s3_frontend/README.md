# Module `s3_frontend`

Bucket **S3** chứa build **frontend tĩnh** (ví dụ Next.js static export). **Không** public trực tiếp: truy cập qua **CloudFront + OAC** (module `cloudfront` gắn bucket policy). Dùng `bucket_prefix` để AWS tạo tên bucket **duy nhất toàn cầu**.

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_s3_bucket` với `bucket_prefix` = `{project}-{env}-fe-`, `aws_s3_bucket_public_access_block` (chặn public), `aws_s3_bucket_versioning` bật `Enabled`. |
| **`variables.tf`** | `project_name`, `environment`. |
| **`outputs.tf`** | `bucket_id`, `bucket_arn`, `bucket_regional_domain_name` — CloudFront và policy cần các giá trị này. |

---

## Biến đầu vào

| Biến | Kiểu | Ý nghĩa |
|------|------|---------|
| `project_name` | string | Tiền tố |
| `environment` | string | `dev` / `prod` |

---

## Đầu ra

| Output | Dùng cho |
|--------|----------|
| `bucket_id` | `module.cloudfront` (policy attach), sync CLI `aws s3 sync` |
| `bucket_arn` | Điều kiện policy CloudFront → S3 |
| `bucket_regional_domain_name` | Origin domain CloudFront (regional endpoint) |

---

## Ghi chú

- Sau `apply`, deploy FE: đồng bộ file build lên bucket (CI/CD hoặc script trong `scripts/`).
- Tên bucket thực tế có **hậu tố ngẫu nhiên** do `bucket_prefix` — luôn lấy từ output/terraform state, đừng đoán tên.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
