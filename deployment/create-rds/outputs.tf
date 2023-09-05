output "RDS_HOSTNAME" {
  description = "RDS instance hostname"
  value       = aws_db_instance.ch-test.address
}

output "RDS_PORT" {
  description = "RDS instance port"
  value       = aws_db_instance.ch-test.port
}

output "RDS_USERNAME" {
  description = "RDS instance root username"
  value       = aws_db_instance.ch-test.username
}