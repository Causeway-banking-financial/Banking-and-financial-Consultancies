variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-west-1"
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for nonprod domain"
  type        = string
}

variable "s3_bucket_suffix" {
  description = "Globally unique suffix for S3 bucket names"
  type        = string
}

variable "alarm_email" {
  description = "Email for alarm notifications"
  type        = string
}

variable "cost_centre" {
  description = "Cost centre tag for billing allocation"
  type        = string
  default     = "banking-financial"
}
