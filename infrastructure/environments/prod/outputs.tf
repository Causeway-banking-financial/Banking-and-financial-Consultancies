output "vpc_id" {
  value = module.networking.vpc_id
}

output "ecs_cluster_name" {
  value = module.compute.ecs_cluster_name
}

output "alb_dns_name" {
  value = module.compute.alb_dns_name
}

output "aurora_writer_endpoint" {
  value     = module.data.aurora_cluster_endpoint
  sensitive = true
}

output "aurora_reader_endpoint" {
  value     = module.data.aurora_reader_endpoint
  sensitive = true
}

output "dashboard_url" {
  value = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${module.observability.dashboard_name}"
}
