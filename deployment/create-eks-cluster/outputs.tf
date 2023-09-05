output "EKS_CLUSTER_ENDPOINT" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "EKS_CLUSTER_SECURITY_GROUP_ID" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "EKS_CLUSTER_NAME" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}