terraform {
  cloud {
    hostname     = "app.terraform.io"
    organization = "HYTKY"

    workspaces {
      name = "HYTKY"
    }
  }
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    cloudinit = {
      source  = "hashicorp/cloudinit"
      version = "2.3.4"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}