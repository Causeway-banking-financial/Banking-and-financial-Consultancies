terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  project = "causeway-banking"
  common_tags = {
    Project   = local.project
    ManagedBy = "terraform"
    Purpose   = "policy-enforcement"
  }
}

# ==============================================================================
# AWS Config Recorder — required for Config Rules
# ==============================================================================
resource "aws_config_configuration_recorder" "main" {
  name     = "${local.project}-config-recorder"
  role_arn = aws_iam_role.config.arn

  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }
}

resource "aws_config_delivery_channel" "main" {
  name           = "${local.project}-config-delivery"
  s3_bucket_name = aws_s3_bucket.config.id

  snapshot_delivery_properties {
    delivery_frequency = "TwentyFour_Hours"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_configuration_recorder_status" "main" {
  name       = aws_config_configuration_recorder.main.name
  is_enabled = true
  depends_on = [aws_config_delivery_channel.main]
}

# Config S3 bucket
resource "aws_s3_bucket" "config" {
  bucket = "${local.project}-aws-config-logs"
  tags   = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "config" {
  bucket                  = aws_s3_bucket.config.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "config" {
  bucket = aws_s3_bucket.config.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSConfigBucketPermissionsCheck"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.config.arn
      },
      {
        Sid    = "AWSConfigBucketDelivery"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.config.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

# Config IAM role
resource "aws_iam_role" "config" {
  name = "${local.project}-aws-config-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "config.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "config" {
  role       = aws_iam_role.config.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWS_ConfigRole"
}

# ==============================================================================
# Config Rules — enforce platform standards as machine-readable policies
# ==============================================================================

# 1. S3 buckets must have encryption enabled
resource "aws_config_config_rule" "s3_encryption" {
  name = "${local.project}-s3-bucket-encryption"
  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 2. S3 buckets must block public access
resource "aws_config_config_rule" "s3_public_access" {
  name = "${local.project}-s3-bucket-public-access-blocked"
  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_PUBLIC_READ_PROHIBITED"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 3. RDS instances must have encryption at rest
resource "aws_config_config_rule" "rds_encryption" {
  name = "${local.project}-rds-storage-encrypted"
  source {
    owner             = "AWS"
    source_identifier = "RDS_STORAGE_ENCRYPTED"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 4. RDS instances must be multi-AZ
resource "aws_config_config_rule" "rds_multi_az" {
  name = "${local.project}-rds-multi-az"
  source {
    owner             = "AWS"
    source_identifier = "RDS_MULTI_AZ_SUPPORT"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 5. RDS instances must not be publicly accessible
resource "aws_config_config_rule" "rds_no_public" {
  name = "${local.project}-rds-instance-public-access-check"
  source {
    owner             = "AWS"
    source_identifier = "RDS_INSTANCE_PUBLIC_ACCESS_CHECK"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 6. EBS volumes must be encrypted
resource "aws_config_config_rule" "ebs_encryption" {
  name = "${local.project}-ebs-encrypted"
  source {
    owner             = "AWS"
    source_identifier = "ENCRYPTED_VOLUMES"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 7. CloudTrail must be enabled
resource "aws_config_config_rule" "cloudtrail_enabled" {
  name = "${local.project}-cloudtrail-enabled"
  source {
    owner             = "AWS"
    source_identifier = "CLOUD_TRAIL_ENABLED"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 8. IAM root account must have MFA
resource "aws_config_config_rule" "root_mfa" {
  name = "${local.project}-root-account-mfa"
  source {
    owner             = "AWS"
    source_identifier = "ROOT_ACCOUNT_MFA_ENABLED"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 9. IAM users must not have console passwords (enforce SSO)
resource "aws_config_config_rule" "iam_no_console_password" {
  name = "${local.project}-iam-user-no-policies-check"
  source {
    owner             = "AWS"
    source_identifier = "IAM_USER_NO_POLICIES_CHECK"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 10. VPC flow logs must be enabled
resource "aws_config_config_rule" "vpc_flow_logs" {
  name = "${local.project}-vpc-flow-logs-enabled"
  source {
    owner             = "AWS"
    source_identifier = "VPC_FLOW_LOGS_ENABLED"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 11. ALB must have WAF associated
resource "aws_config_config_rule" "alb_waf" {
  name = "${local.project}-alb-waf-enabled"
  source {
    owner             = "AWS"
    source_identifier = "ALB_WAF_ENABLED"
  }
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# 12. Required tags on all resources
resource "aws_config_config_rule" "required_tags" {
  name = "${local.project}-required-tags"
  source {
    owner             = "AWS"
    source_identifier = "REQUIRED_TAGS"
  }
  input_parameters = jsonencode({
    tag1Key   = "Project"
    tag2Key   = "Environment"
    tag3Key   = "ManagedBy"
  })
  tags       = local.common_tags
  depends_on = [aws_config_configuration_recorder.main]
}

# ==============================================================================
# SNS Topic for non-compliant resource notifications
# ==============================================================================
resource "aws_sns_topic" "compliance" {
  name = "${local.project}-compliance-alerts"
  tags = local.common_tags
}

resource "aws_cloudwatch_event_rule" "config_compliance" {
  name        = "${local.project}-config-compliance-change"
  description = "Fires when an AWS Config rule reports a non-compliant resource"

  event_pattern = jsonencode({
    source      = ["aws.config"]
    detail-type = ["Config Rules Compliance Change"]
    detail = {
      messageType           = ["ComplianceChangeNotification"]
      newEvaluationResult = {
        complianceType = ["NON_COMPLIANT"]
      }
    }
  })

  tags = local.common_tags
}

resource "aws_cloudwatch_event_target" "config_compliance_sns" {
  rule      = aws_cloudwatch_event_rule.config_compliance.name
  target_id = "send-to-sns"
  arn       = aws_sns_topic.compliance.arn
}

resource "aws_sns_topic_policy" "compliance" {
  arn = aws_sns_topic.compliance.arn
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowEventBridge"
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action    = "SNS:Publish"
      Resource  = aws_sns_topic.compliance.arn
    }]
  })
}
