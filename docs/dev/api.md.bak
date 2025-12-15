# API Reference

## Purpose
Document the FastAPI orchestration interface for Lyra Echo. Defines available endpoints, payload formats, and operational behavior.

---

## Overview
The API bridges the mirror nodes, orchestration logic, and tool ecosystem.

| Function | Method | Path | Description |
|:--|:--:|:--|:--|
| Receive input | POST | `/turn.start` | Accepts STT transcripts and context metadata |
| Return output | POST | `/turn.finish` | Sends generated responses and tool actions |
| Health check | GET | `/healthz` | Confirms API readiness |
| Metrics | GET | `/metrics` | Returns Prometheus metrics for monitoring |

---

## Endpoint Details

### POST `/turn.start`
Example payload:
```json
{
  "user": "hash",
  "device": "mirror-01",
  "asr_text": "Turn on the lights",
  "locale": "en-US",
  "context": {"room": "hall", "presence": true}
}
```
Response:
```json
{
  "turn_id": "uuid",
  "status": "received"
}
```

---

### POST `/turn.finish`
Response payload from Lyra to mirror node:
```json
{
  "reply_text": "Turning on the lights.",
  "actions": [{"type": "home_assistant", "service": "light.turn_on", "entity_id": "light.hall"}],
  "telemetry": {"tokens": 312, "latency_ms": 842}
}
```

---

## Authentication
Use bearer token from `.env` configuration:
```bash
Authorization: Bearer $ECHO_API_KEY
```
Tokens rotate per policy `access-control.md`.

---

## Error Codes
| Code | Meaning | Resolution |
|:--|:--|:--|
| 400 | Bad input | Validate JSON schema |
| 401 | Unauthorized | Verify API key |
| 404 | Endpoint not found | Check route definition |
| 500 | Internal error | Review logs under `/var/log/lyra-api/` |

---

## Logs and Observability
- API requests logged in structured JSON.
- Trace IDs included in every request-response cycle.
- Metrics exported for Prometheus at `/metrics`.

_Last updated: 2025-11-10_
