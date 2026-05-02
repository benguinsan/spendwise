# db_password_secret

Stores the RDS application user password in **one** AWS Secrets Manager secret (plain string, not JSON) to minimize cost per secret.

- If `plaintext_password` is empty, Terraform generates a random password and stores it.
- If `plaintext_password` is set, that value is stored (still avoid committing real passwords in git; use env/CI or `terraform.tfvars` gitignored).

Downstream modules (RDS, ECS env) should receive the password from this module output in the same apply so RDS and the secret stay in sync.
