# SpendWise — Terraform (AWS)

Cấu trúc IaC mẫu theo **module** + **môi trường** (`dev` / `prod`), bám diagram: Cognito → CloudFront (S3 static + API qua ALB) → ECS Fargate → RDS PostgreSQL, ECR, CloudWatch.

## Tài liệu cho người mới

- **[Terraform: `main` / `variables` / `outputs` và lệnh chạy](docs/terraform-basics-vi.md)** — giải thích file `.tf` và thứ tự `init` → `plan` → `apply` trước khi bạn chạy thật.
- **Từng module:** trong `modules/<tên>/README.md` có bảng tóm tắt nội dung `main.tf`, `variables.tf`, `outputs.tf`.

## Luồng hoạt động (tóm tắt)

1. Người dùng xác thực qua **Amazon Cognito** (User Pool / App client).
2. **CloudFront** phục vụ frontend tĩnh từ **S3**; API có thể gọi qua CloudFront (origin ALB) hoặc trực tiếp ALB tùy cấu hình.
3. **Application Load Balancer** (public subnet) nhận traffic từ internet, forward tới task **ECS Fargate** (private app subnet).
4. Task ECS pull image từ **ECR**; ghi log **CloudWatch Logs**; metric/cảnh báo qua **CloudWatch Alarms** (module `monitoring` là khung mở rộng).
5. **RDS PostgreSQL** nằm private data subnet, chỉ cho phép từ security group ECS (và tùy chọn bastion).
6. **Domain** thuê ngoài: sau khi apply, dùng output (CloudFront domain, ALB DNS) để tạo bản ghi CNAME/ALIAS tại nhà cung cấp DNS.

## Cấu trúc thư mục

```text
infrastructure/
├── environments/
│   ├── dev/          # backend.tf, main.tf, variables.tf, *.tfvars.example
│   └── prod/
├── modules/
│   ├── vpc/
│   ├── security_groups/
│   ├── alb/
│   ├── ecs/
│   ├── rds/
│   ├── ecr/
│   ├── s3_frontend/
│   ├── cloudfront/
│   ├── cognito/
│   └── monitoring/
├── docs/             # hướng dẫn Terraform (tiếng Việt)
├── scripts/          # script CI/CD hoặc wrapper terraform (tùy team)
└── README.md
```

## Cách dùng (dev)

```bash
cd environments/dev
cp terraform.tfvars.example terraform.tfvars
# Chỉnh project_name, aws_region, sửa backend.tf nếu dùng remote state S3
terraform init
terraform plan
# terraform apply
```

## Lưu ý

- Module **`ecs`** hiện chỉ tạo **cluster**; **task definition** + **service** + nối **target group ALB** cần bạn bổ sung khi có image và IAM (xem `modules/ecs/README.md`).
- Các module còn lại (`vpc`, `security_groups`, `alb`, `ecr`, `s3_frontend`, `cloudfront`, `cognito`, `monitoring`, `rds`) đã có resource Terraform tương ứng; `rds` chỉ tạo DB khi `create_rds = true`.
- Chi phí: NAT Gateway, RDS, Fargate — xem biến trong `environments/*/terraform.tfvars.example` và README từng module.

## Bảng ánh xạ dịch vụ AWS

| Thành phần   | Dịch vụ AWS    | Module              |
|-------------|----------------|---------------------|
| Network     | VPC            | `modules/vpc`       |
| FE static   | S3             | `modules/s3_frontend` |
| CDN         | CloudFront     | `modules/cloudfront` |
| BE          | ECS Fargate    | `modules/ecs`       |
| Registry    | ECR            | `modules/ecr`       |
| DB          | RDS PostgreSQL | `modules/rds`       |
| LB          | ALB (ELB)      | `modules/alb`       |
| Auth        | Cognito        | `modules/cognito`   |
| Giám sát    | CloudWatch     | `modules/monitoring` |
| IaC         | Terraform      | repo này            |
