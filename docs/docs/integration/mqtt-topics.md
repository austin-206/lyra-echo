# MQTT Topics and Message Schema

## Purpose
Define the topic hierarchy, message structure, and communication conventions used by Lyra/Echo components via the MQTT broker on Vega.

## Overview
MQTT serves as the event and telemetry backbone for Lyra Echo, enabling low-latency, bi-directional communication between:

- **Mirror Nodes** — Raspberry Pi units publishing presence, sensor, and system data.
- **Orchestrator (Lyra)** — central intelligence handling reasoning, context, and tool invocation.
- **Home Assistant (Vega)** — automation and environment control subsystem.

All traffic occurs over the internal broker hosted on Vega.
No external MQTT bridges or public brokers are permitted.

## Topic Naming Convention
Topics follow a structured, hierarchical format:

```
lyra/<domain>/<device>/<datatype>
```

| Segment | Description | Example |
|:--|:--|:--|
| `lyra` | Root namespace for all topics | `lyra/presence/...` |
| `<domain>` | Function or category (presence, env, tts, logs) | `lyra/env/...` |
| `<device>` | Node identifier | `mirror-01`, `mirror-02`, `satellite-a` |
| `<datatype>` | Payload purpose or subtype | `state`, `event`, `metrics` |

This structure ensures consistent discovery and filtering across devices and tools.

## Core Topics

| Domain | Direction | Example | Payload Type | Description |
|:--|:--|:--|:--|:--|
| `presence` | Node → Broker | `lyra/presence/mirror-01/state` | JSON | Motion and user detection events |
| `speech` | Node ↔ Lyra | `lyra/speech/mirror-01/input` | JSON | STT text or audio stream notifications |
| `tts` | Lyra → Node | `lyra/tts/mirror-01/output` | JSON | TTS response metadata |
| `env` | Node → Broker | `lyra/env/mirror-01/data` | JSON | Environmental sensor readings |
| `cmd` | Lyra → Node | `lyra/cmd/mirror-01/action` | JSON | Execution of local commands (reboot, restart, etc.) |
| `syslog` | Any → Broker | `lyra/syslog/mirror-01/info` | Text | Lightweight logging and diagnostic output |
| `ha` | Vega ↔ Lyra | `lyra/ha/light/hall` | JSON | Home Assistant state relays and automations |

## Payload Standards
All messages are UTF-8 encoded JSON objects.

### Common Fields
```json
{
  "timestamp": "2025-11-10T22:00:00Z",
  "device_id": "mirror-01",
  "type": "presence",
  "data": { "state": "active" },
  "trace_id": "uuid-string"
}
```

### Required Keys
| Field | Type | Description |
|:--|:--|:--|
| `timestamp` | string (ISO-8601) | UTC time of event emission |
| `device_id` | string | Unique ID of publishing node |
| `type` | string | High-level event type |
| `data` | object | Arbitrary event or telemetry content |
| `trace_id` | string | Unique ID for cross-system trace correlation |

## QoS and Retain Policy
| Topic Pattern | QoS | Retain | Notes |
|:--|:--:|:--:|:--|
| `lyra/presence/#` | 1 | false | Real-time motion; no retain |
| `lyra/env/#` | 1 | true | Keep last sensor reading |
| `lyra/syslog/#` | 0 | false | Debug-only, non-critical |
| `lyra/tts/#` | 0 | false | Transient speech synthesis data |
| `lyra/cmd/#` | 1 | false | Command reliability preferred |
| `lyra/ha/#` | 1 | true | Maintain latest HA state mirror |

## Error Handling and Retry
- Nodes retry publish up to **3 times** on broker disconnect.
- The orchestrator logs dropped packets with trace IDs for later inspection.
- MQTT connection loss triggers exponential backoff starting at 2 seconds.
- Messages are validated against a local JSON schema before publish.

## Security Controls
- Broker accessible only to authenticated clients with unique credentials.
- TLS supported and required for all nodes once certificates are provisioned.
- All connections restricted to the internal network; no public topics or wildcard bridges.
- Credentials rotated quarterly per `access-control.md`.

## Future Considerations
- Implement per-device topic authorization (ACLs).
- Add compression for high-frequency telemetry.
- Evaluate MQTTv5 user properties for richer message metadata.
- Integrate Prometheus MQTT exporter for per-topic metrics.

_Last updated: 2025-11-10_
