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

variable "db_subnet_group_name" {
  description = "Name of the database subnet group"
  type        = string
}

variable "ecs_tasks_security_group_id" {
  description = "Security group ID of the ECS tasks (allowed to connect to Aurora)"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN of the KMS key for encryption at rest"
  type        = string
}

# Aurora
variable "aurora_engine_version" {
  description = "Aurora PostgreSQL engine version"
  type        = string
  default     = "15.4"
}

variable "aurora_instance_class" {
  description = "Instance class for Aurora readers/writers"
  type        = string
  default     = "db.r6g.large"
}

variable "aurora_instance_count" {
  description = "Number of Aurora instances (writer + readers)"
  type        = number
  default     = 2
}

variable "aurora_backup_retention_days" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 30
}

variable "aurora_deletion_protection" {
  description = "Enable deletion protection for Aurora cluster"
  type        = bool
  default     = true
}

variable "aurora_database_name" {
  description = "Name of the default database to create"
  type        = string
  default     = "causeway"
}

# DynamoDB
variable "enable_dynamodb" {
  description = "Create a DynamoDB table for session/cache data"
  type        = bool
  default     = true
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
  default     = "sessions"
}

# S3
variable "s3_bucket_suffix" {
  description = "Suffix for S3 bucket names (must be globally unique)"
  type        = string
}

variable "s3_versioning" {
  description = "Enable versioning on S3 buckets"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
