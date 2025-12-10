# Lyra Backup Runbook 

This document describes how Lyra’s boot drive and data volumes are backed up to the NAS using BorgBackup over NFS, and how to verify that those backups are working.

It is written so that you can recreate the backup setup on new hardware, understand exactly what is and isn’t included, and confidently perform a restore with the DR runbook

---

## 1. Overview

**Goal:** Nightly, deduplicated, encrypted backups of Lyra’s:

- Root filesystem (`/`)
- Data volumes:
  - `/mnt/data1`
  - `/mnt/data2`

**Backup target:**  
NAS NFS export mounted on Lyra at:

```bash
/mnt/unas
```

Lyra’s Borg repository for system backups is:

```bash
/mnt/unas/lyra
```

**Backup tool:**  
[BorgBackup](https://www.borgbackup.org/) with:

- Encryption mode: `repokey-blake2`
- Compression: `zstd,3`
- Retention (keep):  
  - 7 daily,  
  - 4 weekly,  
  - 6 monthly

Backups are initiated by a systemd service and run once per night.

---

## 2. Prerequisites

On **Lyra**:

- OS: Ubuntu (22.04 / 24.04)
- Network access to Sulafat (`10.0.0.74`)
- NFS client packages installed:
  ```bash
  sudo apt update
  sudo apt install nfs-common
  ```
- BorgBackup installed:
  ```bash
  sudo apt install borgbackup
  ```

On **Sulafat**:

- An NFS export has been created and allows Lyra’s IP to access:
  ```text
  10.0.0.74:/volume/<uuid>/.srv/.unifi-drive/Storage/.data
  ```
- That export is where `/mnt/unas` is mounted on Lyra.

The `<uuid>` is the volume ID as given by the UNAS; it does not need to be human-friendly.

---

## 3. Permanent NFS Mount on Lyra

Create the local mountpoint:

```bash
sudo mkdir -p /mnt/unas
```

Edit `/etc/fstab` and add:

```fstab
10.0.0.74:/volume/<uuid>/.srv/.unifi-drive/Storage/.data /mnt/unas nfs defaults,_netdev,noatime 0 0
```

Reload and verify:

```bash
sudo umount /mnt/unas || true
sudo mount -a
df -hT | grep unas
```

Expected:

```text
10.0.0.74:/volume/<uuid>/.srv/.unifi-drive/Storage/.data nfs  13T  ...  /mnt/unas
```

---

## 4. Create Lyra’s Borg Repository

On Lyra:

```bash
sudo borg init --encryption=repokey-blake2 /mnt/unas/lyra
```

You will be prompted for a **passphrase**. This passphrase is required for any future access.

Verify the repository exists:

```bash
borg list /mnt/unas/lyra
# (will show nothing yet, but must not error)
```

---

## 5. Export and Protect the Borg Key

Borg stores the encryption key inside the repo, but you **must** have a separate exported key + the passphrase to recover in worst-case scenarios.

On Lyra, from your home directory:

```bash
cd ~
borg key export /mnt/unas/lyra > lyra-borg-key.txt
ls -l lyra-borg-key.txt
```

Then **copy this file off Lyra** (for example, from PowerShell on your workstation):

```powershell
scp austin@10.0.0.199:/home/austin/lyra-borg-key.txt C:\Users\<YourUser>\Documents\LyraKeys\
```

Store:

- `lyra-borg-key.txt`
- The Borg passphrase (in a password manager / safe)

Without those, recovery may not be possible even if the repo survives.

---

## 6. Backup Script: `/usr/local/sbin/backup_lyra.sh`

Create the script as root:

```bash
sudo nano /usr/local/sbin/backup_lyra.sh
```

Contents:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Borg repo
REPO="/mnt/unas/lyra"

# Hostname label for archive names
HOSTNAME="lyra"

# Paths to include
INCLUDE=(
    "/"
    "/mnt/data1"
    "/mnt/data2"
)

# Exclusions: ephemeral, caches, and noisy content
EXCLUDE=(
    "--exclude=/proc"
    "--exclude=/sys"
    "--exclude=/dev"
    "--exclude=/run"
    "--exclude=/tmp"
    "--exclude=/var/tmp"
    "--exclude=/mnt/unas"

    # Model and cache exclusions
    "--exclude=/home/austin/.cache/huggingface"
    "--exclude=/home/austin/.cache/torch"
    "--exclude=/home/austin/.cache/pip"
    "--exclude=/home/austin/.cache/ollama"
    "--exclude=/home/austin/.cache/*"

    # Container and build noise
    "--exclude=/var/lib/docker"
    "--exclude=/var/lib/containers"
    "--exclude=/var/tmp"
    "--exclude=/tmp"

    # Download / build areas (optional, adjust if needed)
    "--exclude=/home/austin/Downloads"
    "--exclude=/home/austin/builds"
)

# Timestamped archive name
TIMESTAMP="$(date +'%Y-%m-%d_%H-%M-%S')"
ARCHIVE="${HOSTNAME}-${TIMESTAMP}"

export BORG_REPO="${REPO}"
# BORG_PASSPHRASE must be provided at runtime or via keyring,
# we intentionally do NOT hardcode it here.

# Create archive
borg create \
    --verbose \
    --stats \
    --list \
    --compression zstd,3 \
    "${EXCLUDE[@]}" \
    "::${ARCHIVE}" \
    "${INCLUDE[@]}"

# Prune old archives according to retention policy
borg prune \
    --list \
    --stats \
    --keep-daily=7 \
    --keep-weekly=4 \
    --keep-monthly=6

exit 0
```

Make it executable:

```bash
sudo chmod +x /usr/local/sbin/backup_lyra.sh
```

---

## 7. First Manual Backup Run

Run the script manually:

```bash
sudo /usr/local/sbin/backup_lyra.sh
```

Borg will prompt for the passphrase once for repo access.  
On success, you will see stats similar to:

```text
Repository: /mnt/unas/lyra
Archive name: lyra-2025-12-07_13-50-40
...
This archive: 669.64 GB original, 467.77 GB compressed, 190.23 GB deduplicated
...
```

Verify archives:

```bash
borg list /mnt/unas/lyra
```

---

## 8. Verify Backup Integrity

To validate the repo:

```bash
borg check /mnt/unas/lyra
```

To test a small restore of, say, `/etc/hostname` into a temp directory:

```bash
mkdir -p /tmp/borg-test
cd /tmp/borg-test
borg extract /mnt/unas/lyra::lyra-YYYY-MM-DD_HH-MM-SS etc/hostname
cat etc/hostname
```

This should match Lyra’s hostname.

---

## 9. Schedule Nightly Backups (cron)

Edit root’s crontab:

```bash
sudo crontab -e
```

Add a line such as:

```cron
30 3 * * * BORG_REPO=/mnt/unas/lyra /usr/local/sbin/backup_lyra.sh
```

This runs the backup every night at 03:30.

Borg will still prompt for a passphrase unless you configure a non-interactive secret mechanism (e.g., environment file, keyring). For now, assume interactive passphrase entry when running manually or via tools that can securely provide it.

---

## 10. What Is and Isn’t Backed Up

**Included:**

- Full root filesystem (`/`) excluding system pseudo-filesystems
- `/mnt/data1`
- `/mnt/data2`
- System configs (`/etc`)
- Application configs and data
- Home directories (except excluded caches/downloads)
- Docker configs (but not Docker’s internal layers)

**Excluded (by design):**

- Pseudo filesystems: `/proc`, `/sys`, `/dev`, `/run`
- Transient/temporary dirs: `/tmp`, `/var/tmp`
- The backup target itself: `/mnt/unas`
- Large caches and model weights that can be recreated:
  - Hugging Face cache
  - Torch caches
  - Ollama caches
- Docker layers (`/var/lib/docker`)
- Downloads/build dirs that are not authoritative data

Model weights and containers are **reprovisioned** after a restore, not restored from backup.

---

## 11. Restore Procedure (Summary with Scenarios)

A full, detailed restore procedure is documented in  
`Operations/Runbooks/disaster-recovery.md`.

Here is the **high-level summary** using the two supported scenarios:

### 11.1 Scenario A — Disk and Partitions Intact (Preferred)

Use this when:

- Lyra’s disk and partition layout are still present (e.g., `/dev/nvme0n1p2` exists and is the root filesystem)
- The OS is corrupted, misconfigured, or compromised
- You want to fully roll back to a known-good snapshot

**Steps (high-level):**

1. Boot from a Live USB (Ubuntu live environment, “Try Ubuntu”).
2. Mount Lyra’s root partition at `/mnt/target` and EFI at `/mnt/target/boot/efi`.
3. Mount Sulafat’s NFS export at `/mnt/unas`.
4. Install Borg in the live environment.
5. Run `borg list` on `/mnt/unas/lyra` and choose the archive to restore.
6. Run `borg extract` to restore the archive into `/mnt/target`.
7. `chroot` into `/mnt/target` and reinstall GRUB (`grub-install` + `update-grub`).
8. Exit chroot, unmount, remove the USB, reboot.
9. Lyra now boots into the restored OS.

### 11.2 Scenario B — Disk New / Replaced / Empty

Use this when:

- Lyra’s disk has been replaced
- Partition table is gone
- There is no existing filesystem to restore onto

In this case, Borg cannot create partitions or bootloaders from nothing.

**Steps (high-level):**

1. Boot from the OS installer and perform a **minimal install** of Ubuntu on the new disk:
   - Create EFI + root partitions
   - Install the base system
   - Ensure it can boot at least once
2. Boot into this fresh OS.
3. Install `nfs-common` and `borgbackup`.
4. Mount Sulafat’s NFS export at `/mnt/unas`.
5. Mount the root filesystem of the **new install** at `/mnt/target` (if not already).
6. Use Borg to `extract` the chosen archive onto `/mnt/target`, overwriting the fresh OS files.
7. Reinstall GRUB from within the restored environment (similar to Scenario A).
8. Reboot; the fresh OS is now replaced by the restored OS.

For both scenarios, the **authoritative source** is the detailed DR runbook.

---

## 12. References

- BorgBackup documentation: <https://borgbackup.readthedocs.io/>
- DR Runbook: `Operations/Runbooks/disaster-recovery.md`
- Sulafat NFS configuration: documented under Infrastructure / Storage (if present)
