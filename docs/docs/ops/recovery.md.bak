---
title: Disaster Recovery & Restore Runbook
nav: Disaster Recovery
summary: End-to-end procedure for restoring Lyra/Echo system components from BorgBackup archives using the Sulafat NFS repository.
description: A complete restore runbook covering environment preparation, data recovery, validation, and post-restore procedures for all Lyra/Echo hosts.
tags:
  - disaster recovery
  - restore
  - borgbackup
  - automation
  - operations
---

# Disaster Recovery Runbook 

This runbook documents the restoration procedure for any host in the the Lyra/Echo system using BorgBackup.

It is designed for restoration from disk failure, OS corruption, misconfiguration, accidental deletion, or compromise requiring full rollback.

Borg repositories are stored in NFS export directories mounted at

```bash
/mnt/unas/<hostname>
```

You must have the encrypted Borg repository, the exported Borg key for the affected host, and the Borg passphrase

---

## 1. Restore Scenarios

There are two main restore scenarios. The steps differ depending on the state of the target disk.

### 2.1 Scenario A — Disk and Partitions Intact

Use this when the host’s disk and partition layout still exist, the root filesystem is present but the OS is broken, corrupted, or compromised, or you want to fully roll back to a previous state

In this case, you do not reinstall the OS.  
You boot from external media, mount the existing partitions, and restore onto them.

### 2.2 Scenario B — Disk New / Replaced / Empty

Use this when the host’s disk has been replaced, the partition table is gone, or there is no filesystem for Borg to restore into

In this case, you perform a minimal OS install first to recreate the partition table, the EFI/boot partition (if applicable), and the root filesystem

Then, you overwrite that fresh install with the Borg restore.

---

## 3. Scenario A — Restore with Existing Disk (Lyra Example)

This is the preferred method when the disk is intact.

We’ll use Lyra as the example. Others are analogous with different device names.

### 3.1 Boot from Live USB

1. Insert an Ubuntu Live USB.
2. Boot Lyra and choose “Try Ubuntu” (do not install).

You are now in a temporary OS running from USB/RAM.

---

### 4.2 Identify Partitions

Open a terminal and run:

```bash
lsblk -f
```

Find the root partition (something like `/dev/nvme0n1p2`, type `ext4`) and the EFI partition (~ `/dev/nvme0n1p1`, type `vfat`)

---

### 4.3 Mount the Root and EFI

```bash
sudo mkdir -p /mnt/target
sudo mount /dev/nvme0n1p2 /mnt/target

sudo mkdir -p /mnt/target/boot/efi
sudo mount /dev/nvme0n1p1 /mnt/target/boot/efi
```

Now `/mnt/target` is Lyra’s future `/`.

---

### 4.4 Mount NFS Export

```bash
sudo mkdir -p /mnt/unas
sudo mount -t nfs nas.ip.add.ress:/volume/<uuid>/.srv/.unifi-drive/Storage/.data /mnt/unas
```

Verify:

```bash
df -hT | grep unas
ls /mnt/unas
```

You should see the avilable directories.

---

### 4.5 Install Borg in the Live Environment

```bash
sudo apt update
sudo apt install borgbackup
borg --version
```

---

### 4.6 Select an Archive to Restore

List Lyra’s archives:

```bash
borg list /mnt/unas/lyra
```

Example output:

```text
lyra-2025-12-07_13-50-40   Sun, 2025-12-07 13:50:43
lyra-2025-12-08_03-30-00   Mon, 2025-12-08 03:30:00
...
```

Choose an appropriate snapshot (usually the most recent known-good).

---

### 4.7 Restore the Filesystem into `/mnt/target`

From the live environment:

```bash
sudo borg extract /mnt/unas/lyra::lyra-2025-12-07_13-50-40 --target /mnt/target
```

Or, if using older Borg syntax:

```bash
cd /mnt/target
sudo borg extract /mnt/unas/lyra::lyra-2025-12-07_13-50-40
```

This reconstructs Lyra's entire OS onto the root partition.

---

### 4.8 Prepare for chroot and Reinstall GRUB

Bind-mount essential system directories:

```bash
sudo mount --bind /dev /mnt/target/dev
sudo mount --bind /proc /mnt/target/proc
sudo mount --bind /sys /mnt/target/sys
```

Chroot into the restored system:

```bash
sudo chroot /mnt/target
```

Install GRUB to the disk:

```bash
grub-install /dev/nvme0n1
update-grub
```

Exit chroot:

```bash
exit
```

---

### 4.9 Clean Up and Reboot

```bash
sudo umount -R /mnt/target
sudo umount /mnt/unas
sudo reboot
```

Remove the USB when prompted or after shutdown.

Lyra should now boot into the restored OS corresponding to the chosen archive.

---

## 5. Scenario B — Restore to a New / Blank Disk (Lyra Example)

Use this when Lyra’s disk has been replaced or there are no partitions or filesystems.

This scenario uses the OS installer only to create partitions and a minimal system, which is then overwritten by Borg.

### 5.1 Minimal OS Install

1. Boot from the Ubuntu installer.
2. Install Ubuntu to the new disk using a simple layout:
   - EFI partition (`/dev/nvme0n1p1`)
   - Root partition (`/dev/nvme0n1p2`)
3. Create one admin user.
4. Boot into this fresh system once to confirm it works.

You now have:

- A valid GPT + EFI setup
- A bootable, minimal Ubuntu install
- A root filesystem to restore onto

---

### 5.2 Install NFS and Borg on the Fresh OS

```bash
sudo apt update
sudo apt install nfs-common borgbackup
```

Create mountpoint:

```bash
sudo mkdir -p /mnt/unas
```

Mount NAS:

```bash
sudo mount -t nfs nas.ip.add.ress:/volume/<uuid>/.srv/.unifi-drive/Storage/.data /mnt/unas
```

Verify:

```bash
ls /mnt/unas/lyra
```

---

### 5.3 Mount the Root Filesystem at `/mnt/target` (If Needed)

If you are already running from the installed OS, the root filesystem is `/`.  
For safety and clarity, you can still mount it via another live session, or simply use `/` as the restore target after booting from a Live USB as in Scenario A.

Reboot into a Live USB and follow Scenario A, since the partitions now exist.

The key difference for Scenario B is just how the disk and partitions were created (via installer), not how Borg is used.

---

## 6. Post-Restore Tasks (Per Host)

After any full restore, perform host-specific checks.

### 6.1 Lyra

- Verify `/mnt/data1` and `/mnt/data2` mount correctly.
- Reinstall or resync:
  - Model weights (Ollama, vLLM, Parler-TTS, etc.)
  - Containers that were intentionally excluded from backups.
- Confirm gateway, Qdrant, and any orchestration services start.
- Verify hostname and network configuration.

### 7.2 Deb

- Confirm `/mnt/sec-onion` mounts.
- Verify Docker / Podman stacks:
  - Nextcloud
  - Postgres
  - MQTT
  - Node-RED
  - Security Onion / other services
- Rebuild large images that were excluded.

### 7.3 Mirror Pi

- Verify MagicMirror starts.
- Confirm Lyra/Echo chat interface is reachable.
- Check presence sensor integrations and any local services.

### 7.4 DNS Pi

- Confirm Pi-hole / DNS / DHCP are functioning.
- Verify network services (static leases, upstream DNS).
- Validate that other hosts can resolve names and reach the internet as expected.

---

## 8. Verification Checklist (All Hosts)

After a restore:

### System-Level

- [ ] Host boots successfully from internal storage
- [ ] Hostname is correct
- [ ] Network connectivity to LAN and Sulafat

### Data-Level

- [ ] All expected mountpoints present (`/mnt/data1`, `/mnt/data2`, `/mnt/sec-onion`, etc.)
- [ ] Filesystems have expected size and usage

### Application-Level

- [ ] Core services started (per host)
- [ ] Lyra gateway responds and can answer queries
- [ ] Mirror UI loads and reacts to presence
- [ ] Raspi resolves DNS correctly for other devices

### Backup-Level

- [ ] NFS mount to `/mnt/unas` restored in `/etc/fstab`
- [ ] `borg list /mnt/unas/<host>` works
- [ ] Nightly backup cron jobs present
- [ ] Borg key and passphrase stored safely off-host

---

## 9. Testing a Restore 

At least periodically, perform a dry-run restore test on non-production hardware:

1. Spin up a VM.
2. Create minimal partitions and install a base OS.
3. Mount NFS.
4. Install Borg.
5. Restore an archive for one host into that environment.
6. Attempt to inspect files.
7. Validate critical configs and data exist.

This proves the backups are usable and the runbook is accurate.

---

### “System fails to boot after restore”

- Re-check:
  - GRUB install target (`/dev/nvme0n1`, not a partition)
  - EFI partition mounted correctly during chroot
  - `update-grub` output for correct root UUID
- For Pi: ensure `/boot` partition has valid firmware + kernel.

---
