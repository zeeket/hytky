output "webserver_ipv4_address" {
  value       = digitalocean_droplet.webserver.ipv4_address
  description = "The public IPv4 address of the webserver droplet."
}

output "webserver_monthly_cost" {
  value       = digitalocean_droplet.webserver.price_monthly
  description = "The monthly cost of the webserver droplet."
}