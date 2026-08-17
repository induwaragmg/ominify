terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# --- VPC NETWORK ---
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "ominify-vpc-${var.environment}"
  cidr = var.vpc_cidr

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = false
  enable_dns_hostnames = true

  tags = {
    Environment = var.environment
    Project     = "Ominify"
  }
}

# --- EKS CLUSTER ---
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "ominify-eks-${var.environment}"
  cluster_version = "1.30"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    general = {
      min_size     = 2
      max_size     = 10
      desired_size = 3

      instance_types = ["t3.large"]
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Environment = var.environment
    Project     = "Ominify"
  }
}

# --- RDS POSTGRESQL (for product-service & assistant-service) ---
resource "aws_db_subnet_group" "rds" {
  name       = "ominify-rds-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_db_instance" "postgres" {
  identifier           = "ominify-postgres-${var.environment}"
  allocated_storage    = 20
  max_allocated_storage = 100
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = "db.t4g.micro"
  db_name              = "ominify_db"
  username             = "postgres"
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.rds.name
  skip_final_snapshot  = true
  multi_az             = true
}

# --- ECR REPOSITORIES ---
locals {
  services = [
    "auth-service",
    "product-service",
    "order-service",
    "payment-service",
    "email-service",
    "assistant-service",
    "client",
    "admin"
  ]
}

resource "aws_ecr_repository" "apps" {
  for_each             = toset(local.services)
  name                 = "ominify/${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
