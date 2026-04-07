variable "environment" {
  type = string
}

variable "instance_class" {
  type    = string
  default = "db.t3.medium"
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

resource "aws_db_subnet_group" "main" {
  name       = "acme-${var.environment}-db-subnet"
  subnet_ids = var.subnet_ids

  tags = { Name = "acme-${var.environment}-db-subnet" }
}

resource "aws_db_instance" "postgres" {
  identifier     = "acme-${var.environment}-db"
  engine         = "postgres"
  engine_version = "16.2"
  instance_class = var.instance_class

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true

  db_name  = "acme"
  username = "acme_admin"
  password = "CHANGE_ME_USE_SECRETS_MANAGER"

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]

  backup_retention_period = 7
  multi_az                = var.environment == "production"
  skip_final_snapshot     = var.environment != "production"

  tags = { Name = "acme-${var.environment}-db" }
}

output "endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "db_name" {
  value = aws_db_instance.postgres.db_name
}
