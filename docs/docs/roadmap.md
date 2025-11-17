# Roadmap

## Phase 0 — Foundation
- Mirror UI (MagicMirror²) running on Pi 5  
- Presence detection (UART + OUT tested)  
- MQTT event publishing planned  
- Logging and debugging improvements  

## Phase 1 — Conversation Loop
- STT → LLM → TTS pipeline operational  
- Faster-Whisper for speech-to-text  
- Piper for speech synthesis (XTTS later)  
- Node-RED orchestration layer under test  

## Phase 2 — Scheduling & Personalization
- Calendar integration (CalDAV Apple Calendars)  
- User profiles with facial recognition  
- Morning / evening summaries  

## Phase 3 — Network Intelligence
- IDS/Zeek summaries + NetBox correlation  
- Propose firewall/ACL changes  
- Home Assistant tools exposed to LLM via wrappers  

## Phase 4 — Memory Care Mode
- Based on *Dementia-Plan* and *CaLM* caregiver models  
- Orientation prompts and gentle reminders  
- Medication and routine tracking  
- Caregiver digests + cited answers only  

## Phase 5 — Expansion
- Additional nodes (satellite audio/presence)  
- Metrics dashboards (Grafana)  
- Containerization and mTLS between nodes  

---

### Current Status
| Area | Notes |
|:--|:--|
| Mirror Hardware | Under construction |
| Presence | UART + OUT verified |
| MQTT | Pending integration |
| Orchestration | In design (FastAPI + LangChain) |
| Memory | Qdrant testing |
| TTS/STT | Functional; tuning quality |
| Network | VLAN segmentation complete |

---

_This roadmap evolves with each sprint entry in `/entries/`._

