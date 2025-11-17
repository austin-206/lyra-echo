# Agents

Agents are narrow, composable roles. The orchestrator routes each turn to one or more agents with clear budgets and guardrails.

---

## Roles

### Router
Classifies intent and selects the next hop(s).  
Emits: `task`, `tools_allowed`, `sensitivity`, `priority`.

### Task Agents
- **Home Ops** — Home Assistant actions, scenes, and queries.
- **Knowledge** — factual answers; cites sources when RAG is used.
- **Calendar** — read/write events; summaries and availability.
- **Network Triage** — basic device lookups, IDS/NetBox summaries.
- Extend with additional skills as needed.

### Style Layer
Shapes output wording only. No new facts. No tool calls.

---

## Routing Policy (deterministic)

1. Reject unsafe or out-of-scope requests.
2. Map to exactly one primary task agent.
3. Cap hops at **3** per turn (Router → Task → Style).
4. Cap tool calls at **2** per turn (soft cap; overflow is logged).
5. Prefer cached answers when confidence ≥ threshold.

---

## Permissions

| Agent        | Tools allowed                           | Write ops |
|:-------------|:----------------------------------------|:----------|
| Home Ops     | `home_assistant.*`, `memory.get`        | Limited*  |
| Knowledge    | `memory.search`, `web.local-index`      | No        |
| Calendar     | `calendar.read`, `calendar.write`       | Yes       |
| Network      | `ids.query`, `netbox.read`              | No        |
| Style        | —                                       | No        |

\* Home Ops write operations require an explicit plan + confirmation unless running in a pre-approved routine.

---

## Budgets

- **Latency target:** p50 ≤ 1200 ms end-to-end.
- **Tool timeouts:** 800 ms per call; total tools ≤ 1500 ms.
- **Token limits:** set per model; router trims context first.

---

## Router Output (schema)

```json
{
  "task": "home_ops|knowledge|calendar|network|none",
  "confidence": 0.0,
  "tools_allowed": ["home_assistant.call_service"],
  "sensitivity": "low|medium|high",
  "priority": "normal|urgent",
  "notes": "short rationale"
}
```

---

## Tool Call Record (schema)

```json
{
  "name": "home_assistant.call_service",
  "args": {"service":"light.turn_on","entity_id":"light.hall"},
  "start_ms": 0,
  "end_ms": 0,
  "status": "ok|timeout|error"
}
```

---

## Error Handling

- **Router uncertain:** fall back to Knowledge; include a clarifying sentence.
- **Tool timeout:** degrade to text-only answer; log record with `status=timeout`.
- **Write denied:** return plan and ask for confirmation; do not retry automatically.

---

## Telemetry

- Trace ID per turn, propagated across Router → Task → Tools.
- Metrics: tokens, total latency, tool latencies, error rates by agent.
- Logs redact user text; keep structure and timings.

---

## Versioning

- Prompts live in `code/prompts/`. Name with semantic versions (e.g., `router_v1.2.md`).
- Record changes in `/entries/` with a short rationale and any metric deltas.
