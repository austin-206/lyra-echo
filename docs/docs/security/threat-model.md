# Threat Model

## Purpose
Identify and document potential threats to the Lyra Echo ecosystem, including their likelihood, impact, and current mitigation controls. The goal is to preserve confidentiality, integrity, and availability across all nodes.

---

## System Overview
Lyra Echo is a closed, on‑premises AI ecosystem composed of:
- **Lyra:** GPU inference and orchestration host
- **Vega:** automation and monitoring hub
- **Mirror nodes:** edge interface units with microphones, displays, and sensors
- **Satellite nodes:** lightweight presence and environmental sensors
- **Network:** segmented VLANs with management isolation

---

## Primary Assets
| Asset | Description | Security Goal |
|:--|:--|:--|
| Model weights and embeddings | Locally stored inference data and memory | Confidentiality, Integrity |
| Conversation history | Local user interaction records | Confidentiality |
| Configuration and .env files | Contain credentials and keys | Confidentiality |
| MQTT broker | Message transport between nodes | Integrity, Availability |
| Node orchestration APIs | FastAPI endpoints for tool calls | Integrity, Availability |
| Physical mirror unit | Interface and microphone array | Integrity, Privacy |

---

## Threat Surface Summary

| Vector | Description | Example Risk | Mitigation |
|:--|:--|:--|:--|
| Network exposure | Misconfigured ports or VLAN routing | Unauthorized access to API or MQTT | Strict VLAN separation, deny‑by‑default firewall |
| Credential leakage | Exposed `.env` or backup files | API key compromise | Secrets in `.env`, no Git commits, encrypted NAS backup |
| Firmware exploitation | Outdated Pi OS or Docker images | Remote code execution | Routine updates and signature verification |
| Local eavesdropping | Microphone capture misuse | Privacy breach | STT time‑boxed, audio not stored |
| Hardware tampering | Physical access to mirror electronics | Keylogger or mic bypass | Sealed frame, tamper indicators |
| Model poisoning | Malicious model or embedding injection | Degraded or manipulated responses | Hash verification, trusted pull sources |
| Supply chain | Container or dependency compromise | Persistence implant | Image signing, offline build registry |

---

## Trust Boundaries
- **User boundary:** interaction limited to local environment (no cloud call‑outs).  
- **Network boundary:** only Vega and Lyra communicate over LAN.  
- **Model boundary:** models and embeddings never transmitted externally.  
- **Data boundary:** no outbound telemetry beyond local Prometheus.

---

## Residual Risks
- Physical theft of hardware (mitigated by physical security).  
- Denial‑of‑service from local misconfiguration (I did it to myself).  
- False presence signals from unverified sensor nodes (planned cryptographic validation).

_Last updated: 2025‑11‑10_
