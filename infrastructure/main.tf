locals {
  dotenv = templatefile("${path.module}/templates/.env.tftpl", {
    config = {
      DATABASE_URL                = var.DATABASE_URL,
      POSTGRES_PASSWORD           = var.POSTGRES_PASSWORD,
      NEXTAUTH_SECRET             = var.NEXTAUTH_SECRET,
      NEXT_PUBLIC_TG_BOT_NAME     = var.NEXT_PUBLIC_TG_BOT_NAME,
      NEXT_PUBLIC_TG_INFO_CHANNEL = var.NEXT_PUBLIC_TG_INFO_CHANNEL,
      TG_BOT_TOKEN                = var.TG_BOT_TOKEN,
      FORUM_ROOT_NAME             = var.FORUM_ROOT_NAME
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
        REPO_URL      = local.REPO_URL
        DOMAIN        = var.DOMAIN
        CERTBOT_EMAIL = var.CERTBOT_EMAIL
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
        ROOT_PASSWORD   = var.ROOT_PASSWORD
      }
    )
  }
}

resource "digitalocean_droplet" "webserver" {
  image     = "ubuntu-22-04-x64"
  name      = "webserver"
  region    = "fra1"
  size      = "s-1vcpu-1gb"
  user_data = data.cloudinit_config.config.rendered
}

resource "digitalocean_domain" "hytky" {
  name = "hytky.org"
}

resource "digitalocean_record" "root" {
  domain = digitalocean_domain.hytky.name
  type   = "A"
  name   = "@"
  value  = digitalocean_droplet.webserver.ipv4_address
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
  value    = "smtp.google.com."
}

resource "digitalocean_record" "googleverification" {
  domain = digitalocean_domain.hytky.name
  type   = "TXT"
  name   = "@"
  value  = var.GOOGLEVERIFICATION
}

resource "digitalocean_record" "spf" {
  domain = digitalocean_domain.hytky.name
  type   = "TXT"
  name   = "@"
  value  = "v=spf1 include:_spf.google.com ~all"
}

resource "digitalocean_record" "dkim" {
  domain = digitalocean_domain.hytky.name
  type   = "TXT"
  name   = "google._domainkey"
  value  = "v=DKIM1; k=rsa; p=${var.DKIM}"
}

resource "digitalocean_record" "dmarc" {
  domain = digitalocean_domain.hytky.name
  type   = "TXT"
  name   = "_dmarc"
  value  = "v=DMARC1; p=quarantine; rua=mailto:postmaster@hytky.org; pct=100; adkim=s; aspf=s"
}
