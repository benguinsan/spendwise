# Remote state (bật khi team dùng S3 + DynamoDB lock)
#
# terraform {
#   backend "s3" {
#     bucket         = "your-terraform-state-bucket"
#     key            = "spendwise/dev/terraform.tfstate"
#     region         = "ap-southeast-1"
#     encrypt        = true
#     dynamodb_table = "terraform-locks"
#   }
# }
