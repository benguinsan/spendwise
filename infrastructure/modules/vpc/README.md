# Module `vpc`

Mạng nền cho SpendWise trên AWS: **một VPC**, **Internet Gateway**, **2 AZ**, subnet **public** (ALB), **private app** (ECS Fargate), **private data** (RDS), và **một NAT Gateway** (tùy bật) để subnet private ra internet (pull image ECR, cập nhật, v.v.).

---

## Các file trong module

| File | Nội dung chính |
|------|----------------|
| **`main.tf`** | Khai báo provider AWS (phiên bản ~5.x). `locals.name` = `{project}-{env}`. **Resource:** `aws_vpc`, `aws_internet_gateway`, 2× `aws_subnet` public / private_app / private_data (`cidrsubnet` từ `vpc_cidr`), EIP + `aws_nat_gateway` (khi `enable_nat_gateway`), bảng route public (0.0.0.0/0 → IGW), bảng route private (0.0.0.0/0 → NAT) hoặc bảng **không default route** khi tắt NAT (subnet private chỉ nội bộ). `aws_route_table_association` gắn subnet với đúng route table. |
| **`variables.tf`** | Đầu vào: tên dự án, môi trường, CIDR VPC, danh sách **đúng 2 AZ**, cờ bật NAT. |
| **`outputs.tf`** | Xuất `vpc_id`, danh sách ID subnet public / private app / private data, và `nat_gateway_ids` (rỗng nếu tắt NAT). |

---

## Biến đầu vào (`variables.tf`)

| Biến | Kiểu | Mặc định | Ý nghĩa |
|------|------|----------|---------|
| `project_name` | string | — | Tiền tố tên tài nguyên |
| `environment` | string | — | Ví dụ `dev`, `prod` |
| `vpc_cidr` | string | `10.0.0.0/16` | Dải IPv4 của VPC |
| `availability_zones` | list(string) | — | **Hai** AZ trong region (root thường lấy từ `data.aws_availability_zones`) |
| `enable_nat_gateway` | bool | `true` | `false` tiết kiệm chi phí nhưng private subnet **không** có default route internet (phù hợp khi chỉ validate cấu trúc) |

---

## Đầu ra (`outputs.tf`)

| Output | Mô tả |
|--------|--------|
| `vpc_id` | ID VPC |
| `public_subnet_ids` | 2 subnet public — đặt ALB |
| `private_app_subnet_ids` | 2 subnet app — đặt task Fargate |
| `private_data_subnet_ids` | 2 subnet data — đặt RDS |
| `nat_gateway_ids` | ID NAT (nếu có) |

---

## Ghi chú cho người mới

- **NAT Gateway** có phí cố định ~hàng chục USD/tháng mỗi NAT; dev có thể tắt nếu chưa cần ECS pull từ internet.
- CIDR subnet dùng `cidrsubnet(vpc_cidr, 8, index)`: public `+1,+2`, app `+11,+12`, data `+21,+22` — tránh chồng lấn nếu đổi logic phải kiểm tra lại.

Xem thêm: [Terraform cơ bản](../../docs/terraform-basics-vi.md).
