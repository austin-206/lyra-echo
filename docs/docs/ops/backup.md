---
title: Backup & Recovery Architecture
summary: "Automated BorgBackup system for Lyra/Echo nodes with systemd, NFS, and monitoring integration."
status: published
date: 2025-12-09
---


# Lyra Backup Runbook 

This document describes how Lyra’s boot drive and data volumes are backed up to the NAS using BorgBackup over NFS, and how to verify that those backups are working.

It is written so that you can recreate the backup setup on new hardware, understand exactly what is and isn’t included, and perform a restore with the DR runbook.

---

## Overview

The Lyra/Echo system uses BorgBackup, systemd timers, and an NFS backed NAS target to create automated scheduled backups with incremental snapshotting.

---

## Backup Flow

### 1. Preparing the NFS Backup Target

Enable NFS on the NAS and add each node's IP with the appropriate permissions.
Mount directory on each node:

```bash
sudo mkdir -p /mnt/backup
```

Add `/etc/fstab` entry:

```fstab
IP.ADDRESS:/path/to/nfs/export   /mnt/backup   nfs   defaults,_netdev,noatime  0 0
```

Reload and verify:

```bash
sudo mount -a
df -hT | grep backup
```

---

### 2. Initialize Borg Repository for Each Node

Create a unique repository directory on the NAS for each node being backed up.

```bash
sudo borg init --encryption=repokey-blake2 /mnt/backup/lyra
```

Verification:

```bash
sudo borg list /mnt/backup/lyra
```

---

### 3. Backup Script (Standardized Across All Nodes)

Place in:

```
/usr/local/sbin/backup_<node>.sh
```

Template:

```bash
#!/bin/bash
NODE="<node_name>"
REPO="/mnt/backup/$NODE"
export BORG_REPO="$REPO"

# Load passphrase
export BORG_PASSPHRASE="$(cat /root/.borg_passphrase)"

# Run backup
borg create --verbose --stats   --filter AME   --compression zstd,3   --exclude /mnt/backup   --exclude /proc --exclude /sys --exclude /dev   --exclude /run --exclude /tmp --exclude /var/tmp   --exclude /lost+found --exclude /var/lib/docker   $REPO::"$NODE-{now:%Y-%m-%d_%H-%M-%S}"   /

# Prune old snapshots
borg prune --list --keep-daily=7 --keep-weekly=4 --keep-monthly=6 "$REPO"
```

Make executable:

```bash
sudo chmod +x /usr/local/sbin/backup_<node>.sh
```


What Is and Isn’t Backed Up

Included:

- Full root filesystem (`/`) excluding system pseudo-filesystems
- `/mnt/data1`
- `/mnt/data2`
- System configs (`/etc`)
- Application configs and data
- Home directories (except excluded caches/downloads)
- Docker configs (but not Docker’s internal layers)

Excluded (by design):

- Pseudo filesystems: `/proc`, `/sys`, `/dev`, `/run`
- Transient/temporary dirs: `/tmp`, `/var/tmp`
- The backup target itself: `/mnt/unas`
- Large caches and model weights that can be recreated:
  - Hugging Face cache
  - Torch caches
  - Ollama caches
- Docker layers (`/var/lib/docker`)
- Downloads/build dirs that are not authoritative data

Model weights and containers are reprovisioned after a restore, not restored from backup.

---

### 4. systemd Automation

#### Service Unit

Create:

```
/etc/systemd/system/borg-backup@.service
```

```ini
[Unit]
Description=Borg Backup for %i
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
Environment="BORG_PASSPHRASE_FILE=/root/.borg_passphrase"
ExecStart=/bin/bash -c "export BORG_PASSPHRASE=$(cat $BORG_PASSPHRASE_FILE); /usr/local/sbin/backup_%i.sh"
```

#### Timer Unit

```
/etc/systemd/system/borg-backup@.timer
```

```ini
[Unit]
Description=Daily Borg Backup Timer for %i

[Timer]
OnCalendar=*-*-* 03:30
Persistent=true

[Install]
WantedBy=timers.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now borg-backup@<node>.timer
```

---

### 5. Monitoring Integration 

#### Create Borg Metrics File

Each backup script writes summary data to:

```
/var/lib/node_exporter/textfile_collector/borg_<node>.prom
```

Example output:

```text
borg_last_backup_timestamp{host="lyra"} 1765243970
borg_last_backup_duration_seconds{host="lyra"} 50.877832
borg_last_backup_dedup_mb{host="lyra"} 60.27
borg_last_backup_exit_code{host="lyra"} 0
```

Prometheus scrapes via Node Exporter and Grafana displays backup dashboards.

---

### 6. Maintenance Expectations

#### Weekly
- Verify dashboard shows healthy backups  
- Confirm all systemd timers are activated  

#### Monthly
- Inspect NFS space usage  
- Perform a file-level restore test  

#### Quarterly
- Perform a full-system restore simulation  
- Review exclusion lists  

---

### 8. Summary

This system provides Automated nightly backups with consistent architecture across heterogeneous nodes with documented, testable recovery paths and observability through Prometheus/Grafana. 
