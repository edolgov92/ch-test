variable "AWS_REGION" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "DB_PASSWORD" {
  description = "RDS root user password"
  type        = string
  sensitive   = true
}

variable "IP_ADDRESS" {
  description = "IP to allow access to RDS"
  type        = string
}

variable "EKS_CLUSTER_NAME" {
  description = "Kubernetes Cluster Name"
  type        = string
}