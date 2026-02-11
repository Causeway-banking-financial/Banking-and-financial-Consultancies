terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "causeway-banking-terraform-state-nonprod"
    key            = "nonprod/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "causeway-banking-terraform-locks-nonprod"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "causeway-banking"
      Environment = "nonprod"
      ManagedBy   = "terraform"
      CostCentre  = var.cost_centre
    }
  }
}

# ------------------------------------------------------------------------------
# Security (KMS, WAF, IAM)
# ------------------------------------------------------------------------------
module "security" {
  source = "../../modules/security"

  project     = "causeway-banking"
  environment = "nonprod"

  kms_key_deletion_window = 7
  enable_key_rotation     = true
  waf_rate_limit          = 5000 # More relaxed for testing
}

# ------------------------------------------------------------------------------
# Networking — cost-optimised for nonprod
# ------------------------------------------------------------------------------
module "networking" {
  source = "../../modules/networking"

  project     = "causeway-banking"
  environment = "nonprod"

  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["eu-west-1a", "eu-west-1b"]

  public_subnet_cidrs   = ["10.0.0.0/24", "10.0.1.0/24"]
  private_subnet_cidrs  = ["10.0.10.0/24", "10.0.11.0/24"]
  database_subnet_cidrs = ["10.0.20.0/24", "10.0.21.0/24"]

  enable_nat_gateway  = true
  single_nat_gateway  = true # Cost saving: single NAT for nonprod
  enable_flow_logs    = true
  flow_log_retention_days = 30
}

# ------------------------------------------------------------------------------
# Compute (ECS + ALB)
# ------------------------------------------------------------------------------
module "compute" {
  source = "../../modules/compute"

  project     = "causeway-banking"
  environment = "nonprod"

  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids

  acm_certificate_arn = var.acm_certificate_arn
  waf_web_acl_arn     = module.security.waf_web_acl_arn
  container_insights  = false # Save cost in nonprod
}

# ------------------------------------------------------------------------------
# Data (Aurora, DynamoDB, S3) — smaller instances for nonprod
# ------------------------------------------------------------------------------
module "data" {
  source = "../../modules/data"

  project     = "causeway-banking"
  environment = "nonprod"

  vpc_id                     = module.networking.vpc_id
  db_subnet_group_name       = module.networking.db_subnet_group_name
  ecs_tasks_security_group_id = module.compute.ecs_tasks_security_group_id
  kms_key_arn                = module.security.kms_key_arn

  aurora_instance_class       = "db.r6g.medium" # Smaller for nonprod
  aurora_instance_count       = 2
  aurora_backup_retention_days = 7
  aurora_deletion_protection  = false

  enable_dynamodb = true
  s3_bucket_suffix = var.s3_bucket_suffix
}

# ------------------------------------------------------------------------------
# Observability
# ------------------------------------------------------------------------------
module "observability" {
  source = "../../modules/observability"

  project     = "causeway-banking"
  environment = "nonprod"

  ecs_cluster_name = module.compute.ecs_cluster_name
  alb_arn_suffix   = module.compute.alb_arn_suffix
  aurora_cluster_id = module.data.aurora_cluster_id

  log_retention_days       = 30
  create_sns_topic         = true
  alarm_email              = var.alarm_email
  alb_5xx_threshold        = 50   # More relaxed in nonprod
  alb_latency_threshold_ms = 5000
  aurora_cpu_threshold     = 90
  aurora_connections_threshold = 150
}
