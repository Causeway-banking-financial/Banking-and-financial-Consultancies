variable "project" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "causeway-banking"
}

variable "environment" {
  description = "Environment name (e.g. nonprod, prod)"
  type        = string
}

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster to monitor"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ARN suffix of the ALB (for CloudWatch metrics)"
  type        = string
}

variable "aurora_cluster_id" {
  description = "ID of the Aurora cluster to monitor"
  type        = string
}

variable "log_retention_days" {
  description = "Retention period in days for application log groups"
  type        = number
  default     = 90
}

variable "alarm_sns_topic_arn" {
  description = "SNS topic ARN to send alarm notifications to"
  type        = string
  default     = ""
}

variable "create_sns_topic" {
  description = "Create a new SNS topic for alarms (when alarm_sns_topic_arn is empty)"
  type        = bool
  default     = true
}

variable "alarm_email" {
  description = "Email address for alarm notifications (used if create_sns_topic is true)"
  type        = string
  default     = ""
}

# SLO thresholds
variable "alb_5xx_threshold" {
  description = "ALB 5xx error count threshold for alarm"
  type        = number
  default     = 10
}

variable "alb_latency_threshold_ms" {
  description = "ALB p99 latency threshold in milliseconds"
  type        = number
  default     = 3000
}

variable "aurora_cpu_threshold" {
  description = "Aurora CPU utilization percentage threshold"
  type        = number
  default     = 80
}

variable "aurora_connections_threshold" {
  description = "Aurora database connections threshold"
  type        = number
  default     = 100
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
