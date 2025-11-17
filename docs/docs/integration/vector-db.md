# Vector Database Integration

## Purpose
Define how Lyra/Echo stores and retrieves long‑term semantic memory using a local vector database on Lyra. This document standardizes collections, payload schemas, retention, and access patterns so agents and tools behave consistently.

---

## Context
- **Host:** Lyra (GPU inference and orchestration host)
- **Engine:** Qdrant 
- **Usage:** Long‑term memory for turns, tools, and documents; fast semantic retrieval during orchestration
- **Policy:** Retention and privacy governed by `policies/data-privacy.md`

---

## Collections and Schemas

### 1) `mem_turns`
Per‑turn conversational memory items (post‑redaction).

**Vector**
- `embedding_dim`: 768 (or model‑specific)  
- `distance`: cosine

**Payload (JSON)**
```json
{
  "turn_id": "uuid",
  "user_id": "hash",
  "device_id": "mirror-01",
  "role": "user|assistant|system",
  "text": "string",
  "tokens": 312,
  "ts": "2025-11-10T22:00:00Z",
  "trace_id": "uuid",
  "tags": ["topic:lighting", "room:hall"],
  "ttl_days": 90
}
```

### 2) `mem_docs`
Long‑form notes, entries, or transcribed artifacts chunked to ~1–2k chars.

**Vector**
- `embedding_dim`: 768  
- `distance`: cosine

**Payload**
```json
{
  "doc_id": "uuid",
  "chunk_id": "uuid",
  "title": "Lyra Echo Roadmap",
  "source": "entries/2025-11-10.md",
  "text": "chunk text",
  "ts": "2025-11-10T22:00:00Z",
  "tags": ["doc:roadmap", "area:planning"],
  "ttl_days": 90
}
```

### 3) `mem_tools`
Structured context about tools, devices, or entities used by agents.

**Vector**
- `embedding_dim`: 768  
- `distance`: cosine

**Payload**
```json
{
  "entity_id": "light.hall",
  "domain": "home_assistant",
  "capabilities": ["turn_on", "turn_off", "brightness"],
  "desc": "Hall light circuit, dimmable.",
  "ts": "2025-11-10T22:00:00Z",
  "tags": ["entity:light.hall", "cap:brightness"],
  "ttl_days": 180
}
```

---

## Namespacing and Tags
Use predictable tags to filter context quickly:
- `topic:<name>` — high‑level subject, e.g., `topic:presence`
- `room:<name>` — physical context, e.g., `room:hall`
- `agent:<name>` — origin agent, e.g., `agent:router`
- `entity:<id>` — specific device or resource

Agents should combine **semantic similarity** with **tag filters** for precise recall.

---

## Upsert and Search (Qdrant HTTP examples)

### Upsert
`POST /collections/mem_turns/points`
```json
{
  "points": [
    {
      "id": "uuid",
      "vector": [0.01, 0.12, ...],
      "payload": {
        "turn_id": "uuid",
        "user_id": "hash",
        "device_id": "mirror-01",
        "role": "assistant",
        "text": "Turning on the hall lights.",
        "tokens": 12,
        "ts": "2025-11-10T22:00:00Z",
        "trace_id": "uuid",
        "tags": ["topic:lighting","room:hall"],
        "ttl_days": 90
      }
    }
  ]
}
```

### Search with Filter
`POST /collections/mem_turns/points/search`
```json
{
  "vector": [0.01, 0.12, ...],
  "limit": 8,
  "filter": {
    "must": [
      {"key": "tags", "match": {"any": ["room:hall"]}},
      {"key": "role", "match": {"value": "assistant"}}
    ]
  },
  "with_payload": true,
  "with_vectors": false
}
```

---

## Embedding Parameters
- **Model:** consistent sentence embedding model (e.g., bge‑small, all‑MiniLM)
- **Normalization:** L2‑normalize before upsert (for cosine)
- **Chunking:** 1–2k characters; include small overlaps (~128 chars) for continuity
- **Deduping:** optional MinHash or hash on text to avoid duplicates

---

## Retention and Deletion
- Default TTL: **90 days** for `mem_turns` and `mem_docs`.  
- Longer TTL (e.g., 180) for `mem_tools`, since it describes stable entities.  
- Implement a daily sweeper task to hard‑delete expired points by `ttl_days` and `ts`.  
- Honor immediate delete requests by `turn_id`, `doc_id`, or `trace_id`.

> See `policies/data-privacy.md` for authoritative retention rules.

---

## Security Controls
- Local‑only access on Lyra; no public ports or external bridges.  
- API access requires a local token with least privilege.  
- Future: mTLS between orchestrator and DB.  
- Redact PII before embedding; store only hashed identifiers.  
- Do not store raw audio or transcripts in payloads; text is post‑redaction summaries.

---

## Observability
- Log upsert/search latency and result counts per request.  
- Export metrics: QPS, p50/p95 latency, collection sizes, and sweeper deletions.  
- Attach `trace_id` from orchestration turns to every DB call for end‑to‑end tracing.

---

## Backup and Restore
- Periodic snapshots written to the local NAS for long‑term retention.  
- Verify restore operations in a staging namespace before promotion.  
- Never export embeddings off‑network unless anonymized and reviewed.

---

## Common Failure Modes
| Condition | Behavior | Operator Action |
|:--|:--|:--|
| DB unavailable | Orchestrator degrades to no‑memory mode | Check Qdrant service; restore from snapshot if needed |
| Empty results | Fall back to tool‑free answer or HA state query | Review filters and tag usage |
| High latency | Reduce chunk sizes, limit filters, or adjust index params | Tune vector params; check host load |

---

## Future Work
- Evaluate HNSW tuning per collection (M, ef_construct, ef_search).  
- Add hybrid keyword + vector search for precision.  
- Consider per‑user namespaces for data minimization.  
- Explore local RAG indexing for specific device manuals and policies.

_Last updated: 2025-11-10_
