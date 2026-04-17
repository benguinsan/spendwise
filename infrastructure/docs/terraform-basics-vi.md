# Terraform cho người mới: `main`, `variables`, `outputs` và lệnh chạy

Tài liệu này giải thích **ý nghĩa các file `.tf` thường gặp** trong repo `infrastructure/` và **thứ tự lệnh** khi bạn đã sẵn sàng chạy (bạn có thể chỉ đọc code trước, chưa cần `init`).

---

## 1. Terraform làm gì?

Terraform là công cụ **Infrastructure as Code (IaC)**:

- Bạn mô tả hạ tầng (VPC, S3, ECS, …) bằng file cấu hình.
- Terraform so sánh **trạng thái mong muốn** (trong code) với **trạng thái thực tế** (trên AWS và trong file **state**).
- Lệnh **`plan`** cho bạn xem sẽ **tạo / sửa / xóa** gì; **`apply`** thực hiện thay đổi đó.

Một **thư mục** (ví dụ `environments/dev/`) thường được coi là một **Terraform project** (một **root module**): Terraform đọc mọi file `*.tf` trong thư mục đó cùng lúc — tên file (`main.tf`, `variables.tf`, …) chỉ để **tổ chức**, không quy định thứ tự chạy.

---

## 2. `main.tf` — “mạch chính” khai báo tài nguyên

Trong `main.tf` (và có thể cả file khác như `providers.tf`) bạn thường thấy:

| Khối | Vai trò |
|------|--------|
| `terraform { ... }` | Phiên bản Terraform, **backend** (lưu state ở đâu), **required_providers** (plugin AWS, …). |
| `provider "aws" { ... }` | Cấu hình nhà cung cấp (ví dụ `region`). |
| `resource "aws_xxx" "tên" { ... }` | **Một đối tượng thật** trên cloud (một VPC, một bucket, …). Terraform quản lý vòng đời của nó. |
| `module "tên" { source = "..." ... }` | Gọi **module con** (thư mục `modules/...`): tái sử dụng và tách logic. |
| `data "aws_xxx" "tên" { ... }` | **Chỉ đọc** dữ liệu có sẵn (ví dụ danh sách AZ), **không tạo** resource mới. |
| `locals { ... }` | Biến nội bộ trong module, tính từ `var.*` hoặc resource khác — giúp code gọn, tránh lặp. |

**Tóm lại:** `main.tf` là nơi bạn **ghép** provider, resource, module và luồng dữ liệu giữa chúng.

---

## 3. `variables.tf` — đầu vào (input) của module

**Biến** (`variable`) là **tham số** bạn (hoặc file `terraform.tfvars`) truyền vào:

- Khai báo: tên biến, `type` (string, number, bool, list, …), `default` (tuỳ chọn), `description`, `sensitive = true` (ẩn khi in ra log nếu Terraform hỗ trợ).
- Khi **gọi module**: `module "vpc" { project_name = var.project_name ... }` — giá trị đi từ root xuống module con.

**Vì sao cần variables?**

- Tách **môi trường** (dev/prod) mà không copy cả đống resource.
- Tránh hard-code mật khẩu, region — dùng `tfvars` hoặc biến môi trường CI.

**File `terraform.tfvars`** (thường **không commit**, có `.gitignore`): gán giá trị cụ thể cho biến, ví dụ `aws_region = "ap-southeast-1"`. Repo có `terraform.tfvars.example` làm mẫu.

---

## 4. `outputs.tf` — đầu ra sau khi apply

**Output** là giá trị Terraform **in ra** sau khi tạo xong (hoặc để module cha / CLI / script CI đọc):

- Ví dụ: `cloudfront_domain`, `ecr_repository_url`, `alb_dns_name` — bạn dùng để cấu hình DNS ngoài, pipeline deploy, v.v.
- Trong module con: `output` được **export**; ở root gọi `module.xxx.output_name`.

**Lưu ý:** `output` không “chạy” một lệnh riêng — nó được tính khi `plan`/`apply` và hiện ở cuối `apply` hoặc `terraform output`.

---

## 5. Module con (`modules/<tên>/`)

Mỗi module cũng có thể có **`main.tf`**, **`variables.tf`**, **`outputs.tf`** (và `README.md`):

- **Root** (`environments/dev/`): quyết định **môi trường**, gọi nhiều module, nối output module này vào input module kia (ví dụ `vpc_id` → `security_groups`).
- **Module con**: đóng gói một “mảnh” hạ tầng (VPC, ECR, …), dễ đọc và tái sử dụng.

`source = "../../modules/vpc"` nghĩa là: đường dẫn **tương đối** tới thư mục module.

---

## 6. Thư mục `environments/` — tác dụng, mục đích, vì sao tách riêng?

Trong repo SpendWise, `infrastructure/environments/` có các thư mục con như **`dev/`**, **`prod/`**. Mỗi thư mục đó là một **root Terraform riêng** (một “dự án” Terraform độc lập).

### Tác dụng

- Là **điểm vào** khi bạn chạy lệnh: `cd environments/dev` rồi `terraform init` / `plan` / `apply`.
- Chứa file **ghép toàn bộ hạ tầng** cho **một môi trường cụ thể**: `main.tf` (gọi các module trong `modules/`), `variables.tf`, `outputs.tf`, `providers.tf`, `backend.tf`, `terraform.tfvars` (hoặc `.example`).

### Mục đích

| Mục đích | Giải thích ngắn |
|----------|------------------|
| **Tách state** | Mỗi môi trường thường có **file state riêng** (local `terraform.tfstate` hoặc **key khác nhau** trên S3 backend). Dev và prod **không** dùng chung một state — tránh sửa dev làm đổi prod. |
| **Giá trị khác nhau** | Cùng một bộ module (`vpc`, `ecr`, …) nhưng `terraform.tfvars` khác: region, `create_rds`, `multi_az`, mật khẩu DB, bật/tắt NAT, … |
| **An toàn vận hành** | Quy trình rõ: làm việc trong `dev/` trước; `prod/` chỉ `plan`/`apply` khi đã review, thường qua pipeline hoặc người có quyền. |
| **Backend / khóa state** | `backend.tf` có thể trỏ **bucket/key** khác nhau (`.../dev/...` vs `.../prod/...`), kèm DynamoDB lock — giảm xung đột khi nhiều người chạy Terraform. |

### Tại sao phải chia ra (thay vì gộp một chỗ)?

1. **Cô lập blast radius** — Lỗi cấu hình hoặc `apply` nhầm ít khi xoá nhầm VPC/RDS production nếu state và thư mục tách bạch.
2. **Một bộ module, nhiều bản triển khai** — Thư mục `modules/` giữ code **tái sử dụng**; `environments/*` chỉ là **cách lắp ráp + tham số** cho từng stage (dev/staging/prod).
3. **Phù hợp team** — Dev có quyền tự apply `dev`; `prod` hạn chế hơn, audit được (ai apply file nào, state nào).
4. **Terraform thiết kế theo “working directory”** — Mỗi lần `init`, Terraform gắn **backend + state** với **thư mục hiện tại**; tách folder là cách phổ biến nhất để có nhiều môi trường.

**Tóm lại:** `modules/` = **khối xây**; `environments/` = **công trình dev vs prod** — cùng bộ khối nhưng thông số, state và quy trình khác nhau.

---

## 7. Khi nào chạy lệnh gì? (thứ tự thông thường)

Chỉ chạy khi bạn đã đọc code, có AWS credential, và hiểu **chi phí** (NAT, RDS, …).

| Lệnh | Ý nghĩa |
|------|--------|
| `terraform init` | Tải provider/plugin, cấu hình backend state (nếu có). Làm **một lần** sau khi clone hoặc đổi backend/module. |
| `terraform fmt -recursive` | (Tuỳ chọn) format file `.tf` cho đồng nhất. |
| `terraform validate` | Kiểm tra **cú pháp và cấu trúc** (sau `init`). **Không** gọi API AWS để tạo resource. |
| `terraform plan` | Tính toán diff: sẽ thêm/sửa/xóa gì. **Nên xem kỹ** trước khi apply. |
| `terraform apply` | Áp dụng thay đổi lên AWS (và cập nhật **state**). |

**State file** (`terraform.tfstate` hoặc remote S3): Terraform dùng nó để biết ID resource hiện tại — **không xóa tay** nếu không hiểu hậu quả.

---

## 8. Liên hệ với repo SpendWise

- **Đọc từng module:** mở `modules/<tên>/README.md` — có bảng **Inputs / Outputs** và tóm tắt **`main.tf`**.
- **Điểm vào môi trường:** `environments/dev/main.tf` gọi lần lượt các module và truyền `module.vpc.vpc_id` sang module khác — đó chính là “sơ đồ” trong code.

Khi bạn sẵn sàng, làm theo phần “Cách dùng” trong [`../README.md`](../README.md).
