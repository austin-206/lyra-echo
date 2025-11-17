# Architecture Annex — Network

## Purpose
Network design for Lyra Echo that cleanly segments user devices, IoT/mirror infrastructure, and management traffic. These values are examples only; replace with your real addressing during deployment.

---

## Segmentation Overview (VLANs)
| VLAN | Name | Intended Use | Example Subnet | Gateway |
|:--:|:--|:--|:--|:--|
| 10 | `LAN` | General user endpoints (PCs, phones, tablets, TVs) | 172.16.10.0/24 | 172.16.10.1 |
| 20 | `IOT` | Mirror, sensors, satellite nodes, Home Assistant and connected devices| 172.16.20.0/24 | 172.16.20.1 |
| 30 | `GUEST` | Internet‑only guest Wi‑Fi | 172.16.30.0/24 | 172.16.30.1 |
| 50 | `SECOPS` | Security Onion / monitoring backhaul | 172.16.50.0/24 | 172.16.50.1 |
| 69 | `MGMT` | Switch/AP/firewall management, Vega admin plane | 172.16.69.0/24 | 172.16.69.1 |

**Principles**
- **Default‑deny** between VLANs. Allow only explicit service flows.  
- The **management plane** (69) should not initiate outbound to user VLANs except for required monitoring/Orch.  
- IoT (20) initiates **outbound only** to Vega services and the orchestrator; no lateral IoT↔User access by default.

---

## Addressing Plan
Use RFC1918 space with deterministic allocations to simplify ACLs and monitoring.

### Static Reservations (examples)
| Role | VLAN | Address |
|:--|:--:|:--|
| Vega (automation hub) | 69 | 172.16.69.10 |
| Lyra (GPU/orchestration) | 20 or 10* | 172.16.20.10 |
| MQTT broker (on Vega) | 69 | 172.16.69.20 |
| Prometheus | 69 | 172.16.69.30 |
| Grafana | 69 | 172.16.69.31 |
| Home Assistant | 20 | 172.16.20.20 |
| Security Onion | 50 | 172.16.50.10 |
| Mirror Node (Pi 5) | 20 | 172.16.20.101 |
| Satellites (Pi Zero 2W) | 20 | 172.16.20.111‑119 |

\* **Lyra placement:** If Lyra primarily serves IoT, place it in VLAN 20 and expose only necessary APIs to other VLANs. If it also hosts user‑facing apps, dual‑home via firewall or place in LAN with strict inbound rules from IoT and Mgmt.

### DHCP Scopes (examples)
- VLAN 10: 172.16.10.100‑250, lease 12h  
- VLAN 20: 172.16.20.100‑250, lease 24h  
- VLAN 30: 172.16.30.50‑200, lease 8h  
- VLAN 69: **No DHCP** (static only)  
- VLAN 50: static or tightly scoped DHCP

---

## Service Placement
- **Vega** (Mgmt 69): Mosquitto (MQTT :1883), Node‑RED, Prometheus (9090), Grafana (3000). Bind to Mgmt interface; expose to IoT via firewall rules only.  
- **Lyra** (IoT 20 or LAN 10): Orchestration API, Qdrant (6333), LLM engines. Bind to local interface; selectively allow Mgmt scrape/auth as needed.  
- **Security Onion** (SecOps 50): inbound syslog from Vega/Lyra; no direct inbound from user VLANs.  
- **Home Assistant** (IoT 20): limited inbound from Mgmt and optionally from LAN for UI access.

---

## Inter‑VLAN Access Policy (Model ACL)
| From VLAN | To VLAN | Ports/Services | Reason | Action |
|:--:|:--:|:--|:--|:--|
| 20 (IoT) | 69 (Mgmt) | TCP 1883 (MQTT), 9090 (Prometheus push/pull if needed) | Telemetry + broker access | ALLOW (to specific hosts) |
| 69 (Mgmt) | 20 (IoT) | TCP 22, 8123, 3000, 1880 | Admin to nodes, HA UI, Grafana, Node‑RED | ALLOW (admin IPs only) |
| 10 (LAN) | 20 (IoT) | TCP 8123 | User access to Home Assistant UI | ALLOW |
| 10 (LAN) | 69 (Mgmt) | — | Prevent user access to Mgmt plane | DENY |
| 20 (IoT) | 10 (LAN) | — | Prevent IoT→LAN lateral | DENY |
| 30 (Guest) | ANY | TCP/UDP 53 (DNS), 80/443 (HTTP/S) | Internet only | ALLOW to WAN, DENY to internal |
| 50 (SecOps) | 69/20/10 | UDP 514 (syslog), beats/agents as configured | Centralized logging | ALLOW (ingress only to SecOps) |

> Start from **deny any any**; then add the smallest necessary ALLOWs to meet functionality.

---

## Wi‑Fi SSIDs → VLANs
| SSID | VLAN | Notes |
|:--|:--:|:--|
| `Home` | 10 | Standard user devices |
| `Home‑IoT` | 20 | Mirror & sensors (WPA2 or WPA3‑SAE) |
| `Home‑Guest` | 30 | Internet‑only; client isolation enabled |

- Disable intra‑BSS client communication on Guest.  
- Avoid exposing Mgmt over Wi‑Fi; keep wired when possible.

---

## DNS/DHCP
- Centralize DHCP per VLAN on the router.  
- DNS: internal zone for key hosts (`vega.local`, `lyra.local`, `so.local`).  
- mDNS: **do not** flood across VLANs; reflect only if a service needs discovery (e.g., HA discovery). Prefer static hostnames or unicast DNS instead.

---

## Example Firewall Rules (conceptual `ufw`/pf rules)
```text
# Default
deny in on any
allow out on any

# Mgmt plane (from admin workstation only)
allow in proto tcp from 172.16.10.50 to 172.16.69.10 port 3000  # Grafana
allow in proto tcp from 172.16.10.50 to 172.16.69.10 port 1880  # Node-RED

# IoT to Mgmt (MQTT only)
allow in proto tcp from 172.16.20.0/24 to 172.16.69.20 port 1883

# LAN to IoT (HA UI)
allow in proto tcp from 172.16.10.0/24 to 172.16.20.20 port 8123

# Guest to WAN only (implemented on AP/firewall)
deny in from 172.16.30.0/24 to 172.16.0.0/16
```

---

## Monitoring and Logging
- Prometheus scrapes exporters on Mgmt and selected IoT hosts; restrict scrape targets to allow‑listed IPs.  
- Security Onion ingests syslog from Vega/Lyra; keep content minimal (no PII).  
- Node‑RED emits heartbeat topics per VLAN to `lyra/health/#` for quick sanity checks.

---

## Change Control
- Document every firewall or VLAN change in `docs/release/changelog.md`.  
- Export and snapshot switch/AP/firewall configs to NAS after edits.  
- Validate with a short test plan: MQTT publish/sub across VLANs, HA UI reachability, scrape targets up.

---

_This addressing scheme	is a model. Replace subnets and host IPs with your actual values during implementation._

_Last updated: 2025‑11‑10_
