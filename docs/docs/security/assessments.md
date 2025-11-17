# Security Assessment Checklist

## Purpose
Provide a recurring self‑assessment procedure for verifying security posture of all Lyra Echo nodes.

---

## Frequency
- **Monthly:** review configuration baselines and logs.  
- **Quarterly:** full audit with physical inspection.  
- **After change:** reassess affected systems immediately.

---

## Administrative Controls

| Check | Status | Notes |
|:--|:--|:--|
| Access Control Policy reviewed and signed | ☐ |  |
| Incident Response procedure tested | ☐ |  |
| Change Management documented | ☐ |  |
| Backup and recovery test completed | ☐ |  |

---

## System Configuration

| Check | Status | Notes |
|:--|:--|:--|
| OS and package updates current | ☐ |  |
| Unused services disabled | ☐ |  |
| `.env` secrets not committed | ☐ |  |
| SSH password login disabled | ☐ |  |
| VLAN and firewall rules validated | ☐ |  |
| Docker Content Trust enabled | ☐ |  |
| Container resource limits configured | ☐ |  |
| Log rotation functioning | ☐ |  |

---

## Application / Service Layer

| Check | Status | Notes |
|:--|:--|:--|
| MQTT broker requires authentication | ☐ |  |
| Node‑RED editor access restricted | ☐ |  |
| Home Assistant tokens reviewed | ☐ |  |
| Prometheus and Grafana bound to localhost | ☐ |  |
| MkDocs site access internal only | ☐ |  |

---

## Network and Physical

| Check | Status | Notes |
|:--|:--|:--|
| UPS signaling operational | ☐ |  |
| Ethernet and power cabling inspected | ☐ |  |
| Mirror enclosure sealed and intact | ☐ |  |
| Presence and camera sensors calibrated | ☐ |  |

---

## Risk Rating Snapshot

| Category | Status | Target |
|:--|:--|:--|
| Configuration compliance | ☐ | 100 % |
| Authentication | ☐ | 100 % |
| Network segmentation | ☐ | 100 % |
| Physical security | ☐ | 100 % |
| Backup and recovery | ☐ | 100 % |

---

## Sign‑off
Audit performed by:  _______________________  
Date:  _______________________  
Reviewer:  _______________________

_Last updated: 2025‑11‑10_
