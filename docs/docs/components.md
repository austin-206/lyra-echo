# System Components (by Device)

## Purpose
A detailed reference of all hardware and logical components in the Lyra Echo ecosystem, grouped by physical device. This view emphasizes integration boundaries and system dependencies.

---

## 1. Lyra — Core GPU Host

| Category | Component | Specification / Notes |
|:--|:--|:--|
| **Compute** | AMD Ryzen 9 9950X | 16‑core CPU, 32 threads |
| **GPU** | NVIDIA RTX 5090 | 32 GB GDDR7, primary inference engine |
| **Memory** | 128 GB DDR5‑6400 | 4x 33GB Dual‑channel configuration |
| **Storage** | 2TB NVMe Gen 5 boot drive, 2x 4TB NVMe Gen 4 storage drives  | 10TB total
| **Motherboard** | ASUS ProArt X870E‑Creator | 10 G and 2.5 G NICs, PCIe 5.0 support |
| **Power** | ROG Strix 1200 W Platinum PSU | ATX 3.1, GaN MOSFET, GPU‑first stabilization |
| **Cooling** | Noctua NH-D15S, Noctua NF-A15 | Low‑noise fan curve, GPU front intake flow |
| **OS** | Ubuntu 24.04 LTS | Headless, Docker Compose orchestration |
| **Containers** | Ollama, Qdrant, DCGM‑Exporter, Node‑RED (aux) | Local inference, memory, and telemetry |
| **UPS** | CyberPower PR1500LCDRT2U | Battery‑backed runtime ≈ 45 min |
| **Role** | Orchestration / Inference / Vector Memory | Runs LLMs, embeddings, and system orchestration API |

---

## 2. Vega — Automation and Integration Hub

| Category | Component | Specification / Notes |
|:--|:--|:--|
| **Compute** | AMD Ryzen 7 | 8 cores, 16 threads |
| **Memory** | 64 GB DDR5 | High concurrency for container stack |
| **Storage** | 500GB NVMe boot drive, 2TB NVMe storage drive | Containers and Security Onion VM |
| **OS** | Debian 12 | Headless service node |
| **Containers** | Mosquitto (MQTT), Node‑RED, Grafana, Home Assistant, | Automation, observability, and documentation hub |
| **Networking** | Dual 2.5 G Ethernet | One to LAN / One to a Mirrored switch port for Sec Onion |
| **Power** | UPS‑backed shared circuit | Continuous runtime during transfer events |
| **Role** | Integration / Automation / Monitoring | Central MQTT broker, metrics collector, and Home Assistant host |

---

## 3. Echo — Interactive Display

| Category | Component | Specification / Notes |
|:--|:--|:--|
| **Display** | Dual 24″ QLED Monitors | Behind one‑way 24 × 36 MirrorView glass |
| **Mirror Glass** | Two‑way optical (4 mm) | Balanced reflectivity / transmittance |
| **Compute** | Raspberry Pi 5 (8 GB) with AI HAT | Primary controller for STT / TTS loop |
| **Camera** | Raspberry Pi AI Camera Module 3 | 12 MP autofocus, presence / recognition tasks |
| **Audio** | ReSpeaker Lite Mic Array + Dayton DTA‑2.1BT Amp | Local STT input / TTS output pipeline |
| **Speakers** | 2 × Tectonic TEBM35C10‑4 BMR 2″ | Full‑range balanced mode radiators |
| **Cooling** | Noctua 40 mm Fans (x2) | Intake + exhaust flow, quiet operation |
| **Sensors** | Seeed Studio BME280 (Temp/Humidity/Barometer) + Presence Radar | Environmental feedback and presence activation |
| **Power** | Integrated strip + single grommet egress | UPS‑backed via Vega circuit |
| **Network** | Wi-Fi (2.4 / 5 GHz) — LAN | Wireless connection to Vega MQTT broker and Lyra API |
| **Software** | RPi OS Bookworm 64‑bit | Runs STT, TTS, MQTT client, and display services |
| **Mounting** | Custom shadow‑box frame with French cleat | Birch construction, black interior finish |
| **Role** | Primary user interface and conversation node | Local speech processing and visual feedback |

---

## 4. Echo - Satellite Nodes

| Category | Component | Specification / Notes |
|:--|:--|:--|
| **Compute** | 2 × Raspberry Pi Zero 2 W | Lightweight presence and sensor nodes |
| **Sensors** | Presence Radar (HLK‑LD2410B‑P / Seeed Studio EP‑Lite) | Motion and proximity detection |
| **Enclosure** |  Wood housing | Minimal visible profile |
| **Network** | Wi‑Fi (2.4 GHz) to Vega MQTT broker | MQTT topics `presence/#` and `env/#` |
| **Power** | USB‑C or PoE injector | Centralized power distribution |
| **Role** | Peripheral presence and environmental context | Confirms user location and feeds state to Lyra Echo logic |

---

## 5. Network Infrastructure

| Category | Component | Specification / Notes |
|:--|:--|:--|
| **Switch** | 1 G L2.5 Ethernet | 24 PoE+ ports + 4 SFP uplinks |
| **VLANs** | Segmented IoT and user communication VLANs | Isolated management traffic |
| **Firewall** | Protectli / pfSense VM | Layer 3 routing and intrusion detection bridge |
| **NAS** | Synology DiskStation | Snapshot and config backup target |
| **UPS Integration** | Network signaling to Lyra and Vega | Graceful shutdown / restart logic |

---

## Notes
- All measurements, thresholds, and metrics map to values defined under `docs/ops/monitoring.md`.
- Component replacement or upgrade events should be logged as changelog entries under `docs/release/changelog.md`.

_Last updated: 2025‑11‑10_
