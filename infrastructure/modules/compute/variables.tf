variable "project" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "causeway-banking"
}

variable "environment" {
  description = "Environment name (e.g. nonprod, prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "IDs of public subnets for the ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "IDs of private subnets for ECS tasks"
  type        = list(string)
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for HTTPS listener"
  type        = string
}

variable "container_insights" {
  description = "Enable CloudWatch Container Insights for the ECS cluster"
  type        = bool
  default     = true
}

variable "alb_access_log_bucket" {
  description = "S3 bucket name for ALB access logs (empty to disable)"
  type        = string
  default     = ""
}

variable "health_check_path" {
  description = "Default health check path for target groups"
  type        = string
  default     = "/health"
}

variable "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL to associate with the ALB"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
