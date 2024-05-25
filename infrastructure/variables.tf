variable "do_token" {
  description = "Digital Ocean Token"
  type        = string
  sensitive   = true
}

variable "pub_key" {
  description = "Public Key"
  type        = string
}

variable "GITHUB_SERVER_URL" {
  description = "Github Server URL"
  type        = string
}

variable "GITHUB_REPOSITORY" {
  description = "Github Repository"
  type        = string
}

variable "DATABASE_URL" {
  description = "Database URL"
  type        = string
  sensitive   = true
}

variable "POSTGRES_PASSWORD" {
  description = "Database Password"
  type        = string
  sensitive   = true
}

variable "NEXTAUTH_SECRET" {
  description = "NextAuth Secret"
  type        = string
  sensitive   = true
}

variable "NEXT_PUBLIC_TG_BOT_NAME" {
  description = "Telegram Bot Name"
  type        = string
}

variable "TG_BOT_TOKEN" {
  description = "Telegram Bot Token"
  type        = string
  sensitive   = true
}

variable "FORUM_ROOT_NAME" {
  description = "Forum Root Name used in seeding"
  type        = string
}

variable "TG_ACTIVE_GROUP_IDS" {
  description = "Comma separated Telegram Active Group IDs"
  type        = string
  sensitive   = true
}

variable "TG_ADMIN_GROUP_IDS" {
  description = "Comma separated Telegram Admin Group IDs"
  type        = string
  sensitive   = true
}