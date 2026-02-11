output "service_url" {
  description = "URL path for the service via the shared ALB"
  value       = join("", var.path_patterns)
}

output "ecr_repository_url" {
  description = "URL of the ECR repository for this service"
  value       = aws_ecr_repository.service.repository_url
}

output "log_group_name" {
  description = "CloudWatch log group name for this service"
  value       = aws_cloudwatch_log_group.service.name
}

output "task_role_arn" {
  description = "ARN of the ECS task IAM role (attach service-specific policies here)"
  value       = aws_iam_role.task.arn
}

output "task_role_name" {
  description = "Name of the ECS task IAM role"
  value       = aws_iam_role.task.name
}

output "target_group_arn" {
  description = "ARN of the ALB target group"
  value       = aws_lb_target_group.service.arn
}
