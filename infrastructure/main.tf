locals {
  dotenv = templatefile("${path.module}/templates/.env.tftpl", {
    config = {
      DATABASE_URL            = var.DATABASE_URL,
      POSTGRES_PASSWORD       = var.POSTGRES_PASSWORD,
      NEXTAUTH_SECRET         = var.NEXTAUTH_SECRET,
      NEXT_PUBLIC_TG_BOT_NAME = var.NEXT_PUBLIC_TG_BOT_NAME,
      TG_BOT_TOKEN            = var.TG_BOT_TOKEN,
      FORUM_ROOT_NAME         = var.FORUM_ROOT_NAME
    }
  })
  hytkybot_dotenv = templatefile("${path.module}/templates/.env.tftpl", {
    config = {
      TG_BOT_TOKEN        = var.TG_BOT_TOKEN,
      TG_ACTIVE_GROUP_IDS = var.TG_ACTIVE_GROUP_IDS
      TG_ADMIN_GROUP_IDS  = var.TG_ADMIN_GROUP_IDS
      PORT                = "3000"
    }
  })
  REPO_URL = "${var.GITHUB_SERVER_URL}/${var.GITHUB_REPOSITORY}.git"
}

data "cloudinit_config" "config" {
  gzip          = false
  base64_encode = false

  part {
    filename     = "user-data.sh"
    content_type = "text/x-shellscript"
    content = templatefile("${path.module}/templates/user-data.sh.tftpl",
      {
        REPO_URL = local.REPO_URL
    })
  }

  part {
    filename     = "cloud-config.yml"
    content_type = "text/cloud-config"
    content = templatefile("${path.module}/templates/cloud-config.yml.tftpl",
      {
        pub_key         = var.pub_key,
        dotenv          = local.dotenv,
        hytkybot_dotenv = local.hytkybot_dotenv
      }
    )
  }
}

resource "digitalocean_droplet" "webserver" {
  image     = "ubuntu-20-04-x64"
  name      = "webserver"
  region    = "fra1"
  size      = "s-1vcpu-1gb"
  user_data = data.cloudinit_config.config.rendered
}

resource "digitalocean_domain" "hytky" {
  name = "hytky.org"
}

resource "digitalocean_record" "www" {
  domain = digitalocean_domain.hytky.name
  type   = "A"
  name   = "www"
  value  = digitalocean_droplet.webserver.ipv4_address
}

resource "digitalocean_record" "mx" {
  domain   = digitalocean_domain.hytky.name
  type     = "MX"
  name     = "@"
  priority = 1
  value    = "SMTP.GOOGLE.COM."
}

resource "digitalocean_record" "googleverification" {
  domain = digitalocean_domain.hytky.name
  type   = "TXT"
  name   = "@"
  value  = var.GOOGLEVERIFICATION
}