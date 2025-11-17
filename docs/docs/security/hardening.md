# System Hardening Guide

## Purpose
Establish mandatory baseline configurations to minimize the attack surface of the Lyra Echo ecosystem. Applies to Lyra, Vega, mirror, and satellite nodes.

---

## General Principles
1. **Local‑first:** No external API or cloud dependencies.  
2. **Least privilege:** Each service runs as a non‑root account where possible.  
3. **Explicit trust:** All inter‑node communication authenticated via shared secrets or mTLS (planned).  
4. **Immutable services:** Use containerized deployments and read‑only configs for critical components.

---

## Operating System Controls

| Control | Command / Reference | Verification |
|:--|:--|:--|
| Apply security patches | `sudo apt update && sudo apt upgrade -y` | Currently a manual review |
| Disable unused services | `systemctl disable avahi-daemon` | `systemctl list-unit-files` |
| Configure automatic updates | `unattended-upgrades` | `/etc/apt/apt.conf.d/50unattended-upgrades` |
| Enforce sudo logging | `/etc/sudoers` → `Defaults logfile="/var/log/sudo.log"` | `cat /var/log/sudo.log` |

---

## Network and Firewall

| Control | Command / Config | Verification |
|:--|:--|:--|
| Enforce VLAN segmentation | Managed switch / pfSense | Unidirectional routes only |
| Restrict inbound ports | `ufw allow 22,80,1883,8123,3000/tcp` | `sudo ufw status` |
| Default deny all else | `ufw default deny incoming` | Firewall active and persistent |
| Disable SSH password auth | `PasswordAuthentication no` in `/etc/ssh/sshd_config` | `sudo systemctl restart sshd` |

---

## Container Hardening

| Control | Implementation | Verification |
|:--|:--|:--|
| Pull signed images only | Docker Content Trust (DCT) | `DOCKER_CONTENT_TRUST=1` |
| Limit privileges | `--user` or non‑root Dockerfile | `docker inspect` user field |
| Resource limits | Compose `deploy.resources.limits` | Containers respect memory/cpu limits |
| Secrets isolation | `.env` not baked into images | Review `docker history` |

---

## Service‑Specific

| Service | Control | Verification |
|:--|:--|:--|
| MQTT (Mosquitto) | Enable auth plugin, TLS | `mosquitto_sub` test with creds |
| Node‑RED | Password‑protect editor UI | `settings.js` credentialSecret |
| Prometheus | Bind to localhost only | `netstat -tuln` |
| Grafana | Enable login + local admin only | Web UI / config file |
| Home Assistant | Use long‑lived access tokens | User profile → security |
| MkDocs | Development server LAN‑only | `mkdocs serve -a 0.0.0.0` (firewall restricted) |

---

## Physical Security
- Security staff on site 24/7.
- Extremely Heavy Stuff.  
- UPS signaling cable protected inside conduit.  

---

## Monitoring and Logging
- Node‑RED forward system alerts via MQTT to `lyra/alerts/security`.  
- Prometheus tracks failed logins and service uptime.  
- Logs rotated weekly (`logrotate.d` entries).

_Last updated: 2025‑11‑10_
