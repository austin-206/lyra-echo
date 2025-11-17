# Architecture Overview

Lyra/Echo is a local-first stack that links a GPU host (“Lyra”) with a digital mirror interface (“Echo”), coordinated by a simple API + message bus.

---

## Topology (at a glance)
- **Core host (Lyra):** Ryzen 9 + RTX 5090 — local LLMs, FastAPI orchestration.
- **Mirror Interface (Echo):** Raspberry Pi 5 — MagicMirror² UI, mic/speakers, camera/presence sensors.
- **Infra hub (Vega):** MQTT broker, Home Assistant, Node-RED, Grafana, Nextcloud.

> Diagram placeholder: add `docs/images/architecture.png` and reference it with  
> `![architecture](../images/architecture.png)`

---

## Dataflow (voice turn)
1. **Capture (Pi 5):** ReSpeaker mic → STT transcript.
2. **Ingress (FastAPI on Lyra):** `/turn.start` receives transcript + context.
3. **Orchestration:** Router/agents decide tools; LLM runs locally.
4. **Tools:** Home Assistant / Qdrant / Search / Calendar via whitelisted wrappers.
5. **Egress:** `/turn.finish` returns reply text + actions; Pi 5 synthesizes TTS and updates the UI.
6. **Telemetry:** per-turn metrics (latency, token count, tool timings) to Grafana (planned).

---

## Services
| Service | Where | Notes |
|:--|:--|:--|
| LLM Runtime | Lyra | Ollama |
| Orchestrator API | Lyra | FastAPI (local REST), MQTT for edge events |
| Vector DB | Lyra | Qdrant |
| Home Automation | Vega | Home Assistant + Node-RED |
| UI | mirror-pi | MagicMirror² + custom modules |

---

## Reliability & Safety (initial)
- **Local-only:** deny inbound from WAN; no cloud keys required.
- **Degradation:** if tools/timeouts occur, reply text-only and log incident.
- **Power:** selective UPS; mirror defers automation until grid restored.


