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
  project     = "causeway-banking"
  github_org  = "Causeway-banking-financial"
  github_repo = "Banking-and-financial-Consultancies"
}

# ------------------------------------------------------------------------------
# GitHub OIDC Provider — allows GitHub Actions to assume IAM roles
# ------------------------------------------------------------------------------
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  tags = {
    Project   = local.project
    ManagedBy = "terraform"
  }
}

# ------------------------------------------------------------------------------
# IAM Role for Terraform Plan (read-only, used on PRs)
# ------------------------------------------------------------------------------
resource "aws_iam_role" "terraform_plan" {
  name = "${local.project}-github-terraform-plan"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${local.github_org}/${local.github_repo}:pull_request"
        }
      }
    }]
  })

  tags = {
    Project   = local.project
    ManagedBy = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "terraform_plan" {
  role       = aws_iam_role.terraform_plan.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

# ------------------------------------------------------------------------------
# IAM Role for Terraform Apply (write access, used on main branch merges)
# ------------------------------------------------------------------------------
resource "aws_iam_role" "terraform_apply" {
  name = "${local.project}-github-terraform-apply"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          "token.actions.githubusercontent.com:sub" = "repo:${local.github_org}/${local.github_repo}:ref:refs/heads/main"
        }
      }
    }]
  })

  tags = {
    Project   = local.project
    ManagedBy = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "terraform_apply" {
  role       = aws_iam_role.terraform_apply.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
  # NOTE: Scope down to specific services in production. AdministratorAccess
  # is used here as a starting point; replace with a custom policy that
  # grants only the permissions Terraform needs.
}

# ------------------------------------------------------------------------------
# Terraform State Buckets and Lock Tables
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "tfstate" {
  for_each = toset(["nonprod", "prod"])

  bucket = "${local.project}-terraform-state-${each.key}"

  tags = {
    Project     = local.project
    Environment = each.key
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "tfstate" {
  for_each = aws_s3_bucket.tfstate

  bucket = each.value.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  for_each = aws_s3_bucket.tfstate

  bucket = each.value.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  for_each = aws_s3_bucket.tfstate

  bucket                  = each.value.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "tflock" {
  for_each = toset(["nonprod", "prod"])

  name         = "${local.project}-terraform-locks-${each.key}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Project     = local.project
    Environment = each.key
    ManagedBy   = "terraform"
  }
}
