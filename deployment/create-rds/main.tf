# Initialize Terraform backend configuration with organization and workspace from cloud
terraform {
  backend "remote" {
    organization = "test_terraform_organization1"

    workspaces {
      name = "ch-test-rds-workspace"
    }
  }
}

# Configure AWS provider with region where resources will be created
provider "aws" {
  region = var.AWS_REGION
}

# Fetch information about the existing EKS cluster by its name
data "aws_eks_cluster" "cluster" {
  name = var.EKS_CLUSTER_NAME
}

# Fetch VPC information where the EKS cluster is deployed
data "aws_vpc" "vpc" {
  id = data.aws_eks_cluster.cluster.vpc_config[0].vpc_id
}

# Fetch subnet IDs for the given VPC
data "aws_subnets" "subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
}

# Fetch node security group IDs for the given EKS cluster
data "aws_security_groups" "node_security_groups" {
  filter {
    name   = "group-name"
    values = ["${var.EKS_CLUSTER_NAME}-node-*"]
  }
}

# Local variables to hold subnet IDs and nodes security group ID
locals {
  subnet_ids = [for s in data.aws_subnets.subnets.ids : s]
  node_security_group_id = tolist(data.aws_security_groups.node_security_groups.ids)[0]
}

# Fetch availability zones for region
data "aws_availability_zones" "available" {}

# Create an RDS subnet group for the database
resource "aws_db_subnet_group" "ch-test" {
  name       = "ch-test"
  subnet_ids = local.subnet_ids

  tags = {
    Name = "ch-test"
  }
}

# Create a security group for RDS instance
resource "aws_security_group" "rds" {
  name   = "ch-test-rds-security-group"
  vpc_id = data.aws_vpc.vpc.id

  # Ingress rules to allow access for user's IP address and EKS nodes security group
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.IP_ADDRESS]
  }

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [local.node_security_group_id]
  }

  # Egress rule to allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ch-test-rds"
  }
}

# Create an RDS parameter group for customizing the database
resource "aws_db_parameter_group" "ch-test" {
  name   = "ch-test"
  family = "postgres14"

  parameter {
    name  = "log_connections"
    value = "1"
  }
}

# Create an RDS instance
resource "aws_db_instance" "ch-test" {
  identifier             = "ch-test"
  instance_class         = "db.t3.micro"
  allocated_storage      = 5
  engine                 = "postgres"
  engine_version         = "14"
  username               = "postgres"
  password               = var.DB_PASSWORD
  db_subnet_group_name   = aws_db_subnet_group.ch-test.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.ch-test.name
  publicly_accessible    = true
  skip_final_snapshot    = true
}
