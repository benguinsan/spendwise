# Scripts

Đặt script wrapper cho CI/CD (ví dụ `terraform plan` với `-var-file`, assume role AWS) hoặc đồng bộ build frontend lên S3 sau `terraform output`.

Ví dụ (local):

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../environments/dev"
terraform init
terraform "$@"
```
