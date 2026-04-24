# terraform {
#   backend "s3" {
#     bucket         = "your-terraform-state-bucket"
#     key            = "spendwise/prod/terraform.tfstate"
#     region         = "ap-southeast-1"
#     encrypt        = true
#     dynamodb_table = "terraform-locks"
#   }
# }
