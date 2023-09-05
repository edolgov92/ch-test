variable "AWS_REGION" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "K8S_CLUSTER_CA_CERTIFICATE" {
  description = "PEM-encoded CA cert for Kubernetes."
  type        = string
  sensitive   = true
}

variable "K8S_HOST" {
  description = "The hostname (in form of URI) of Kubernetes master."
  type        = string
  sensitive   = true
}

# App specific Variables

variable "PORT" {
  type        = string
  default     = ""
}

variable "API_URL" {
  type        = string
  default     = ""
}

variable "AUTH_ACCESS_TOKEN_EXPIRES_IN_SEC" {
  type        = string
  default     = ""
}

variable "AUTH_ACCESS_TOKEN_SECRET" {
  type        = string
  sensitive   = true
  default     = ""
}

variable "AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC" {
  type        = string
  default     = ""
}

variable "GRAPHQL_CLIENT_TESTING_MODE" {
  type        = string
  default     = ""
}

variable "QUEUE_TYPE" {
  type        = string
  default     = ""
}

variable "QUEUE_URL" {
  type        = string
  sensitive   = true
  default     = ""
}

variable "PROXY_SERVICE_TEST_USERS_DATA" {
  type        = string
  sensitive   = true
  default     = ""
}

variable "RATE_LIMIT_INTERVAL_MS" {
  type        = string
  default     = ""
}

variable "RATE_LIMIT_REQUESTS_PER_INTERVAL" {
  type        = string
  default     = ""
}

variable "SOURCE_SERVICE_SEND_EVENTS_INTERVAL_MS" {
  type        = string
  default     = ""
}

variable "SOURCE_SERVICE_TEST_USER_CREDENTIALS" {
  type        = string
  sensitive   = true
  default     = ""
}

variable "TARGET_SERVICE_GRAPHQL_URL" {
  type        = string
  default     = ""
}

variable "TARGET_SERVICE_REQUEST_RETRIES" {
  type        = string
  default     = ""
}

variable "TARGET_SERVICE_RATE_LIMIT_INTERVAL_MS" {
  type        = string
  default     = ""
}

variable "TARGET_SERVICE_RATE_LIMIT_REQUESTS_PER_INTERVAL" {
  type        = string
  default     = ""
}

variable "USER_REPOSITORY_TYPE" {
  type        = string
  default     = ""
}

variable "USER_REPOSITORY_URL" {
  type        = string
  sensitive   = true
  default     = ""
}
