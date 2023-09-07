# Initialize Terraform backend configuration with organization and workspace from cloud
terraform {
  backend "remote" {
    organization = "test_terraform_organization1"

    workspaces {
      name = "ch-test-eks-workspace"
    }
  }
}

# Configure AWS provider with region where resources will be created
provider "aws" {
  region = var.AWS_REGION
}

# Fetch available AWS availability zones
data "aws_availability_zones" "available" {
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

locals {
  # Generate EKS cluster name
  cluster_name = "test-eks-${random_string.suffix.result}"
}

resource "random_string" "suffix" {
  length  = 8
  special = false
}

# VPC (Virtual Private Cloud) Module Configuration
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "education-vpc"

  # CIDR block for the VPC; defines the range of IP addresses for the VPC.
  cidr = "10.0.0.0/16"

  # Availability Zones for subnets. 
  # The slice function chooses the first 3 availability zones from the available ones.
  azs  = slice(data.aws_availability_zones.available.names, 0, 3)

  # List of CIDR blocks for private and public subnets within the VPC.
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]

  # Enable NAT Gateway for VPC to allow private subnet resources to access the Internet.
  enable_nat_gateway   = true

  # Use a single shared NAT Gateway across all Availability Zones.
  single_nat_gateway   = true

  # Enable DNS hostname support for the VPC, allowing EC2 instances to have DNS hostnames.
  enable_dns_hostnames = true

  # Tagging for Kubernetes
  public_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                      = 1
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"             = 1
  }
}

# EKS cluster module configuration
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.3"

  cluster_name    = local.cluster_name
  cluster_version = "1.27"

  # ID of the VPC where the EKS cluster will be deployed.
  vpc_id                         = module.vpc.vpc_id

  # Subnet IDs from the previously created VPC module for the EKS cluster.
  subnet_ids                     = module.vpc.private_subnets

  # Whether the cluster endpoint is accessible from the public internet.
  cluster_endpoint_public_access = true

  # Default settings for managed node groups.
  eks_managed_node_group_defaults = {
    # The type of Amazon Machine Image (AMI) to use for the nodes.
    ami_type = "AL2_x86_64"
  }

  # Configuration for managed node groups.
  eks_managed_node_groups = {
    one = {
      name = "node-group-1"

      instance_types = ["t3.small"]

      # Minimum, maximum and desired number of nodes in the group.
      min_size     = 1
      max_size     = 3
      desired_size = 2
    }

    two = {
      name = "node-group-2"

      instance_types = ["t3.small"]

      # Minimum, maximum and desired number of nodes in the group.
      min_size     = 1
      max_size     = 2
      desired_size = 1
    }
  }
}

# Fetch the IAM policy for the Amazon EBS CSI driver from AWS.
# This policy defines the permissions required for the EBS CSI driver.
data "aws_iam_policy" "ebs_csi_policy" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

# Create an IAM role with OIDC identity for the EBS CSI driver.
# OIDC identity allows the Kubernetes service account to assume this role.
module "irsa-ebs-csi" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "4.7.0"

  # Whether to create the IAM role.
  create_role                   = true

  # Name of the IAM role. It is dynamically generated based on the EKS cluster name.
  role_name                     = "AmazonEKSTFEBSCSIRole-${module.eks.cluster_name}"
  
  # URL of the OIDC provider tied to the EKS cluster.
  provider_url                  = module.eks.oidc_provider
  
  # Attach the EBS CSI driver policy to the IAM role.
  role_policy_arns              = [data.aws_iam_policy.ebs_csi_policy.arn]

  # Specify the service account in the Kubernetes cluster that can assume this role.
  oidc_fully_qualified_subjects = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
}

# Create an EKS addon for the EBS CSI driver.
# This will install and manage the EBS CSI driver on the EKS cluster.
# Amazon Elastic Block Store (EBS) Container Storage Interface (CSI) driver
# provides a CSI interface that allows Amazon EKS clusters to manage the lifecycle
# of Amazon EBS volumes for persistent data storage.
resource "aws_eks_addon" "ebs-csi" {
  cluster_name             = module.eks.cluster_name
  addon_name               = "aws-ebs-csi-driver"
  addon_version            = "v1.20.0-eksbuild.1"

  # IAM role that the EBS CSI driver will assume.
  service_account_role_arn = module.irsa-ebs-csi.iam_role_arn

  # Custom tags for identifying this resource.
  tags = {
    "eks_addon" = "ebs-csi"
    "terraform" = "true"
  }
}