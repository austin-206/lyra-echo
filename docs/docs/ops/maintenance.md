# Maintenance Procedures

## Purpose
Structured, repeatable maintenance steps for hardware, software, and network components within the Lyra/Echo system.

---

## Routine Tasks

| Task | Frequency | Responsible Node | Description |
|:--|:--|:--|:--|
| System updates | Monthly | Lyra, Vega, Mirror Nodes | Apply security updates and package upgrades |
| Log rotation | Weekly | All nodes | Ensure logs do not exceed 1 GB total |
| Docker image pruning | Monthly | Lyra, Vega | Remove unused images and stopped containers |
| NAS snapshot verification | Monthly | NAS | Verify last backup integrity |
| Reboot test | Quarterly | All nodes | Confirm systems boot cleanly and services auto-start |

---

## Hardware Checks
- Inspect UPS battery and runtime.
- Check fan and temperature sensors in Lyra and mirror units.
- Verify cable and PoE connections are secure.
- Confirm NAS reports healthy SMART status.

---

## Software Maintenance
```bash
sudo apt update && sudo apt upgrade -y
sudo docker system prune -f
```
Verify key services post-upgrade:
```bash
sudo systemctl status mkdocs nodered lyra-orchestrator
```

---

## Documentation Hygiene
- Update MkDocs entries after configuration changes.
- Append change logs under `docs/release/changelog.md`.

_Last updated: 2025-11-10_
