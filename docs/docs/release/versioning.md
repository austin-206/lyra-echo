# Versioning Policy

## Purpose
How are versions assigned, incremented, and tracked across the Lyra/Echo ecosystem? The goal is consistent communication of change scope and impact for documentation, orchestration services, and hardware updates.

---

## Version Format
Lyra/Echo follows **semantic versioning** (SemVer 2.0.0):

```
MAJOR.MINOR.PATCH[-qualifier]
```

| Field | Meaning | Examples |
|:--|:--|:--|
| **MAJOR** | Incompatible API or architectural changes | `2.0.0` |
| **MINOR** | Backward‑compatible feature additions | `1.2.0` |
| **PATCH** | Backward‑compatible fixes or optimizations | `1.2.3` |
| **Qualifier** | Optional tag for test or branch state | `1.3.0‑beta`, `1.3.0‑rc1` |

---

## Scope of Versioning
- **Documentation:** Each MkDocs release aligns with the current system version.  
- **Container stack:** Vega and Lyra Docker Compose stacks track MAJOR.MINOR versions independently.  
- **Firmware / Pi nodes:** Mirror and satellite nodes track **image build numbers** mapped to the orchestration release.  
- **Policies:** Security, governance, and operational documents update on MINOR or PATCH increments if behavior changes.

---

## Version Lifecycle
1. **Development (‑dev / ‑beta):** internal testing builds; not guaranteed stable.  
2. **Release Candidate (‑rc):** feature‑complete; awaiting verification.  
3. **Stable:** production baseline; archived in changelog.  
4. **Deprecated:** superseded but retained for rollback reference.  

---

## Tagging and Documentation Alignment
- Version tags applied at every release (`v1.4.0`).  
- MkDocs `mkdocs.yml` updated with site_version field if used.  
- Changelog entry required for every version increment (see template).  

---

## Compatibility Rules
- Node API changes trigger **MAJOR** increment.  
- Added orchestration tools, sensors, or optional features → **MINOR**.  
- Bugfixes or documentation‑only edits → **PATCH**.  
- Changes to local policies without code changes may use `‑policy` qualifier.

---

## Example Mapping
| Layer | Example Version | Notes |
|:--|:--|:--|
| Lyra orchestration | `1.3.0` | Adds new tool integration |
| Vega container stack | `1.3.1` | Patches MQTT auth plugin |
| Mirror node firmware | `1.3.0‑b2` | Second beta image |
| Docs site | `1.3.1` | Mirrors orchestration + patch notes |

---

## Version Retention
Maintain last **two** MAJOR and all active MINOR versions for rollback.  
Store Docker image digests and configuration exports on the NAS under `/backups/lyra‑versions/`.

_Last updated: 2025‑11‑10_
