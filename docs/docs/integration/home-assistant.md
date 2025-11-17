# Home Assistant Integration

## Purpose
Describe how Lyra/Echo exchanges data and commands with the Home Assistant (HA) instance running on the Vega server.

## System Context
- **Host:** Vega
- **Platform:** Home Assistant (Docker, non‑supervised)
- **Broker:** Mosquitto (same host, shared Docker network)
- **Peers:** Lyra API and edge Pi devices via MQTT

## Integration Architecture
Lyra/Echo communicates with Home Assistant using two channels:

**MQTT (event bus)**
   Real‑time telemetry and device state changes.
   Topic conventions in `mqtt-topics.md`.
   Bidirectional: mirror nodes publish sensors; HA publishes device states.

**REST API (service control)**
   Explicit actions (e.g., `light.turn_on`).
   Sent from FastAPI (Lyra) to HA’s REST endpoints.

## Authentication
Long‑lived HA token stored in `.env` on Vega:
Passed as `Authorization: Bearer <token>` on each REST call.

## REST Endpoints
| Action            | Endpoint                          | Method | Notes                           |
|:------------------|:----------------------------------|:-----:|:--------------------------------|
| Get entity state  | `/api/states/{entity_id}`         | GET   | Query single device state       |
| Set entity state  | `/api/states/{entity_id}`         | POST  | Rare; prefer service calls      |
| Call service      | `/api/services/{domain}/{service}`| POST  | Primary command interface       |
| Get config        | `/api/config`                     | GET   | Verify connectivity and version |

Example:
```http
POST /api/services/light/turn_on
Authorization: Bearer <token>
Content-Type: application/json

{
  "entity_id": "light.hall",
  "brightness": 200
}
```

## MQTT Data Flow
- Mirror Pi → `lyra/presence/mirror-pi-01` → presence events (JSON)
- HA → `homeassistant/light/hall/state` → light status updates
- Orchestrator subscribes to both to enrich conversation context.

Payloads are JSON and include timestamps and device IDs.

## Error Handling
| Failure                  | Recovery Action                                |
|:-------------------------|:-----------------------------------------------|
| REST 401 (invalid token) | Regenerate HA token; update `.env`             |
| REST 404 (missing entity)| Verify `entity_id` or reload HA integrations   |
| MQTT connection loss     | Auto‑reconnect with 5s backoff; log event      |
| Command timeout          | Retry once; log latency metric to Prometheus   |

## Security Considerations
- Local‑only traffic on VLAN 10.
- Restrict REST endpoints to internal addresses.
- Plan mTLS for API→HA connections.
- Rotate tokens quarterly (see `policies/access-control.md`).

## Future Expansion
- Use HA WebSocket API for faster state sync.
- Sync HA device registry into Lyra’s local KB.
- Dynamic capability discovery via `/api/services`.

_Last updated: 2025-11-10_

