# Testing Framework

## Purpose
Define testing methodology for Lyra/Echo components including orchestration logic, tool integration, and latency validation.

---

## Test Categories

| Type | Scope | Description |
|:--|:--|:--|
| Unit | Code modules | Verify isolated functions and classes |
| Integration | API and tools | Test orchestration between layers |
| Contract | JSON schema | Validate input/output against schema |
| Performance | End-to-end | Measure latency and throughput |

---

## Environment Setup
Tests run inside the virtual environment using `pytest`.

```bash
source .venv/bin/activate
pytest -v
```

To run only fast tests:
```bash
pytest -m "not slow"
```

---

## Example Unit Test
```python
def test_tool_output_schema():
    from code.tools.home_assistant import call_service
    result = call_service("light.turn_on", "light.hall")
    assert "entity_id" in result
    assert result["status"] == "ok"
```

---

## Contract Testing
Schemas defined in `docs/api-contracts.md` are validated using `jsonschema`.

```bash
pytest tests/test_contracts.py
```

Example:
```python
from jsonschema import validate
from schemas.turn_finish import schema

def test_turn_finish_schema():
    response = {...}
    validate(instance=response, schema=schema)
```

---

### Performance Benchmarks
Using Locust to measure latency.

Expected targets:

| Metric | p95 Goal |
|:--|:--|
| STT → LLM → TTS loop | ≤ 1500 ms |
| API request latency | ≤ 200 ms |
| Qdrant vector search | ≤ 50 ms |


---

## Reporting
- Test results stored in `/reports/test-results.xml` for CI/CD use.
- Failures auto-flagged in Grafana via webhook.

_Last updated: 2025-11-10_
