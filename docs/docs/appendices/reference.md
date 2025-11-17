# Reference Material

## Purpose
 A technical appendix of ports, paths, protocols, and naming conventions used throughout the Lyra/Echo ecosystem. Serves as a single lookup source for maintenance, integration, troubleshooting, and keeping track of ports used.

---

## Core Service Ports

| Service | Node | Port | Protocol | Notes |
|:--|:--|:--:|:--:|:--|
| Orchestrator API | Lyra | 8000 | HTTP | FastAPI endpoint for /turn.start / /turn.finish |
| Qdrant Vector DB | Lyra | 6333 | HTTP | Embeddings storage; local‑only |
| Ollama Engine | Lyra | 11434 | HTTP | LLM runtime endpoint |
| MQTT Broker (Mosquitto) | Vega | 1883 | TCP | Inter‑node messaging |
| Node‑RED Flows | Vega | 1880 | HTTP | Orchestration automation |
| Prometheus | Vega | 9090 | HTTP | Metrics collection |
| Grafana | Vega | 3000 | HTTP | Dashboard visualization |
| Home Assistant | Vega | 8123 | HTTP | Automation integration |
| MkDocs Site | Vega | 8000 | HTTP | Internal documentation preview |
| Security Onion | SecOps VM | 5601 | HTTPS | Elastic / Wazuh interface |
| vLLM | Lyra | 8001 | HTTP | OpenAI‑compatible API endpoint |
| DCGM Exporter | Lyra | 9400 | HTTP | GPU metrics exporter |

---

## File and Directory Paths

| Node | Path | Purpose |
|:--|:--|:--|
| Lyra | `/mnt/data1/ollama/models/` | Model storage (Ollama GGUF files) |
| Lyra | `/opt/lyra/.env` | Orchestration API credentials |
| Lyra | `/mnt/data1/qdrant/` | Vector DB persistent volume |
| Vega | `~/vega-stack/` | Container compose directory |
| Vega | `~/vega-stack/mosquitto/` | MQTT config and data |
| Vega | `~/vega-stack/prometheus/` | Prometheus config and targets |
| Vega | `~/vega-stack/grafana/` | Grafana data volume |
| Vega | `/opt/vega/.env` | Broker and dashboard secrets |
| Mirror | `/opt/lyra-mirror/` | STT/TTS client stack |
| Mirror | `/var/lib/lyra/cache/` | Local session cache (for short‑term context) |
| NAS | `/backups/lyra-versions/` | Archived releases and Docker digests |

---

## MQTT Topics

| Topic | Publisher | Subscriber | Description |
|:--|:--|:--|:--|
| `lyra/health/#` | All nodes | Vega (Node‑RED) | Health heartbeats and status |
| `lyra/alerts/system` | Vega (Node‑RED) | Lyra / Dashboard | Operational alerts |
| `presence/#` | Satellite Nodes | Vega / Mirror | Motion and proximity events |
| `env/#` | Mirror / Satellites | Vega / Prometheus | Environmental sensor data |
| `tts/play` | Lyra | Mirror | Outbound speech audio triggers |
| `stt/input` | Mirror | Lyra | Transcribed text payloads |
| `vector/update` | Lyra | Qdrant | Embedding inserts or updates |

---

## Prometheus Metrics (Common)

| Metric | Description | Target p95 Threshold |
|:--|:--|:--|
| `stt_response_ms` | Speech‑to‑text latency | < 1200 ms |
| `llm_response_ms` | LLM generation latency | < 1500 ms |
| `tts_speak_ms` | Speech synthesis latency | < 1000 ms |
| `gpu_utilization` | GPU usage percentage | < 90 % |
| `node_hwmon_temp_celsius` | CPU temperature | < 80 °C |
| `nvidia_gpu_temp_celsius` | GPU temperature | < 85 °C |
| `broker_uptime_seconds` | MQTT broker uptime | 100 % |
| `disk_percent_used` | Storage utilization | < 80 % |

---

## Naming Conventions

| Type | Format | Example |
|:--|:--|:--|
| Node hostnames | lowercase dash‑separated | `lyra`, `vega`, `mirror‑01`, `sat‑01` |
| Docker containers | lowercase dash‑separated by function | `mqtt‑broker`, `qdrant`, `nodered` |
| VLAN labels | two‑digit numeric prefix + purpose | `10‑LAN`, `20‑IOT`, `69‑MGMT` |
| Environment files | `.env`, `.env.example` | `.env.example` (documented, not secret) |
| Prometheus jobs | snake_case target host | `vega_prometheus`, `lyra_dcgm` |
| MQTT topics | slash hierarchy, no spaces | `lyra/health/mirror‑01` |

---

## Documentation Conventions
- Dates use ISO‑8601 (`YYYY‑MM‑DD`).  
- All tables use pipe (`|`) Markdown syntax for MkDocs compatibility.  
- Diagrams stored under `docs/images/architecture/` and linked using relative paths.  
- Mermaid 10‑compliant syntax only (no `<br>` tags).  
- Update this file whenever new ports, metrics, or directories are introduced.

_Last updated: 2025‑11‑10_

