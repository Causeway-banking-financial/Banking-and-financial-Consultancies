terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "causeway-banking-terraform-state-prod"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "causeway-banking-terraform-locks-prod"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "causeway-banking"
      Environment = "prod"
      ManagedBy   = "terraform"
      CostCentre  = var.cost_centre
    }
  }
}

# ------------------------------------------------------------------------------
# Security (KMS, WAF, IAM) — deployed first, other modules depend on keys
# ------------------------------------------------------------------------------
module "security" {
  source = "../../modules/security"

  project     = "causeway-banking"
  environment = "prod"

  kms_key_deletion_window = 30
  enable_key_rotation     = true
  waf_rate_limit          = 2000
}

# ------------------------------------------------------------------------------
# Networking
# ------------------------------------------------------------------------------
module "networking" {
  source = "../../modules/networking"

  project     = "causeway-banking"
  environment = "prod"

  vpc_cidr           = "10.1.0.0/16"
  availability_zones = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]

  public_subnet_cidrs   = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24"]
  private_subnet_cidrs  = ["10.1.10.0/24", "10.1.11.0/24", "10.1.12.0/24"]
  database_subnet_cidrs = ["10.1.20.0/24", "10.1.21.0/24", "10.1.22.0/24"]

  enable_nat_gateway  = true
  single_nat_gateway  = false # One per AZ for HA in prod
  enable_flow_logs    = true
  flow_log_retention_days = 365
}

# ------------------------------------------------------------------------------
# Compute (ECS + ALB)
# ------------------------------------------------------------------------------
module "compute" {
  source = "../../modules/compute"

  project     = "causeway-banking"
  environment = "prod"

  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids

  acm_certificate_arn = var.acm_certificate_arn
  waf_web_acl_arn     = module.security.waf_web_acl_arn
  container_insights  = true
}

# ------------------------------------------------------------------------------
# Data (Aurora, DynamoDB, S3)
# ------------------------------------------------------------------------------
module "data" {
  source = "../../modules/data"

  project     = "causeway-banking"
  environment = "prod"

  vpc_id                     = module.networking.vpc_id
  db_subnet_group_name       = module.networking.db_subnet_group_name
  ecs_tasks_security_group_id = module.compute.ecs_tasks_security_group_id
  kms_key_arn                = module.security.kms_key_arn

  aurora_instance_class       = "db.r6g.large"
  aurora_instance_count       = 3  # Writer + 2 readers for Tier 1
  aurora_backup_retention_days = 35
  aurora_deletion_protection  = true

  enable_dynamodb = true
  s3_bucket_suffix = var.s3_bucket_suffix
}

# ------------------------------------------------------------------------------
# Observability (CloudWatch, Alarms)
# ------------------------------------------------------------------------------
module "observability" {
  source = "../../modules/observability"

  project     = "causeway-banking"
  environment = "prod"

  ecs_cluster_name = module.compute.ecs_cluster_name
  alb_arn_suffix   = module.compute.alb_arn
  aurora_cluster_id = module.data.aurora_cluster_id

  log_retention_days       = 365
  create_sns_topic         = true
  alarm_email              = var.alarm_email
  alb_5xx_threshold        = 5
  alb_latency_threshold_ms = 2000
  aurora_cpu_threshold     = 75
  aurora_connections_threshold = 80
}
