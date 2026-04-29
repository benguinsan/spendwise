terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  name = "${var.project_name}-${var.environment}"
}

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${local.name}-vpc"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags = {
    Name = "${local.name}-igw"
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index + 1)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.name}-public-${count.index + 1}"
    Tier = "public"
  }
}

# Private app subnet
resource "aws_subnet" "private_app" {
  count             = 2
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 11)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${local.name}-private-app-${count.index + 1}"
    Tier = "private-app"
  }
}

# Private data subnet
resource "aws_subnet" "private_data" {
  count             = 2
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 21)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${local.name}-private-data-${count.index + 1}"
    Tier = "private-data"
  }
}

# EIP for NAT Gateway
resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"
  tags = {
    Name = "${local.name}-nat-eip"
  }
}

# NAT Gateway
resource "aws_nat_gateway" "this" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "${local.name}-nat"
  }

  depends_on = [aws_internet_gateway.this]
}

# Public route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }
  tags = {
    Name = "${local.name}-public-rt"
  }
}

# Public route table association
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private route table
resource "aws_route_table" "private" {
  count  = var.enable_nat_gateway ? 1 : 0
  vpc_id = aws_vpc.this.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this[0].id
  }
  tags = {
    Name = "${local.name}-private-rt"
  }
}

# Private route table association
resource "aws_route_table_association" "private_app" {
  count          = var.enable_nat_gateway ? 2 : 0
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private[0].id
}

# Private app isolated route table
resource "aws_route_table" "private_app_isolated" {
  count  = var.enable_nat_gateway ? 0 : 1
  vpc_id = aws_vpc.this.id
  tags = {
    Name = "${local.name}-private-app-isolated-rt"
  }
}

resource "aws_route_table_association" "private_app_no_nat" {
  count          = var.enable_nat_gateway ? 0 : 2
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private_app_isolated[0].id
}

resource "aws_route_table" "private_data_isolated" {
  count  = var.enable_nat_gateway ? 0 : 1
  vpc_id = aws_vpc.this.id
  tags = {
    Name = "${local.name}-private-data-rt"
  }
}

resource "aws_route_table_association" "private_data_no_nat" {
  count          = var.enable_nat_gateway ? 0 : 2
  subnet_id      = aws_subnet.private_data[count.index].id
  route_table_id = aws_route_table.private_data_isolated[0].id
}

resource "aws_route_table_association" "private_data_with_nat" {
  count          = var.enable_nat_gateway ? 2 : 0
  subnet_id      = aws_subnet.private_data[count.index].id
  route_table_id = aws_route_table.private[0].id
}
