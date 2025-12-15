---
title: "Prompt and Agent Policy"
summary: "Defines deterministic, constitutional, and safety-aligned rules for prompts, agents, tool use, and behavioral control."
status: "stable"
tags:
  - governance
  - policy
  - prompts
  - agents
  - alignment
---

# Prompt and Agent Policy
**Effective Date:** 2025-11-16  
**Next Review:** 2026-11-16  
**Issued under:** Lyra/Echo Governance Framework v1.0  

---

# 1. Purpose and Scope
1.1 Establish deterministic, auditable, and constitution-aligned behavior for all prompts and agents used by Lyra.  
1.2 Applies to:

- base prompts  
- system/persona layers  
- tool-enabled agents  
- planning modules  
- memory routing logic  

1.3 Ensures safe, consistent behavior across all models and tasks.

---

# 2. Definitions
## 2.1 **Agent**
A constrained, role-bound component with defined tools, budgets, objectives, and permissions.

## 2.2 **Prompt Set**
Versioned instructions specifying persona, rules, safety, tool behavior, and alignment logic.

---

# 3. Policy

## **3.1 Constitutional Inheritance**
All prompts and agents must:

- explicitly inherit from the Lyra AI Constitution  
- include core behavioral rules (uncertainty, non-manipulation, transparency)  
- avoid contradicting constitutional principles  

Persona layers may shape tone but cannot override safety or truthfulness.

---

## **3.2 Versioning Requirements**
- All prompts/agents are versioned with semantic identifiers.  
- No live editing in production is permitted.  
- Updates require a changelog entry.  

Prompt files must include YAML front matter.

---

## **3.3 Tool Permission Boundaries**
Agents must declare:

- tools allowed  
- tool budgets or rate limits  
- maximum reasoning depth  
- disallowed actions  

Unauthorized tool calls are considered AI-behavioral incidents.

---

## **3.4 Behavioral Regression Testing**
Any modification to prompts or agents requires:

- persona stability tests  
- tone checks  
- uncertainty disclosure tests  
- manipulation-prevention tests  
- hallucination sampling  
- before/after behavioral diffs  

---

## **3.5 Deterministic Execution**
Agents must:

- define explicit decision boundaries  
- avoid unbounded loops  
- avoid recursive tool invocation unless explicitly allowed  
- fail safely when uncertain  

---

## **3.6 Memory Access Boundaries**
Agents may only access memory segments authorized by:

- the gateway  
- the Constitution  
- the memory schema policy  

Direct model access to raw memory is prohibited.

---

# 4. Implementation & Enforcement

## **4.1 Maintainer Responsibilities**
- verify prompt consistency  
- review diff tests  
- enforce constitutional inheritance  

## **4.2 Content Reviewer Responsibilities**
- ensure persona and safety rules remain intact  
- review tone, neutrality, and ethical boundaries  

---

# 5. Review Cadence
- Semi-annual review  
- Mandatory review after major model release or persona changes  

---
