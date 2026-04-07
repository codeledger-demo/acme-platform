terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "acme-terraform-state"
    key    = "platform/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "acme-platform"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "vpc" {
  source      = "./modules/vpc"
  environment = var.environment
  cidr_block  = var.vpc_cidr
}

module "rds" {
  source            = "./modules/rds"
  environment       = var.environment
  instance_class    = var.db_instance_class
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_id = module.vpc.db_security_group_id
}

module "ecs" {
  source            = "./modules/ecs"
  environment       = var.environment
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_id = module.vpc.app_security_group_id
  db_endpoint       = module.rds.endpoint
}
