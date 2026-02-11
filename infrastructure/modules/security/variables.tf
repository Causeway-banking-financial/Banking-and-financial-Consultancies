variable "project" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "causeway-banking"
}

variable "environment" {
  description = "Environment name (e.g. nonprod, prod)"
  type        = string
}

variable "kms_key_deletion_window" {
  description = "Waiting period in days before KMS key deletion"
  type        = number
  default     = 30
}

variable "enable_key_rotation" {
  description = "Enable automatic annual rotation of the KMS key"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "Maximum requests per 5-minute window per IP"
  type        = number
  default     = 2000
}

variable "waf_scope" {
  description = "WAF scope: REGIONAL for ALB, CLOUDFRONT for distributions"
  type        = string
  default     = "REGIONAL"
}

variable "enable_shield_advanced" {
  description = "Enable AWS Shield Advanced (additional cost)"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
