# System Monitoring

## Purpose
Establish observability and health monitoring practices for the Lyra Echo ecosystem. Monitoring ensures uptime, performance, and safety of local AI operations.

---

## Tools and Dashboards
- **Prometheus:** collects metrics from Lyra, Vega, and mirror nodes.
- **Grafana:** visualizes latency, uptime, token usage, and memory health.
- **Node-RED:** streams key events for lightweight visualization and rule-based alerts.
- **Security Onion:** consumes system logs for intrusion detection.

---

## Key Metrics

| Category | Metric | Source | Threshold |
|:--|:--|:--|:--|
| STT latency | `stt_response_ms` | Mirror nodes | < 1200 ms p95 |
| LLM latency | `llm_response_ms` | Lyra orchestrator | < 1500 ms p95 |
| TTS synthesis time | `tts_speak_ms` | Mirror nodes | < 1000 ms p95 |
| MQTT uptime | `broker_uptime_seconds` | Vega MQTT | 100% |
| Disk usage | `disk_percent_used` | Lyra, Vega | < 80% |
| GPU memory | `gpu_utilization` | Lyra | < 90% |
| CPU temperature | `node_hwmon_temp_celsius` | Lyra, Vega (node_exporter) | < 80 °C sustained |
| GPU temperature | `nvidia_gpu_temp_celsius` | Lyra (dcgm-exporter) | < 85 °C sustained |

---

## Alerting
- Prometheus Alertmanager sends internal notifications via MQTT topic `lyra/alerts/system`.
- Node-RED mirrors alerts to MagicMirror² UI with severity coloring.
- Critical alerts logged locally under `/var/log/lyra-alerts.log`.

---

## Health Checks
- REST endpoints: `/healthz`, `/readyz`
- MQTT heartbeat topics from all nodes
- Periodic agent check-ins (5-minute intervals)

---

## Troubleshooting
1. Validate metric source with `curl localhost:9090/metrics`.
2. Restart `prometheus` or `grafana` containers if unresponsive.
3. Confirm firewall allows intra-VLAN scraping.

_Last updated: 2025-11-10_
