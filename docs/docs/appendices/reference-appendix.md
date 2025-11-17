# Architecture Appendix — Glossary and Standards

## Purpose
A unified glossary, schema examples, and standards cross‑references used throughout Lyra Echo documentation. A canonical reference for terminology and compliance alignment.

---

## Glossary

| Term | Definition |
|:--|:--|
| **Lyra** | Core GPU orchestration host running LLM inference, embeddings, and orchestration APIs. |
| **Vega** | Automation and monitoring hub hosting MQTT, Node‑RED, Prometheus, Grafana, and Home Assistant. |
| **Mirror Node** | Raspberry Pi 5 system powering the two‑monitor smart‑mirror interface with sensors and STT/TTS loop. |
| **Satellite Node** | Lightweight Pi Zero 2 W presence or environmental sensor nodes reporting via MQTT. |
| **Orchestrator** | Software layer coordinating STT → LLM → TTS interactions and tool calls. |
| **Qdrant** | Vector database used for long‑term memory and embedding retrieval. |
| **Ollama** | Local model runtime providing quantized LLM execution on Lyra’s GPU. |
| **Node‑RED** | Flow‑based automation engine integrating sensors, MQTT, and orchestration actions. |
| **Home Assistant** | Automation system managing environment devices and scenes. |
| **Prometheus / Grafana** | Monitoring stack collecting and visualizing metrics from all nodes. |
| **MQTT** | Message Queuing Telemetry Transport; lightweight publish/subscribe protocol used for inter‑node events. |
| **STT / TTS** | Speech‑to‑Text / Text‑to‑Speech subsystems operating locally on the mirror. |
| **Vector Embedding** | Numerical representation of text or context for semantic retrieval. |
| **Presence Detection** | Sensor‑based detection of movement or occupancy, used to select active mirror nodes. |
| **FastAPI** | Python web framework powering the orchestration API layer. |
| **DCGM** | NVIDIA Data Center GPU Manager; exporter used for GPU telemetry. |
| **VLAN** | Virtual LAN segmentation providing network isolation and policy enforcement. |
| **Policy Document** | Compliance file under `docs/policies/` defining operational and security controls. |

---

## Schema Definitions

### Conversation Turn (API contract)
```json
{
  "turn_id": "uuid",
  "timestamp": "2025-11-10T20:00:00Z",
  "user": "hash",
  "device": "mirror-01",
  "asr_text": "Turn on the hallway lights",
  "llm_model": "mixtral:8x7b-instruct",
  "reply_text": "Turning on the hallway lights.",
  "actions": [
    {
      "type": "home_assistant",
      "service": "light.turn_on",
      "entity_id": "light.hallway"
    }
  ],
  "telemetry": {
    "stt_ms": 864,
    "llm_ms": 1240,
    "tts_ms": 720,
    "total_ms": 2824
  }
}
```

### Environmental Telemetry Payload (MQTT)
```json
{
  "topic": "env/mirror-01",
  "timestamp": "2025-11-10T20:01:15Z",
  "temperature_c": 22.1,
  "humidity_pct": 41.2,
  "pressure_hpa": 1009.3,
  "presence": true
}
```

### Vector Memory Entry (Qdrant)
```json
{
  "id": "uuid",
  "text": "User asked about the weather forecast.",
  "embedding": [0.021, 0.341, -0.117, ...],
  "namespace": "mirror-01",
  "timestamp": "2025-11-10T20:05:00Z",
  "ttl_days": 90
}
```

---

## Cross‑Referenced Standards and Frameworks

| Domain | Reference | Alignment | Notes |
|:--|:--|:--|:--|
| **Information Security** | NIST Cybersecurity Framework (CSF 1.1) | ID.AM, PR.AC, DE.CM subcategories | Mapped to access control and monitoring policies. |
| **Risk Management** | NIST SP 800‑37 Rev. 2 (RMF) | Prepare, Categorize, Monitor phases | Used in risk register methodology. |
| **Privacy** | ISO/IEC 27701 Extension to 27001 | Privacy Information Management | Mirrors the “local‑only” personal data design. |
| **IoT Security** | ETSI EN 303 645 | 4.1 to 4.5 requirements | Applies to Pi Zero / Mirror firmware practices. |
| **Network** | IEEE 802.1Q | VLAN tagging and segmentation | Basis for internal isolation. |
| **AI Ethics** | OECD Principles on AI (2019) | Transparency, Safety, Accountability | Reflected in Ethical Use Policy. |
| **Software Versioning** | Semantic Versioning 2.0.0 | MAJOR.MINOR.PATCH | Enforced in release documentation. |

---

## References
- NIST SP 800‑37 Rev. 2 — Risk Management Framework.  
- NIST Cybersecurity Framework v1.1.  
- ISO/IEC 27001:2022 and 27701:2019.  
- ETSI EN 303 645 V2.1.1 (2020‑06) — Cyber Security for Consumer IoT.  
- OECD Recommendation of the Council on Artificial Intelligence (2019).  
- Semantic Versioning Specification 2.0.0 — <https://semver.org/>.

_Last updated: 2025‑11‑10_
