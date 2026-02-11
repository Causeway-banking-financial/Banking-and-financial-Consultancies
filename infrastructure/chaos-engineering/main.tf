terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "project" {
  type    = string
  default = "causeway-banking"
}

variable "environment" {
  description = "Environment for chaos experiments (should be nonprod)"
  type        = string
  default     = "nonprod"
}

variable "ecs_cluster_arn" {
  description = "ARN of the ECS cluster to run experiments against"
  type        = string
}

variable "aurora_cluster_arn" {
  description = "ARN of the Aurora cluster for failover experiments"
  type        = string
}

variable "alarm_arns" {
  description = "CloudWatch alarm ARNs that must stay OK during experiments (stop conditions)"
  type        = list(string)
  default     = []
}

locals {
  name_prefix = "${var.project}-${var.environment}"
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Purpose     = "chaos-engineering"
  }
}

# ==============================================================================
# FIS IAM Role
# ==============================================================================
resource "aws_iam_role" "fis" {
  name = "${local.name_prefix}-fis-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "fis.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "fis" {
  name = "${local.name_prefix}-fis-policy"
  role = aws_iam_role.fis.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:DescribeServices",
          "ecs:UpdateService",
          "ecs:ListTasks",
          "ecs:StopTask",
          "ecs:DescribeTasks"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:ResourceTag/Project" = var.project
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "rds:FailoverDBCluster",
          "rds:DescribeDBClusters"
        ]
        Resource = var.aurora_cluster_arn
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:DescribeAlarms"
        ]
        Resource = "*"
      }
    ]
  })
}

# ==============================================================================
# Experiment 1: ECS Task Termination (test service recovery)
# ==============================================================================
resource "aws_fis_experiment_template" "ecs_task_stop" {
  description = "Stop ECS tasks to test container recovery and circuit breaker"
  role_arn    = aws_iam_role.fis.arn

  action {
    name      = "stop-ecs-tasks"
    action_id = "aws:ecs:stop-task"

    target {
      key   = "Tasks"
      value = "ecs-tasks"
    }
  }

  target {
    name           = "ecs-tasks"
    resource_type  = "aws:ecs:task"
    selection_mode = "COUNT(1)"

    resource_tag {
      key   = "Project"
      value = var.project
    }
  }

  dynamic "stop_condition" {
    for_each = var.alarm_arns
    content {
      source = "aws:cloudwatch:alarm"
      value  = stop_condition.value
    }
  }

  log_configuration {
    cloud_watch_logs_configuration {
      log_group_arn = "${aws_cloudwatch_log_group.fis.arn}:*"
    }
    log_schema_version = 2
  }

  tags = merge(local.common_tags, {
    Name       = "${local.name_prefix}-ecs-task-stop"
    Experiment = "ecs-recovery"
  })
}

# ==============================================================================
# Experiment 2: Aurora Failover (test database HA)
# ==============================================================================
resource "aws_fis_experiment_template" "aurora_failover" {
  description = "Force Aurora failover to test database HA and application recovery"
  role_arn    = aws_iam_role.fis.arn

  action {
    name      = "failover-aurora"
    action_id = "aws:rds:failover-db-cluster"

    target {
      key   = "Clusters"
      value = "aurora-cluster"
    }
  }

  target {
    name           = "aurora-cluster"
    resource_type  = "aws:rds:cluster"
    selection_mode = "ALL"

    resource_arns = [var.aurora_cluster_arn]
  }

  dynamic "stop_condition" {
    for_each = var.alarm_arns
    content {
      source = "aws:cloudwatch:alarm"
      value  = stop_condition.value
    }
  }

  log_configuration {
    cloud_watch_logs_configuration {
      log_group_arn = "${aws_cloudwatch_log_group.fis.arn}:*"
    }
    log_schema_version = 2
  }

  tags = merge(local.common_tags, {
    Name       = "${local.name_prefix}-aurora-failover"
    Experiment = "database-ha"
  })
}

# ==============================================================================
# Experiment 3: ECS CPU Stress (test autoscaling)
# ==============================================================================
resource "aws_fis_experiment_template" "ecs_cpu_stress" {
  description = "Inject CPU stress into ECS tasks to test autoscaling response"
  role_arn    = aws_iam_role.fis.arn

  action {
    name      = "cpu-stress"
    action_id = "aws:ecs:task-cpu-stress"

    parameter {
      key   = "duration"
      value = "PT5M"
    }

    parameter {
      key   = "percent"
      value = "90"
    }

    target {
      key   = "Tasks"
      value = "ecs-tasks-stress"
    }
  }

  target {
    name           = "ecs-tasks-stress"
    resource_type  = "aws:ecs:task"
    selection_mode = "PERCENT(50)"

    resource_tag {
      key   = "Project"
      value = var.project
    }
  }

  dynamic "stop_condition" {
    for_each = var.alarm_arns
    content {
      source = "aws:cloudwatch:alarm"
      value  = stop_condition.value
    }
  }

  log_configuration {
    cloud_watch_logs_configuration {
      log_group_arn = "${aws_cloudwatch_log_group.fis.arn}:*"
    }
    log_schema_version = 2
  }

  tags = merge(local.common_tags, {
    Name       = "${local.name_prefix}-ecs-cpu-stress"
    Experiment = "autoscaling"
  })
}

# FIS Logging
resource "aws_cloudwatch_log_group" "fis" {
  name              = "/aws/fis/${local.name_prefix}"
  retention_in_days = 90
  tags              = local.common_tags
}
