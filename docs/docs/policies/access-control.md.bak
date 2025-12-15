---
title: "Access Control Policy"
summary: "Defines authentication, authorization, model access boundaries, and memory-privilege rules for Lyra."
status: "stable"
tags:
  - governance
  - policy
  - access-control
  - alignment
---

# Access Control Policy (Amended for Model & Memory Privileges)
**Effective Date:** 2025-11-16  
**Next Review:** 2026-11-16  
**Issued under:** Lyra/Echo Governance Framework v1.0  

## 1. Purpose and Scope
1.1 Establish authentication, authorization, model isolation, and memory-access segmentation controls.  
1.2 Applies to all models, agents, prompts, tools, services, memory systems, and sensor-connected nodes within Lyra Echo.

---

# 2. Policy

## 2.1 Network & System Access
- All endpoints remain local-only; no public exposure.  
- Default-deny firewall enforced across all nodes.  
- Administrative access requires MFA and SSH key-based authentication.  
- Password logins remain disabled.  
- mTLS is required for API↔edge communication when implemented.

---

# 3. Model Access Control

## 3.1 Model Sandboxing
All models (LLM, STT, TTS, vision, embedding models) must operate within isolated runtime contexts.  
A model may only access:

- its own runtime memory,  
- inputs explicitly provided by the gateway,  
- outputs from designated tools,  
- approved memory segments.

No model may directly access system files, raw logs, sensor feeds, or other models’ intermediate states.

## 3.2 Tool Permission Boundaries
Tools must define:

- explicit scopes  
- rate limits  
- data-access boundaries  
- logging requirements  

Models and agents may not invoke unapproved tools or escalate privileges.

## 3.3 Cross-Model Data Flow Restrictions
Models may not exchange:

- raw reasoning traces  
- internal embeddings  
- hidden states  
- context windows  

Transfers occur only through the gateway’s validated and sanitized request/response layer.

---

# 4. Memory Access Control

## 4.1 Memory Segmentation
The memory system is divided into:

- **Short-Term Buffer**  
- **Long-Term Memory**  
- **Pinned Knowledge**  
- **System Operational Memory (metadata)**  

Models may only read from or write to memory segments explicitly permitted for their role.

## 4.2 Write Privileges
Long-term memory writes require:

- explicit user instruction (“remember this”), or  
- gateway confirmation for allowed domains (preferences, projects, household facts).  

Models cannot:

- write raw conversational logs  
- generate unverifiable memories  
- store emotional or psychological inferences  
- auto-create new memory categories  

## 4.3 Read Privileges
Models may only read:

- approved memory slices relevant to the current task  
- sanitized summaries  
- high-level preferences  
- factual household data  

They may not read:

- private pinned data belonging to other users  
- sensitive data categories  
- sensor-derived raw logs  

Access is mediated exclusively by the gateway.

## 4.4 Memory Integrity & Audit
All writes must:

- be validated by the gateway  
- follow the consent and abstraction rules defined in the Constitution  
- generate an auditable event stored in `/entries/memory/` when appropriate.

Unauthorized writes or reads constitute a security and governance incident.

---

# 5. Implementation & Enforcement

## 5.1 Security Reviewer Responsibilities
- Verify memory-access boundaries on each release.  
- Confirm that model isolation and tool scopes remain correct.  
- Ensure gateway validation is functioning and logged.

## 5.2 Maintainer Responsibilities
- Review access tokens, scopes, and privilege boundaries.  
- Validate model sandboxing in container runtime.  
- Ensure no model or agent bypasses the gateway.

---

# 6. Review Cadence

## 6.1 Semi-Annual Access Review
Includes:

- token rotation  
- SSH/MFA verification  
- model privilege checks  
- memory-access audits  

## 6.2 Annual Governance Review
- Reassesses memory categories  
- Updates sanctioned model list  
- Validates compliance with the AI Constitution

