# Initialize Terraform backend configuration with organization and workspace from cloud
terraform {
  backend "remote" {
    organization = "test_terraform_organization1"

    workspaces {
      name = "ch-test-deploy-workspace"
    }
  }
}

# Get token to access dynamically EKS Cluster
data "external" "get_k8s_token" {
  program = ["/bin/sh", "-c", "aws eks get-token --region ${var.AWS_REGION} --cluster-name ${var.EKS_CLUSTER_NAME} --output json | jq -c '{\"token\": .status.token}'"]
}

# Configure AWS provider with region where resources will be created
provider "aws" {
  region = var.AWS_REGION
}

# Kubernetes provider configuration
provider "kubernetes" {
  host                   = var.K8S_HOST
  cluster_ca_certificate = var.K8S_CLUSTER_CA_CERTIFICATE
  token                  = data.external.get_k8s_token.result["token"]
}

# Retrieve information about the existing AWS ECR repository
data "aws_ecr_repository" "ch_test" {
  name = "ch-test"
}

# Local variable to hold unique timestamp
locals {
  unique_tag = formatdate("YYYYMMDDhhmmss", timestamp())
}

# Login to the AWS ECR repository
resource "null_resource" "ecr_login" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = "aws ecr get-login-password --region ${var.AWS_REGION} | docker login --username AWS --password-stdin ${data.aws_ecr_repository.ch_test.repository_url}"
  }
}

# Build and push the Docker image
resource "null_resource" "build_and_push_image" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = "docker build -t ${data.aws_ecr_repository.ch_test.repository_url}:${local.unique_tag} ../../ && docker push ${data.aws_ecr_repository.ch_test.repository_url}:${local.unique_tag}"
  }

  depends_on = [null_resource.ecr_login]
}

# Kubernetes ConfigMap for storing application configuration
resource "kubernetes_config_map" "ch_test_config" {
  metadata {
    name = "ch-test-config"
  }

  data = {
    "PORT" = var.PORT
    "API_URL" = var.API_URL
    "AUTH_ACCESS_TOKEN_EXPIRES_IN_SEC" = var.AUTH_ACCESS_TOKEN_EXPIRES_IN_SEC
    "AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC" = var.AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC
    "GRAPHQL_CLIENT_TESTING_MODE" = var.GRAPHQL_CLIENT_TESTING_MODE
    "QUEUE_TYPE" = var.QUEUE_TYPE
    "RATE_LIMIT_INTERVAL_MS" = var.RATE_LIMIT_INTERVAL_MS
    "RATE_LIMIT_REQUESTS_PER_INTERVAL" = var.RATE_LIMIT_REQUESTS_PER_INTERVAL
    "SOURCE_SERVICE_SEND_EVENTS_INTERVAL_MS" = var.SOURCE_SERVICE_SEND_EVENTS_INTERVAL_MS
    "TARGET_SERVICE_GRAPHQL_URL" = var.TARGET_SERVICE_GRAPHQL_URL
    "TARGET_SERVICE_REQUEST_RETRIES" = var.TARGET_SERVICE_REQUEST_RETRIES
    "TARGET_SERVICE_RATE_LIMIT_INTERVAL_MS" = var.TARGET_SERVICE_RATE_LIMIT_INTERVAL_MS
    "TARGET_SERVICE_RATE_LIMIT_REQUESTS_PER_INTERVAL" = var.TARGET_SERVICE_RATE_LIMIT_REQUESTS_PER_INTERVAL
    "USER_REPOSITORY_TYPE" = var.USER_REPOSITORY_TYPE
  }
}

# Kubernetes Secret for storing application sensitive data
resource "kubernetes_secret" "ch_test_secret" {
  metadata {
    name = "ch-test-secret"
  }

  data = {
    "AUTH_ACCESS_TOKEN_SECRET" = var.AUTH_ACCESS_TOKEN_SECRET
    "PROXY_SERVICE_TEST_USERS_DATA" = var.PROXY_SERVICE_TEST_USERS_DATA
    "QUEUE_URL" = var.QUEUE_URL
    "SOURCE_SERVICE_TEST_USER_CREDENTIALS" = var.SOURCE_SERVICE_TEST_USER_CREDENTIALS
    "USER_REPOSITORY_URL" = var.USER_REPOSITORY_URL
  }
}

# Kubernetes Deployment resource for application
resource "kubernetes_deployment" "ch_test" {
  metadata {
    name = "ch-test-deployment"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        App = "ch-test"
      }
    }

    template {
      metadata {
        labels = {
          App = "ch-test"
        }
      }

      spec {
        container {
          image = "${data.aws_ecr_repository.ch_test.repository_url}:${local.unique_tag}"
          name  = "ch-test"

          # Environment variables from ConfigMap and Secret
          env {
            name = "PORT"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "PORT"
              }
            }
          }

          env {
            name = "API_URL"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "API_URL"
              }
            }
          }

          env {
            name = "AUTH_ACCESS_TOKEN_EXPIRES_IN_SEC"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "AUTH_ACCESS_TOKEN_EXPIRES_IN_SEC"
              }
            }
          }

          env {
            name = "AUTH_ACCESS_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.ch_test_secret.metadata[0].name
                key  = "AUTH_ACCESS_TOKEN_SECRET"
              }
            }
          }

          env {
            name = "AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC"
              }
            }
          }

          env {
            name = "GRAPHQL_CLIENT_TESTING_MODE"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "GRAPHQL_CLIENT_TESTING_MODE"
              }
            }
          }

          env {
            name = "QUEUE_TYPE"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "QUEUE_TYPE"
              }
            }
          }

          env {
            name = "QUEUE_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.ch_test_secret.metadata[0].name
                key  = "QUEUE_URL"
              }
            }
          }

          env {
            name = "PROXY_SERVICE_TEST_USERS_DATA"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.ch_test_secret.metadata[0].name
                key  = "PROXY_SERVICE_TEST_USERS_DATA"
              }
            }
          }

          env {
            name = "RATE_LIMIT_INTERVAL_MS"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "RATE_LIMIT_INTERVAL_MS"
              }
            }
          }

          env {
            name = "RATE_LIMIT_REQUESTS_PER_INTERVAL"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "RATE_LIMIT_REQUESTS_PER_INTERVAL"
              }
            }
          }

          env {
            name = "SOURCE_SERVICE_SEND_EVENTS_INTERVAL_MS"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "SOURCE_SERVICE_SEND_EVENTS_INTERVAL_MS"
              }
            }
          }

          env {
            name = "SOURCE_SERVICE_TEST_USER_CREDENTIALS"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.ch_test_secret.metadata[0].name
                key  = "SOURCE_SERVICE_TEST_USER_CREDENTIALS"
              }
            }
          }

          env {
            name = "TARGET_SERVICE_GRAPHQL_URL"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "TARGET_SERVICE_GRAPHQL_URL"
              }
            }
          }

          env {
            name = "TARGET_SERVICE_REQUEST_RETRIES"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "TARGET_SERVICE_REQUEST_RETRIES"
              }
            }
          }

          env {
            name = "TARGET_SERVICE_RATE_LIMIT_INTERVAL_MS"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "TARGET_SERVICE_RATE_LIMIT_INTERVAL_MS"
              }
            }
          }

          env {
            name = "TARGET_SERVICE_RATE_LIMIT_REQUESTS_PER_INTERVAL"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "TARGET_SERVICE_RATE_LIMIT_REQUESTS_PER_INTERVAL"
              }
            }
          }

          env {
            name = "USER_REPOSITORY_TYPE"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.ch_test_config.metadata[0].name
                key  = "USER_REPOSITORY_TYPE"
              }
            }
          }

          env {
            name = "USER_REPOSITORY_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.ch_test_secret.metadata[0].name
                key  = "USER_REPOSITORY_URL"
              }
            }
          }
        }
      }
    }
  }
}

# Kubernetes Service for exposing the application
resource "kubernetes_service" "ch_test" {
  metadata {
    name = "ch-test-service"
  }

  spec {
    selector = {
      App = "ch-test"
    }

    port {
      port        = 4000
      target_port = 4000
    }

    # Service is exposed externally using a cloud provider's load balancer
    # Automatically routes traffic to the Service's Pods, distributing load across them
    type = "LoadBalancer"
  }
}
