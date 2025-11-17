# Operations Runbooks

## Purpose
Provide standard, repeatable procedures for responding to service interruptions, degraded performance, or environmental faults within the Lyra/Echo ecosystem.  

---

## Core Procedures

### 1. Restarting Orchestrator Services
Used when the Lyra orchestration layer or FastAPI endpoint stops responding.

```bash
sudo systemctl restart lyra-orchestrator
sudo systemctl status lyra-orchestrator
curl http://localhost:8000/healthz
```

If restart fails:
- Check Docker health (`docker ps --filter "status=unhealthy"`).
- Verify that GPU drivers and Qdrant are running.

```bash
lsmod | grep nvidia
nvidia-smi
```

```bash
sudo systemctl status qdrant
sudo journalctl -u qdrant -n 20
```

### 2. Restarting MkDocs Documentation Service (hello!) 
```bash
sudo systemctl restart mkdocs
sudo systemctl status mkdocs
```

### 3. Restarting MQTT Broker on Vega
```bash
sudo docker restart mqtt-broker
docker logs mqtt-broker --tail 50
```

### 4. Rebuilding Node-RED Flows
```bash
sudo systemctl restart nodered
journalctl -u nodered -f
```

### 5. Emergency Mode (Loss of Vega or Lyra)
- Mirror nodes operate in offline mode, answering only with cached responses.
- Log all failures to `/var/log/lyra-fallback.log`.
- Attempt re-connection every 30 seconds until restoration.

---

## Verification
- All containers show `healthy` status under Portainer.
- `curl` health checks return HTTP 200.
- Presence sensors and MQTT heartbeats resume within 60 seconds.

---

## Escalation Path
1. Local system recovery (Lyra, Vega)
2. Network diagnostics (switch, VLAN isolation)
3. Power systems and UPS checks
4. Restore from NAS snapshot if persistent failure


---

## Common Recovery Scenarios

### A. Power Recovery and UPS Transition

**Trigger:**  
A brief power interruption or generator switch causes one or more nodes to reboot or lose connection.

**Impact:**  
Vega may lose MQTT broker connectivity; Lyra’s orchestration queue may flush partial states.

**Procedure:**
1. Verify power stability and UPS runtime (`upsc lyra-ups@localhost`).
2. Wait 60 seconds for all systems to resume link-state on the network switch.
3. Run MQTT broker health check:
   ```bash
   docker logs mqtt-broker --tail 20
   ```
4. Restart dependent services if needed:
   ```bash
   sudo systemctl restart lyra-orchestrator mkdocs nodered
   ```
5. Check time synchronization (`timedatectl status`).

**Verification:**
- MQTT heartbeats visible from mirror nodes.
- Grafana dashboard metrics updating normally.
- Mirror nodes resume speech and sensor updates.

**Escalation:**  
If MQTT or orchestrator fails to reconnect, proceed to Broker Failure runbook.

---

### B. MQTT Broker Failure

**Trigger:**  
Messages no longer propagate between nodes, or mirror nodes show stale states.

**Impact:**  
No event communication between Vega, Lyra, and mirror nodes; automation halts.

**Procedure:**
1. Inspect broker logs:
   ```bash
   docker logs mqtt-broker --tail 50
   ```
2. Restart broker container:
   ```bash
   docker restart mqtt-broker
   ```
3. Confirm container health and network:
   ```bash
   docker inspect mqtt-broker | grep IPAddress
   sudo netstat -tuln | grep 1883
   ```
4. Test publish-subscribe path:
   ```bash
   mosquitto_pub -t 'lyra/test' -m 'ping'
   mosquitto_sub -t 'lyra/test' -C 1
   ```
5. Restart Node-RED if topic flows remain stale.

**Verification:**
- Heartbeat topics (`lyra/presence/#`) show activity.
- Prometheus metrics update under `broker_uptime_seconds`.
- Node-RED dashboard displays live MQTT traffic.

**Escalation:**  
If the broker continues to fail:
- Verify Docker network integrity (`docker network inspect bridge`).
- Recreate broker container from known configuration.

---

### C. Mirror Node Sync or Rebuild

**Trigger:**  
A mirror Pi stops responding or shows stale data on Vega’s dashboard.

**Impact:**  
No presence or speech input from that node.

**Procedure:**
1. SSH into the affected node or connect via serial console.
2. Confirm network reachability:
   ```bash
   ping vega.local
   ```
3. Restart MQTT client and STT service:
   ```bash
   sudo systemctl restart mqtt-client stt-service
   ```
4. If persistence errors appear, clear cached memory:
   ```bash
   sudo rm -rf /var/lib/lyra/cache/*
   sudo systemctl restart lyra-client
   ```
5. Sync configuration from Vega:
   ```bash
   rsync -avz vega:/opt/lyra/config/ /opt/lyra/config/
   ```
6. Verify registration message appears in `lyra/clients/online`.

**Verification:**
- Node visible on Grafana node uptime panel.
- Audio capture verified (`arecord -l`).
- Mirror UI updates presence states within 10 seconds.

**Escalation:**  
If the node fails to reconnect, re-flash from latest SD card image and reassign identity in Node-RED.

---

## General Validation
After any recovery action:
```bash
curl http://localhost:8000/healthz
mosquitto_sub -t 'lyra/health/#' -v -C 5
```

- Lyra and Vega both report healthy states.
- Mirror nodes show synchronized timestamps and status metrics.

---

## Documentation Updates
After every incident, record the action taken in `entries/YYYY-MM-DD-runbook.md`.  
Include timestamps, systems affected, and metrics confirming recovery.

---

_Last updated: 2025-11-10_
