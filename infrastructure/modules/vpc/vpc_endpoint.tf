# ECR + S3 VPC endpoints for pulling images from private subnets (auth + registry + image layers).
# Aligns with subnet/route layout in main.tf (private_app for interfaces; S3 gateway on all relevant route tables).

data "aws_region" "current" {}

locals {
  # Public RT + every private RT used by private_app / private_data (matches enable_nat_gateway branching in main.tf).
  s3_gateway_route_table_ids = concat(
    [aws_route_table.public.id],
    var.enable_nat_gateway ? [aws_route_table.private[0].id] : [
      aws_route_table.private_app_isolated[0].id,
      aws_route_table.private_data_isolated[0].id,
    ],
  )
}

resource "aws_security_group" "vpc_endpoints" {
  name        = "${local.name}-vpc-endpoints-sg"
  description = "HTTPS from VPC to interface VPC endpoints (ECR)"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "HTTPS from VPC CIDR"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name}-vpc-endpoints-sg"
  }
}

# ECR API — authentication / token (GetAuthorizationToken).
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.this.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private_app[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "${local.name}-ecr-api"
  }
}

# ECR DKR — Docker registry API (image manifest / metadata for pulls).
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.this.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private_app[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "${local.name}-ecr-dkr"
  }
}

# S3 — gateway endpoint for image layer blobs (and other S3 access from those subnets).
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.this.id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = local.s3_gateway_route_table_ids

  tags = {
    Name = "${local.name}-s3"
  }
}

# CloudWatch Logs — Fargate awslogs driver từ private subnet không NAT.
resource "aws_vpc_endpoint" "logs" {
  vpc_id              = aws_vpc.this.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private_app[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "${local.name}-logs"
  }
}
