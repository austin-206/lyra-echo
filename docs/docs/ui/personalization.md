# Personalization

## Purpose
User‑aware adaptations of the interface and behavior while preserving privacy. Personalization is opt‑in and local‑only.

---

## User Profiles (Local)
- Minimal records keyed by a local identifier (not PII).
- Stored on Lyra; loaded on mirror nodes as needed.
- Attributes may include:
  - preferred name (display only)
  - voice speed / volume
  - widget preferences (calendar, weather, system tiles)
  - quiet hours
  - room/device permissions

> Do not store raw images or faces in profiles. Facial recognition, if enabled, should emit only a local match token usable for personalization gates.

---

## Feature Adaptation
- **Dashboard**: reorder or show/hide tiles per user.
- **Greeting**: time‑aware salutations with preferred name.
- **Voice**: per‑user TTS rate/volume; optional alternative voice.
- **Presence logic**: Address multiple users

---

## Data Flow
1. Mirror node requests active profile on wake (local match token or manual select).  
2. Lyra returns a minimal context pack (preferences only).  
3. UI applies layout/voice settings for the session.  
4. No profile changes occur unless explicitly requested by the user.

---

## Governance
- Opt‑in per user; changes logged to an audit trail without content.
- Profiles are exportable and deletable.
- Retention limited; stale profiles are purged per policy.

---

## Security Considerations
- No synchronization of personalization data.
- All identifiers are hashed; avoid usernames, emails, or biometrics at rest.
- Facial recognition processing remains local; only a “match=yes/no + token” is exposed to the UI layer.

---

## Future Work
- User‑specific dashboards (layout presets by role).
- On‑device FR pipeline with privacy mode toggle.
- Context‑adaptive prompts that respect user quotas and tool scoping.

_Last updated: 2025-11-10_
