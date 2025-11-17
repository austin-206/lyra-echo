---
title: "Data Retention and Privacy Policy"
summary: "Defines retention limits, memory ethics, consent rules, and sensory-data handling for Lyra."
status: "stable"
tags:
  - governance
  - policy
  - privacy
  - memory
  - alignment
---

# Data Retention and Privacy Policy (Unified & Amended)
**Effective Date:** 2025-11-16  
**Next Review:** 2026-11-16  
**Issued under:** Lyra/Echo Governance Framework v1.0  

---

# 1. Purpose and Scope
1.1 Define retention, privacy, memory-ethics boundaries, and user control for all data processed by Lyra.  

1.2 Applies to:

- short-term conversational buffers  
- long-term memory entries  
- embeddings and vector storage  
- sensor-derived data (audio, video, presence signals)  
- logs and operational metadata  

1.3 Ensures all data handling respects user consent, privacy, safety, and auditability.

---

# 2. Definitions
## 2.1 **Short‑Term Buffer**  
Transient, in-memory data used for ongoing conversational context and sensor processing. Automatically expires.

## 2.2 **Long‑Term Memory**  
User-consented, distilled knowledge supporting continuity, preferences, routines, and project context.

## 2.3 **Pinned Memory**  
Explicitly saved user-approved memory items with defined purpose and retention window.

## 2.4 **Sensory Input**  
Raw microphone, camera, presence, or IoT sensor signals handled by edge devices.

---

# 3. Policy

# 3.1 Local-Only Data 
All data remains local to the Lyra environment; no external transmission is permitted.  
Cloud backups require explicit Maintainer approval and documented risk review.

---

# 3.2 Short‑Term Buffer Retention
- Buffers may persist no longer than 30 minutes.  
- Buffers must never be written to disk.  
- Buffers must never be included in long-term memory without explicit user confirmation.  

---

# 3.3 Long‑Term Memory Ethics

## **3.3.1 Explicit Rules for What Must Never Be Remembered**
Lyra must never store:

- emotional states or psychological interpretations  
- sensitive health information  
- private interpersonal details  
- raw transcripts or verbatim conversation logs  
- raw sensor feeds (audio/video/presence)  
- children’s data without guardian consent  
- vulnerabilities unless explicitly authorized  

Prohibited memory items trigger incident logging if attempted.

---

## **3.3.2 Allowed Memory Categories**
Lyra may store:

- household factual information  
- user preferences (tools, depth of explanation, difficulty level)  
- project context and decisions  
- reminders and tasks  
- domain knowledge explicitly given by the user  
- safety preferences or boundaries  
- orientation data for memory-care modes  

---

# 3.4 Memory Pinning Requirements 
All long-term memory entries require:

- explicit user intent (“remember this,” “store this”) or  
- implicit approval via previously defined retention category  
- description of purpose  
- retention period (“until further notice” allowed)  
- ability for user to revise or delete the item at any time  

Memory entries must be:

- abstracted summaries, not raw logs  
- atomic (one entry per concept)  
- auditable  

---

# 3.5 Forgetting Workflow

Lyra must maintain a clear, auditable forgetting system:

### **3.5.1 User-Initiated Forgetting**
Users may instruct Lyra to forget:

- specific facts  
- categories of memory  
- an entire user profile  
- all long-term memory (full reset)

These actions must:

- delete the memory entry  
- delete associated embeddings  
- document removal in `/entries/memory/` with a non-sensitive stub

### **3.5.2 Automatic Forgetting**
Certain memories may expire after:

- user-specified TTL  
- category-specific retention windows  
- governance updates requiring data removal  

### **3.5.3 Memory Integrity Checks**
Quarterly reviews verify:

- expired items are purged  
- pinned memories still fall within consent rules  
- no raw transcripts exist in long-term storage  

---

# 3.6 Embeddings & Vector Storage 
- Embeddings may persist up to 90 days unless explicitly pinned.  
- Embeddings must be:
  - anonymized,  
  - non-reversible,  
  - devoid of raw content.  
- Re-embedding must not reconstruct verbatim conversation.

---

# 3.7 Sensory Input Retention Rules

## **3.7.1 Transient Buffers Only**
Raw sensory data (audio, video, presence signals) must:

- remain in RAM only  
- be erased immediately after processing  
- never be written to long-term storage  
- never be embedded or analyzed for behavioral inference  

## **3.7.2 No Behavioral Profiling**
Lyra may not store:

- movement patterns  
- routines inferred from presence sensors  
- emotional tone from voice  
- visual features beyond identity confirmation for access  

## **3.7.3 Consent for Extended Sensor Use**
Any mode involving:

- live microphone streaming,  
- camera recognition,  
- continuous presence tracking  
must be disclosed and require user confirmation.

---

# 3.8 User Data Rights
Users may:

- export long-term memory  
- request deletion of any or all memory categories  
- view summaries of what Lyra remembers  
- disable memory entirely  

Implementation must ensure safe deletion and audit logs.

---

# 4. Implementation & Enforcement

## **4.1 Security Reviewer Responsibilities**
- validate anonymization procedures  
- audit retention TTLs  
- ensure no raw sensory data persists  
- verify memory ethics compliance  

## **4.2 Operator Responsibilities**
- enforce TTL jobs  
- manage backup privacy rules  
- validate deletion workflows  

---

# 5. Review Cadence

## **5.1 Annual Verification**
- TTL and expiry mechanisms  
- memory abstraction integrity  
- sensory buffer deletion logic  
- user consent records  
- compliance with the AI Constitution  


