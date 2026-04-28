# Module `amplify`

Module này tạo:
- `aws_amplify_app`
- `aws_amplify_branch`

Mục tiêu: deploy frontend từ repository Git lên AWS Amplify Hosting.

## Input chính

- `project_name`, `environment`: tiền tố tên resource.
- `repository_url`: URL repo Git.
- `access_token`: token truy cập repo (sensitive).
- `branch_name`: branch deploy (mặc định `main`).
- `build_spec`: buildspec tùy chọn.
- `app_environment_variables`, `branch_environment_variables`: biến môi trường cho app/branch.

## Output chính

- `app_id`, `app_arn`
- `default_domain`
- `branch_name`, `branch_arn`
