# Module `cognito`

**Amazon Cognito User Pool** (đăng nhập bằng **email**) + **User Pool App Client** (không tạo client secret — phù hợp SPA). Luồng: SRP, user/password, refresh token. **Hosted UI / OAuth / callback** chưa bật trong code — thêm khi có domain và luồng redirect cụ thể.

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | `aws_cognito_user_pool`: `username_attributes` + `auto_verified_attributes` = email, `password_policy`. `aws_cognito_user_pool_client`: `generate_secret = false`, `explicit_auth_flows` gồm SRP, USER_PASSWORD_AUTH, REFRESH_TOKEN_AUTH. |
| **`variables.tf`** | `project_name`, `environment`. |
| **`outputs.tf`** | `user_pool_id`, `user_pool_arn`, `user_pool_client_id` — cấu hình frontend (Amplify / SDK). |

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
| `user_pool_id` | ID pool — env frontend |
| `user_pool_arn` | ARN — IAM / logging |
| `user_pool_client_id` | App client id — SPA |

---

## Ghi chú

- `ALLOW_USER_PASSWORD_AUTH` tiện dev; prod cân nhắc chỉ SRP/OAuth tùy chính sách bảo mật.
- Khi dùng Hosted UI: bổ sung `callback_urls`, `allowed_oauth_flows`, domain tùy chỉnh trên pool.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
