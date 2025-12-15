# Voice Interaction

## Purpose
Specify the end‑to‑end behavior for voice capture (STT), conversational orchestration, and speech synthesis (TTS) on mirror nodes.

---

## Interaction Loop
1. **Wake/Start**: hotword or presence‑tapped push‑to‑talk.
2. **Capture**: STT records a short segment (time‑boxed).
3. **Orchestrate**: payload sent to Lyra; tools may be invoked.
4. **Speak**: TTS returns audio; mirror plays while rendering text.
5. **Confirm/Act**: optional confirmation for actions (lights, timers, etc.).

---

## UX Guidelines
- **Latency targets**: end‑to‑end ≤ 1500 ms p95.
- **Full‑duplex feel**: stream partial transcripts and partial responses.
- **Silence detection**: auto‑stop capture after N seconds of silence.
- **Barge‑in**: allow user to interrupt TTS to ask a follow‑up.
- **Error cues**: plain language (“didn’t catch that”) with retry affordance.

---

## STT Policy
- Primary: Faster‑Whisper on mirror node.
- Fallback: smaller local model when CPU/GPU constrained.
- Privacy: audio is not stored; transcripts are redacted before memory use.

---

## TTS Policy
- Testing: Piper (local) with selected persona voice.
- Future: XTTS on GPU for higher fidelity.
- Always render synchronized text; never speech‑only.

---

## Safety and Permissions
- Action execution requires explicit confirmation for sensitive operations.
- Rate limit repeated commands to avoid accidental loops.
- Enforce per‑user tool/room permissions when personalization is active.

---

## Observability
- Metrics: `stt_response_ms`, `tts_speak_ms`, error counts.
- Traces: per‑turn `trace_id` across STT → Orchestrator → TTS.
- Logs: redact user text in error paths; keep timings and tool names only.

---

_Last updated: 2025-11-10_
