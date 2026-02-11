terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "monthly_budget_limit" {
  description = "Monthly budget limit in USD"
  type        = number
  default     = 10000
}

variable "alert_email" {
  description = "Email for budget and anomaly alerts"
  type        = string
}

variable "cost_centre" {
  description = "Cost centre for tag-based allocation"
  type        = string
  default     = "banking-financial"
}

locals {
  project = "causeway-banking"
  common_tags = {
    Project   = local.project
    ManagedBy = "terraform"
    Purpose   = "cost-guardrails"
  }
}

# ==============================================================================
# AWS Budget — Monthly spend alert
# ==============================================================================
resource "aws_budgets_budget" "monthly" {
  name         = "${local.project}-monthly-budget"
  budget_type  = "COST"
  limit_amount = var.monthly_budget_limit
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = ["user:Project$${local.project}"]
  }

  # Alert at 50% of budget
  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 50
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  # Alert at 80% of budget
  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  # Alert at 100% of budget
  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  # Forecasted to exceed budget
  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }

  tags = local.common_tags
}

# ==============================================================================
# AWS Cost Anomaly Detection
# ==============================================================================
resource "aws_ce_anomaly_monitor" "main" {
  name              = "${local.project}-anomaly-monitor"
  monitor_type      = "DIMENSIONAL"
  monitor_dimension = "SERVICE"

  tags = local.common_tags
}

resource "aws_sns_topic" "cost_anomaly" {
  name = "${local.project}-cost-anomaly-alerts"
  tags = local.common_tags
}

resource "aws_sns_topic_subscription" "cost_anomaly_email" {
  topic_arn = aws_sns_topic.cost_anomaly.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_ce_anomaly_subscription" "main" {
  name = "${local.project}-anomaly-subscription"

  monitor_arn_list = [aws_ce_anomaly_monitor.main.arn]

  subscriber {
    type    = "SNS"
    address = aws_sns_topic.cost_anomaly.arn
  }

  threshold_expression {
    dimension {
      key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
      values        = ["100"]
      match_options = ["GREATER_THAN_OR_EQUAL"]
    }
  }

  frequency = "DAILY"

  tags = local.common_tags
}

# ==============================================================================
# Tag enforcement via AWS Config (cross-reference to policy module)
# ==============================================================================

# The policy module (infrastructure/policy/main.tf) already enforces required
# tags via the REQUIRED_TAGS Config Rule. This module provides cost-specific
# tag validation for billing allocation.

resource "aws_config_config_rule" "cost_allocation_tags" {
  name = "${local.project}-cost-allocation-tags"
  source {
    owner             = "AWS"
    source_identifier = "REQUIRED_TAGS"
  }
  input_parameters = jsonencode({
    tag1Key = "Project"
    tag2Key = "Environment"
    tag3Key = "CostCentre"
  })
  tags = local.common_tags
}

# ==============================================================================
# Per-service budget breakdown (by tag)
# ==============================================================================
resource "aws_budgets_budget" "per_environment" {
  for_each = tomap({
    prod    = var.monthly_budget_limit * 0.7  # 70% allocation for prod
    nonprod = var.monthly_budget_limit * 0.3  # 30% allocation for nonprod
  })

  name         = "${local.project}-${each.key}-budget"
  budget_type  = "COST"
  limit_amount = each.value
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = ["user:Environment$${each.key}"]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  tags = local.common_tags
}
