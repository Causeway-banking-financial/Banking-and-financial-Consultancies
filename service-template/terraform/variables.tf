variable "project" {
  type    = string
  default = "causeway-banking"
}

variable "environment" {
  type = string
}

variable "service_name" {
  description = "Name of this service"
  type        = string
}

variable "service_tier" {
  description = "Service tier per ADR-0002 (tier-1, tier-2, tier-3)"
  type        = string
  validation {
    condition     = contains(["tier-1", "tier-2", "tier-3"], var.service_tier)
    error_message = "service_tier must be tier-1, tier-2, or tier-3"
  }
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

# Networking
variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "ecs_tasks_security_group_id" {
  type = string
}

# Compute
variable "ecs_cluster_id" {
  type = string
}

variable "ecs_cluster_name" {
  type = string
}

variable "ecs_execution_role_arn" {
  type = string
}

variable "https_listener_arn" {
  type = string
}

variable "container_port" {
  type    = number
  default = 8080
}

variable "task_cpu" {
  type    = number
  default = 256
}

variable "task_memory" {
  type    = number
  default = 512
}

variable "desired_count" {
  type    = number
  default = 2
}

variable "max_count" {
  type    = number
  default = 10
}

variable "listener_rule_priority" {
  description = "Priority for the ALB listener rule (must be unique per service)"
  type        = number
}

variable "path_patterns" {
  description = "URL path patterns to route to this service"
  type        = list(string)
  default     = ["/*"]
}

# Security
variable "kms_key_arn" {
  type = string
}

variable "secrets" {
  description = "Secrets to inject from Secrets Manager"
  type = list(object({
    name = string
    arn  = string
  }))
  default = []
}

# Observability
variable "log_retention_days" {
  type    = number
  default = 90
}
