terraform {
  backend "remote" {
    organization = "test_terraform_organization1"

    workspaces {
      name = "ch-test-ecr-workspace"
    }
  }
}

provider "aws" {
  region = var.AWS_REGION
}

module "ecr" {
  source = "terraform-aws-modules/ecr/aws"

  repository_name = "ch-test"

  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1,
        description  = "Keep last 30 images",
        selection = {
          tagStatus     = "tagged",
          tagPrefixList = ["v"],
          countType     = "imageCountMoreThan",
          countNumber   = 30
        },
        action = {
          type = "expire"
        }
      }
    ]
  })

  tags = {
    Terraform   = "true"
    Environment = "prod"
  }
}