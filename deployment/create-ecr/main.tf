# Initialize Terraform backend configuration with organization and workspace from cloud
terraform {
  backend "remote" {
    organization = "test_terraform_organization1"

    workspaces {
      name = "ch-test-ecr-workspace"
    }
  }
}

# Configure AWS provider with region where resources will be created
provider "aws" {
  region = var.AWS_REGION
}

# ECR (Elastic Container Registry) module
module "ecr" {
  source = "terraform-aws-modules/ecr/aws"

  repository_name = "ch-test"

  # ECR lifecycle policy in JSON format
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        # Priority of this rule, lower value means higher priority
        rulePriority = 1,
        
        description  = "Keep last 30 images",

        # Image selection criteria
        selection = {
          tagStatus     = "tagged",
          tagPrefixList = ["v"],
          countType     = "imageCountMoreThan",
          countNumber   = 30
        },

        # Action to perform when criteria is met
        action = {
          type = "expire"
        }
      }
    ]
  })

  # Tags to attach to the ECR repository
  tags = {
    Terraform   = "true"
    Environment = "prod"
  }
}