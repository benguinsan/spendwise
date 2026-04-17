# Module `cloudfront`

**CloudFront distribution** phục vụ frontend từ **S3** qua **Origin Access Control (OAC)** — không lộ bucket public. Dùng chứng chỉ mặc định `*.cloudfront.net`; gắn **domain ngoài + ACM ở us-east-1** là bước mở rộng sau.

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_cloudfront_origin_access_control` (SigV4, origin type S3). `aws_cloudfront_distribution`: origin = S3 regional domain + OAC, `default_root_object`, cache behavior dùng **managed policy** CachingOptimized, HTTPS redirect, nén. `aws_s3_bucket_policy` cho phép `cloudfront.amazonaws.com` `s3:GetObject` với điều kiện `AWS:SourceArn` = ARN distribution. |
| **`variables.tf`** | Tên dự án/môi trường, `s3_bucket_id`, `s3_bucket_arn`, `s3_regional_domain_name`, `default_root_object` (mặc định `index.html`). |
| **`outputs.tf`** | `distribution_id`, `distribution_domain_name`, `distribution_arn` — DNS và debug. |

---

## Biến đầu vào

| Biến | Kiểu | Mặc định | Ý nghĩa |
|------|------|----------|---------|
| `project_name` | string | — | Tiền tố |
| `environment` | string | — | `dev` / `prod` |
| `s3_bucket_id` | string | — | ID bucket (từ `s3_frontend`) |
| `s3_bucket_arn` | string | — | ARN bucket — policy `Resource` `arn/ *` |
| `s3_regional_domain_name` | string | — | Domain origin (dạng `bucket.s3.region.amazonaws.com`) |
| `default_root_object` | string | `index.html` | File mặc định khi mở `/` |

---

## Đầu ra

| Output | Ý nghĩa |
|--------|---------|
| `distribution_id` | ID distribution (invalidation, console) |
| `distribution_domain_name` | Hostname CDN — trỏ CNAME/ALIAS từ DNS ngoài khi test hoặc prod |
| `distribution_arn` | Dùng trong điều kiện bucket policy (đã tham chiếu nội bộ) |

---

## Ghi chú

- **API qua cùng domain:** thêm **origin thứ hai** (ALB) và `ordered_cache_behavior` cho path `/api/*` — chưa có trong mẫu này.
- Certificate tùy chỉnh trên CloudFront yêu cầu ACM **US East (N.Virginia)** cho alias — bổ sung khi có domain thuê ngoài.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
