terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

locals {
  name = "${var.project_name}-${var.environment}"
  lambda_enabled = var.enable_post_confirmation_trigger && var.post_confirmation_database_url != null && var.post_confirmation_database_url != ""
  post_confirmation_lambda_dir = "${path.module}/lambda/post-confirmation"
}

data "aws_caller_identity" "current" {}

resource "null_resource" "post_confirmation_deps" {
  count = local.lambda_enabled ? 1 : 0

  # Rebuild node_modules when code changes.
  triggers = {
    package_json_sha = filesha1("${local.post_confirmation_lambda_dir}/package.json")
  }

  provisioner "local-exec" {
    command = "rm -rf \"${local.post_confirmation_lambda_dir}/node_modules\" && cd \"${local.post_confirmation_lambda_dir}\" && npm install --omit=dev --no-package-lock"
  }
}

data "archive_file" "post_confirmation_zip" {
  count = local.lambda_enabled ? 1 : 0
  type = "zip"

  # Include node_modules + index.js.
  source_dir  = local.post_confirmation_lambda_dir
  output_path = "${path.module}/.tmp/post-confirmation.zip"

  depends_on = [null_resource.post_confirmation_deps]
}

data "aws_iam_policy_document" "post_confirmation_assume_role" {
  count = local.lambda_enabled ? 1 : 0

  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "post_confirmation_lambda_role" {
  count = local.lambda_enabled ? 1 : 0

  name               = "${local.name}-post-confirmation-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.post_confirmation_assume_role[0].json
}

resource "aws_iam_role_policy" "post_confirmation_lambda_logs" {
  count = local.lambda_enabled ? 1 : 0

  name = "${local.name}-post-confirmation-lambda-logs"
  role = aws_iam_role.post_confirmation_lambda_role[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "post_confirmation_vpc_access" {
  count = local.lambda_enabled ? 1 : 0

  role       = aws_iam_role.post_confirmation_lambda_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_lambda_function" "post_confirmation" {
  count = local.lambda_enabled ? 1 : 0

  function_name = "${local.name}-post-confirmation-user-sync"
  role          = aws_iam_role.post_confirmation_lambda_role[0].arn

  runtime = "nodejs20.x"
  handler = "index.handler"

  filename         = data.archive_file.post_confirmation_zip[0].output_path
  source_code_hash = data.archive_file.post_confirmation_zip[0].output_base64sha256

  timeout      = 15
  memory_size  = 256
  publish      = false

  environment {
    variables = {
      # Used by lambda code to upsert into your app DB.
      DATABASE_URL = var.post_confirmation_database_url
    }
  }

  dynamic "vpc_config" {
    for_each = length(var.post_confirmation_subnet_ids) > 0 && length(var.post_confirmation_security_group_ids) > 0 ? [1] : []
    content {
      subnet_ids         = var.post_confirmation_subnet_ids
      security_group_ids = var.post_confirmation_security_group_ids
    }
  }

  tags = {
    Name = "${local.name}-post-confirmation"
  }

  depends_on = [
    aws_iam_role_policy_attachment.post_confirmation_vpc_access
  ]
}

resource "aws_lambda_permission" "allow_cognito_post_confirmation" {
  count = local.lambda_enabled ? 1 : 0

  statement_id  = "${local.name}-allow-cognito-post-confirmation"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_confirmation[0].function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.this.arn
}

resource "aws_cognito_user_pool" "this" {
  name = "${local.name}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  tags = {
    Name = "${local.name}-user-pool"
  }

  dynamic "lambda_config" {
    for_each = local.lambda_enabled ? [1] : []
    content {
      # Sync: after user confirms => upsert into app DB.
      post_confirmation = aws_lambda_function.post_confirmation[0].arn
    }
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.name}-web-client"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # Bật OAuth + callback_urls khi dùng Hosted UI / domain tùy chỉnh (DNS ngoài).
}
