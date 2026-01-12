variable "DOMAIN" {
  description = "Domain Name"
  type        = string
  default     = ""
}

variable "CERTBOT_EMAIL" {
  description = "The email address to use for Let's Encrypt"
  type        = string
  default     = ""
  sensitive   = true
}

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

variable "ROOT_PASSWORD" {
  description = "Server root user's Password"
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

variable "NEXT_PUBLIC_TG_INFO_CHANNEL" {
  description = "Telegram Info Channel link"
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

variable "GOOGLEVERIFICATION" {
  description = "TXT record for Google Workspace verification"
  type        = string
  sensitive   = true
}

variable "DKIM" {
  description = "TXT record for the DKIM p= part"
  type        = string
  sensitive   = true
}

variable "CALENDAR_GOOGLE_CLIENT_ID" {
  description = "Google Calendar API Client ID"
  type        = string
  sensitive   = true
}

variable "CALENDAR_GOOGLE_CLIENT_SECRET" {
  description = "Google Calendar API Client Secret"
  type        = string
  sensitive   = true
}

variable "CALENDAR_GOOGLE_REFRESH_TOKEN" {
  description = "Google Calendar API Refresh Token"
  type        = string
  sensitive   = true
}

variable "CALENDAR_GOOGLE_CALENDAR_ID" {
  description = "Google Calendar ID"
  type        = string
  sensitive   = true
}