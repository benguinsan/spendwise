# Module `ecr`

**Amazon ECR**: repository Docker private cho image **backend** (NestJS). ECS Fargate sẽ pull từ đây. Bật **scan on push** cơ bản cho image.

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_ecr_repository` tên `{project}-{env}-backend`, `image_tag_mutability = MUTABLE`, `image_scanning_configuration { scan_on_push = true }`. |
| **`variables.tf`** | Chỉ `project_name`, `environment`. |
| **`outputs.tf`** | URL push/pull, ARN, tên repo — dùng cho pipeline CI và (sau này) task definition ECS. |

---

## Biến đầu vào

| Biến | Kiểu | Mặc định | Ý nghĩa |
|------|------|----------|---------|
| `project_name` | string | — | Tiền tố |
| `environment` | string | — | `dev` / `prod` |

---

## Đầu ra

| Output | Ý nghĩa |
|--------|---------|
| `repository_url` | URI đăng nhập Docker / `docker push` |
| `repository_arn` | ARN — gán IAM nếu cần |
| `repository_name` | Tên repo ngắn |

---

## Ghi chú

- Pipeline build cần quyền `ecr:GetAuthorizationToken` và push vào repo này.
- Tag image theo chiến lược deploy (semver hoặc git sha).

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
