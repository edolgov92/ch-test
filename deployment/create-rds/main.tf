terraform {
  backend "remote" {
    organization = "test_terraform_organization1"

    workspaces {
      name = "ch-test-workspace"
    }
  }
}

provider "aws" {
  region = var.AWS_REGION
}

data "aws_eks_cluster" "cluster" {
  name = var.EKS_CLUSTER_NAME
}

data "aws_vpc" "vpc" {
  id = data.aws_eks_cluster.cluster.vpc_config[0].vpc_id
}

data "aws_subnets" "subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
}

data "aws_security_groups" "node_security_groups" {
  filter {
    name   = "group-name"
    values = ["${var.EKS_CLUSTER_NAME}-node-*"]
  }
}

locals {
  subnet_ids = [for s in data.aws_subnets.subnets.ids : s]
  node_security_group_id = tolist(data.aws_security_groups.node_security_groups.ids)[0]
}

data "aws_availability_zones" "available" {}

resource "aws_db_subnet_group" "ch-test" {
  name       = "ch-test"
  subnet_ids = local.subnet_ids

  tags = {
    Name = "ch-test"
  }
}

resource "aws_security_group" "rds" {
  name   = "ch-test-rds-security-group"
  vpc_id = data.aws_vpc.vpc.id

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

resource "aws_db_parameter_group" "ch-test" {
  name   = "ch-test"
  family = "postgres14"

  parameter {
    name  = "log_connections"
    value = "1"
  }
}

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
