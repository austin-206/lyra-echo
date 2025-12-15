# Mirror Interface

## Purpose
Define the visual layout and behavior of the smart‑mirror display, including status regions, interaction text, and system indicators. This page specifies what is shown, when it appears, and how the UI degrades safely.

---

## Layout (Two‑Panel)
- **Left Panel — Conversation**
  - Live transcription (user input) with per‑word streaming.
  - Assistant response text (type‑on effect) with partials.
  - Turn metadata: timestamp, agent used (optional), action badges.
- **Right Panel — Dashboard**
  - Time/date and day context.
  - Calendar agenda (next 5 items).
  - Map to destination and travel time based on calendar events
  - Weather summary (current + next 12h).
  - System tiles: presence, sensors, network/service status.

> Panels adapt for single‑panel fallback: the conversation view takes priority; dashboard minimizes to a status bar.

---

## States
- **Idle**: ambient clock + compact widgets; presence indicator dormant.
- **Listening**: subtle glow/cursor in mic icon; “listening…” caption.
- **Thinking**: progress pulse; optional token/latency micro‑meter.
- **Speaking**: text type‑out synchronized with TTS; “tap to stop” affordance.
- **Error/Degraded**: banner displays recovery hint (“Broker reconnecting”).

---

## Data Inputs
- STT stream (mirror node)
- Orchestrator response stream (Lyra)
- MQTT topics (presence/env/sys)
- Calendar/weather/map providers (local integrations)

---

## Behavior Rules
- New turns push older content upward; keep a rolling window (e.g., last 10 turns).
- Collapse long assistant outputs after completion with “expand” affordance.
- If TTS fails, continue to display text; add inline notice.
- If STT is interrupted, keep partial transcript with “incomplete” badge.

---

## Accessibility
- High‑contrast theme and large type sizes for visibility through reflective glass.
- Captions always available (TTS never without text).
- Motion and flashing kept minimal
- Color used as a *secondary* signal; rely on text labels and icons.

---

## Telemetry (non‑PII)
- Per‑turn latency budget (stt/llm/tts segments).
- Error counts and network state.
- Render frame times (optional).

---

## Configuration Surface
- Toggle widgets (calendar/weather/map service tiles).
- Set turn window length and type‑on speed.
- Enable/disable presence‑based auto‑wake.
- Choose compact/expanded dashboard modes.

---

## Future Work
- Event‑driven “card” system for actions (timers, reminders, media).
- Live captions for media playback.
- Dynamic layout profiles for different users (see Personalization).
- Facial recognition hooks for user‑specific dashboards (planned; see Security).

_Last updated: 2025-11-10_
