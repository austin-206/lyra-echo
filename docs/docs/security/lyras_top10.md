---
title: "OWASP LLM Top 10 for the Lyra System"
summary: "A mapping of the OWASP LLM Top 10 risks to the Lyra household intelligence system, including risk definitions compatible with the Lyra Risk Simulator."
description: "This document aligns the OWASP LLM Top 10 with Lyra’s architecture, treating Lyra as an early instance of a broader class of household intelligence systems and mapping each category into concrete risk objects for quantitative analysis, governance, and mitigation."
tags:
  - governance
  - risk
  - owasp
  - llm
  - security
  - lyra
---

# OWASP LLM Top 10 for the Lyra System 

## 1. Purpose and Scope

This document maps the <a href="https://genai.owasp.org/llm-top-10/" target="_blank">OWASP LLM Top 10</a> risks onto the Lyra/Echo ecosystem using Lyra’s risk framework. The goal is to examine the inherent risks of near-future household intelligence systems through the same security lens used to identify and characterize risks in enterprise LLM deployments today.

The focus is on the full Lyra stack as a household intelligence system.

Lyra as designed is a local, self-hosted assistant with multiple external data tools, internal knowledge and RAG memory, image/audio/video perception, scheduling and automation authority, a local API graph, and a long-running persistent identity.

Although this document focuses on Lyra/Echo, its architecture reflects the same direction major platform companies are moving. Apple’s shift toward on-device multimodal models, Amazon’s agentic Alexa rebuild, Google’s ASTRA and Home AI experiments, Samsung’s AI hub appliances, and NVIDIA’s local agent frameworks all point to an emerging class of household systems that combine local inference, sensor input, persistent context, and tool-based action. The implementations differ, but the trajectory is consistent: once an assistant can draw from multiple data sources, maintain continuity of memory, interpret its surroundings, and carry out multi-step tasks, it stops functioning like a simple consumer gadget. Lyra is an early, fully observable example of this type of system, and examining its risk surface now offers a practical preview of the challenges these devices will bring as they mature into mainstream products.

It is a system that has multiple external tool chains, performs tasks end-to-end, has real-world information access (maps, flights, traffic, weather), and has access to household data from its own database as well as calendars and sensor input. It manages long-term memory, can author or modify configuration files, has STT/TTS in a closed loop, has face recognition and presence detection, and detects and responds to multiple household users.

In this configuration, Lyra interacts with systems, not just prompts. The OWASP categories are treated as system risks in addition to risks from model behaviors.

Each OWASP item below includes quantitative risk characteristics and a risk object definition compatible with the Lyra Risk Simulator.

## 2. <a href="https://genai.owasp.org/llmrisk/llm012025-prompt-injection/" target="_blank">LLM01 – Prompt Injection</a>

### 2.1 Context in the Lyra System

With multiple tools available, prompt injection is no longer just jailbreaking the chat. It can cause cross-tool manipulation, including incorrect flight lookup, wrong navigation advice, misleading weather output, incorrect reminders, schedules being modified improperly, unintended home-automation triggers, or a misconfiguration of Lyra’s own settings or local services. The primary concern is task-level harm: the user acts on incorrect outputs that were produced under adversarial or simply malformed input.

For Lyra, prompt injection does not originate solely from interactive conversation. Because she retrieves external data, consumes structured responses from APIs, reads documents stored in RAG memory, and eventually processes visual input, instructions can enter the system through channels that are not obviously conversational. A malformed API field, a crafted document, hidden text within an uploaded file, or even certain cues presented through images can shape her behavior. These forms of indirect prompt injection are especially relevant in a system that performs multi-step tasks. A single deceptive or misleading data point can propagate across tools without appearing malicious, producing output that seems reasonable until its effects accumulate.

### 2.2 Risk Characteristics

**Impact (I)**  
The primary risk is task error impact: misguidance without verification. This includes time lost from wrong travel advice or missed connections, missed appointments due to incorrect reminders, misconfigured home automations, or an incorrect configuration applied to any device or service requiring rework. The cumulative effect is a degradation of trust in Lyra as a household assistant. Units may be modeled in hours of rework converted to cost, plus any direct financial loss.

**Probability (P)**  
The annual probability reflects how often a user, guest, external signal, or background process triggers a prompt injection or malformed query, causing Lyra to respond with plausible but incorrect guidance that the user acts upon before detecting the error. As Lyra gains more tools, access surfaces, and authority, the likelihood of indirect prompt injection grows even in the absence of an adversary. The most notable characteristic of this category is that many failures resemble natural system drift as opposed to deliberate manipulation, making them harder to detect.

### 2.3 Risk Object Definition

```text
ID: LLM01
Title: Prompt Injection Impacting Task Execution
Description: A user instruction or external input bypasses safety context, producing misleading output that results in harmful action before detection. Includes incorrect advice for travel, schedules, automations, or system configurations.
Impact Definition: Total cost of following incorrect advice, including rework time, operational delays, and direct financial loss.
Probability Definition: Annual chance that a harmful, tool-influencing answer is acted upon before detecting the error.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Gateway safety filters
  - Output reasonableness checks
  - RAG grounding
  - Persona and instruction hardening
Residual Notes:
  - The risk grows with the number and power of tools exposed and is amplified by indirect prompt channels.
```

---

## 3. <a href="https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/" target="_blank">LLM02 – Insecure Handling of Sensitive Information</a>

### 3.1 Context in the Lyra System

As Lyra matures, it will hold an increasing volume of household data: schedules, notes, device state, presence information, preferences, and long-term conversation history. Some of this information is personal by nature; some becomes sensitive because of how it can be combined (patterns of absence, health-related conversations, routine behaviors). OWASP’s sensitive information category for LLMs focuses on exposures that happen through model output, logs, or integration points.

In the Lyra system, disclosure risk spans multiple layers. Lyra can reveal details directly in conversation, Vega can leak internal state through logs or traces, and integrations like calendar access or home automation can surface information about routines and locations. The risk is amplified by RAG: once a piece of information is embedded into memory, it becomes easier to retrieve in unexpected contexts and much harder to fully remove.

### 3.2 Risk Characteristics

**Impact (I)**  
Impact is measured in terms of privacy and trust. A single disclosure event might reveal private details about household routines, health-related discussions, or internal notes to the wrong person or in the wrong context. In a home environment this is primarily a confidentiality and dignity and trust issue, but it still has a real cost in terms of how comfortable household members are using Lyra and what they are willing to share with her.

**Probability (P)**  
Probability increases with the number of users, the depth of memory, and the number of integrations that expose sensitive state (calendar, reminders, presence data, cameras). Most disclosure incidents are not adversarial; they are mis-scoped responses or unclear access boundaries. As Lyra’s personalization improves, the likelihood that information intended for one person appears, even partially, in a conversation with another increases unless explicit segmentation is enforced.

### 3.3 Risk Object Definition

```text
ID: LLM02
Title: Accidental Disclosure of Household Private Information
Description: Lyra exposes sensitive household information (routines, notes, sensor-derived inferences, or memory content) to the wrong user, context, or channel.
Impact Definition: Cost in terms of privacy harm, trust damage, and any corrective steps taken to change usage patterns, purge memory, or adjust configuration.
Probability Definition: Annual chance that a mis-scoped output reveals information to someone who should not receive it.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Identity-aware routing and per-user context separation
  - Explicit privacy discipline in persona and governance rules
  - Memory compartmentalization by user and topic
  - Log sanitation and access controls
Residual Notes:
  - Risk rises as multi-user personalization and memory depth increase.
```

---

## 4. <a href="https://genai.owasp.org/llmrisk/llm032025-supply-chain/" target="_blank">LLM03 – Supply Chain Vulnerabilities</a>

### 4.1 Context in the Lyra System

Lyra and Vega are built on a layered stack of components: base operating systems, container images, Python libraries, model weights, LoRA adapters, perception frameworks, and a growing set of external SDKs for maps, weather, calendars, and other tools. Each of these is an entry point into the supply chain. A compromised wheel on PyPI, a tampered container image, a malicious LoRA adapter, or a backdoored pre-trained model can all alter behavior in ways that are hard to detect once deployed.

OWASP treats supply-chain risk for LLMs as extending beyond traditional package dependencies to include pre-trained models, fine-tuning artefacts, adapters, and even on-device distribution channels. For Lyra, this means that any upstream artefact that shapes reasoning, retrieval, or tool access must be treated as a potential source of compromise. This risk is conceptually separate from data/model poisoning (LLM04): here the focus is not on what Lyra learns, but on what she is built from.

### 4.2 Risk Characteristics

**Impact (I)**  
A supply-chain compromise can lead to arbitrary code execution within Lyra or Vega, silent backdoors in the model, covert exfiltration of embeddings or logs, or manipulated downstream behavior such as biased outputs or altered tool calls. Recovery usually requires a full rebuild of the environment, re-verification of model and library integrity, inspection or recreation of vector stores, and review of any automations, configs, or decisions that may have been influenced. In a quantitative model this sits in the highest impact tier.

**Probability (P)**  
Annual probability is driven by how often new components are added or updated, how many external sources are trusted, and whether artefacts are pinned, mirrored, or verified. Even with good practice, Lyra’s supply chain includes public model repositories, dependency registries, and container bases that change over time. As the system matures and more capabilities are layered on, the number of upstream touchpoints grows, slowly increasing the chance that one of them will be compromised.

### 4.3 Risk Object Definition

```text
ID: LLM03
Title: Malicious or Compromised Component Introduced via Supply Chain
Description: A model, package, container, adapter, or other upstream component is compromised, introducing malicious behavior, backdoors, or remote code execution into the Lyra ecosystem.
Impact Definition: Cost of rebuilding and revalidating Lyra and Vega, including model and library integrity checks, RAG/vector store inspection or reconstruction, and remediation of any incorrect actions or corrupted state.
Probability Definition: Annual chance of deploying at least one compromised artefact during normal updates or feature work.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Pin versions and verify checksums or signatures for critical artefacts
  - Use curated internal mirrors or caches for trusted models and packages
  - Test model and container updates in isolated environments before promotion
  - Apply network and privilege restrictions around components that load external code
  - Maintain an inventory (SBOM/ML-BOM) for models, libraries, and adapters
Residual Notes:
  - Low-frequency but high-impact; a leading contributor to catastrophic-tail risk.
```

---

## 5. <a href="https://genai.owasp.org/llmrisk/llm042025-data-and-model-poisoning/" target="_blank">LLM04 – Data and Model Poisoning</a>

### 5.1 Context in the Lyra System

Where LLM03 focuses on what Lyra is built from, LLM04 focuses on what she learns from. Data and model poisoning arise when pre-training data, fine tuning datasets, or embedding inputs are manipulated or allowed to drift in ways that undermine integrity. In Lyra’s case, the most relevant surface is not foundation model training but RAG ingestion, long term memory, and any future fine tuning or adapter training based on household data.

Lyra ingests documents, notes, configuration files, transcripts, and other artefacts into Qdrant and related stores. If these sources are stale, incorrect, adversarially crafted, or simply misclassified, they can embed persistent errors in her behavior. This includes subtle shifts in how she prioritizes sources, repeated exposure to skewed content, or the introduction of backdoor phrases that cause non obvious behaviors.
 
### 5.2 Risk Characteristics

**Impact (I)**  
The impact of poisoning is primarily an integrity problem. Lyra does not “break”; she becomes confidently wrong in specific regions of her knowledge or behavior. This can lead to bad or incorrect advice, misconfigured services, inappropriate prioritization of tasks, or biased responses. Recovery involves diagnosing which content is contaminated, pruning or rebuilding indexes, and sometimes discarding whole segments of memory. Individually, incidents may be moderate impact, but in aggregate they can dominate the long term cost profile.

**Probability (P)**  
Annual probability grows with the volume and automation of ingestion. The more documents, notes, and logs are automatically incorporated, the more opportunities there are for low-quality or adversarial content to slip in. Even without attackers, ordinary lifecycle issues such as outdated procedures, partially migrated configs, and old project documents can act as accidental poison. In a mature Lyra, this becomes a recurring, medium probability event rather than a rare one.

### 5.3 Risk Object Definition

```text
ID: LLM04
Title: RAG and Model Behavior Poisoned by Bad or Manipulated Data
Description: Incorrect, stale, biased, or adversarial content is ingested into RAG or used for tuning, leading to persistent distortions in Lyra’s behavior or reasoning.
Impact Definition: Cost of time lost and corrective work due to bad guidance, plus the effort to diagnose, clean, and rebuild affected memories and indexes.
Probability Definition: Annual chance that ingestion or tuning introduces harmful distortions that materially affect Lyra’s outputs.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Manual or semi-automated gating for ingestion sources
  - Separation of “trusted”, “experimental”, and “external” corpora
  - Periodic review and pruning of outdated or low-quality content
  - Targeted red-teaming of RAG responses for critical domains
Residual Notes:
  - Expected to be a significant recurring contributor to ALE through many small events rather than a few large ones.
```

---

## 6. <a href="https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/" target="_blank">LLM05 – Improper Output Handling</a>

### 6.1 Context in the Lyra System

Improper output handling occurs when Lyra’s text outputs are treated as trusted instructions or rendered content without sufficient validation or transformation. In Lyra’s environment this applies wherever model output is passed into another system: HTML rendered in the MagicMirror UI, JSON or YAML written to configuration files, shell commands assembled from responses, or messages sent to other services.

OWASP treats this as distinct from overreliance on LLM answers. The vulnerability is not merely that Lyra might be wrong, but that her outputs might be interpreted as code, markup, or control structures by downstream components. In a home setting, that can translate into local XSS in the mirror interface, misconfigured automation rules, or scripts executed with higher privileges than the original user intended.

### 6.2 Risk Characteristics

**Impact (I)**  
Impact ranges from nuisance-level UI corruption (broken layouts, stuck widgets) to more serious misconfigurations or, in the worst case, local code execution if responses are ever piped into shells or interpreters without strict framing. Because Lyra lives inside a constrained home environment, the primary concern is configuration drift and service reliability.

**Probability (P)**  
Probability depends on design discipline. If all rich output is either escaped, sandboxed, or stored as data rather than executed, the residual risk is low. If, however, Lyra is granted the ability to generate “ready-to-run” snippets like scripts, HTML fragments, or rule definitions that are fed directly into other systems, the odds of a problematic output being accepted increase substantially, especially under prompt injection.

### 6.3 Risk Object Definition

```text
ID: LLM05
Title: Unsafe Interpretation of Lyra’s Outputs by Downstream Systems
Description: Lyra’s generated text is treated as executable code, markup, or configuration without adequate validation, leading to UI issues, misconfigurations, or local code execution.
Impact Definition: Cost of correcting misconfigurations, restoring broken UI or automations, and recovering from any unintended code execution or privilege elevation.
Probability Definition: Annual chance that improperly handled output reaches a component that interprets it unsafely.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Treat all model output as untrusted input at integration boundaries
  - Escape or encode output before rendering in HTML or other contexts
  - Require explicit human review before applying generated configs or scripts
  - Keep Lyra’s execution privileges narrower than the user’s administrative rights
Residual Notes:
  - Becomes more important as Lyra is allowed to generate structured artefacts rather than plain text.
```

---

## 7. <a href="https://genai.owasp.org/llmrisk/llm062025-excessive-agency/" target="_blank">LLM06 – Excessive Agency</a>

### 7.1 Context in the Lyra System

Lyra is designed to move gradually from just answering questions toward getting things done. That means calling tools, updating calendars, modifying automations, writing files, and, eventually, coordinating multi-step tasks without constant supervision. Excessive agency arises when the combination of functionality, permissions, and autonomy granted to Lyra allows damaging actions to occur in response to ambiguous, incorrect, or manipulated outputs.

OWASP highlights three core drivers: too much functionality, too much permission, and too much autonomy. All three are relevant here. A Lyra that can both modify Home Assistant automations and edit her own configuration, for example, has a larger destructive surface than one limited to suggestions and simulations. The risk is not that Lyra is “malicious,” but that normal failure modes like hallucinations, prompt injection, and poisoned memory are connected directly to actuators.

### 7.2 Risk Characteristics

**Impact (I)**  
Impact is defined by what Lyra is allowed to do without human confirmation. Wrong automations, calendar entries, reminders, or configuration edits can cause persistent annoyance, time loss, or in extreme cases safety concerns if critical devices are ever attached. The more direct the path from model output to action, the higher the potential impact. In Lyra’s current design the focus is on non-safety-critical domains, but the pattern is the same.

**Probability (P)**  
Probability increases with the breadth and depth of tool integration. Every new thing Lyra can do that bypasses explicit approval nudges this risk upward. Agentic loops, where Lyra calls herself or chains tools based on prior outputs, further increase the chance that a single misinterpretation cascades into larger effects.

### 7.3 Risk Object Definition

```text
ID: LLM06
Title: Harmful Outcomes from Over-Privileged or Over-Autonomous Behavior
Description: Lyra uses available tools or permissions in a way that causes unintended real-world changes, due to ambiguous prompts, hallucinations, prompt injection, or poisoned memory.
Impact Definition: Cost of undoing or compensating for harmful actions, including time spent repairing automations, correcting schedules, restoring files, or addressing any safety-relevant side effects.
Probability Definition: Annual chance that Lyra’s available actions and autonomy combine to produce a materially harmful outcome without timely human interception.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Constrain Lyra’s action surface to low-risk domains by default
  - Require confirmation for higher-impact operations or bulk changes
  - Implement policy layers that describe which tools can be used in which contexts
  - Limit self-modification and configuration editing capabilities
Residual Notes:
  - Closely coupled to LLM01, LLM03, and LLM04; agency amplifies the impact of other failures.
```

---

## 8. <a href="https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/" target="_blank">LLM07 – System Prompt Leakage</a>

### 8.1 Context in the Lyra System

The system prompt in Lyra encodes persona, safety constraints, tool use patterns, and references to governance rules and memory structures. OWASP notes that system prompts sometimes also contain secrets, connection details, or role descriptions that act as de facto access control. In Lyra’s case, explicit secrets are handled elsewhere, but the prompt still exposes how decisions are made and how different pieces of context are weighted.

A leaked prompt is not primarily a confidentiality problem; it is an enablement problem. With access to the system prompt, an attacker or curious user can better shape prompts, craft injections, or model Lyra’s behavior for targeted manipulation. The prompt effectively becomes documentation for how to work around protections if it is treated as a security boundary.

### 8.2 Risk Characteristics

**Impact (I)**  
On its own, prompt leakage does not usually cause direct harm inside a single household system, assuming no hard secrets are embedded. The impact comes from what it enables: more effective prompt injection, more targeted poisoning, and easier reproduction of Lyra’s behavior elsewhere. In a home context this is a secondary or supporting risk and not a primary loss driver.

**Probability (P)**  
Probability grows as more tooling, logging, and multi-user access accumulate. Debug views, verbose traces, or poorly scoped “explain your instructions” capabilities can all expose pieces of the system prompt over time. Any feature that encourages Lyra to talk about her own configuration increases the likelihood of partial leakage.

### 8.3 Risk Object Definition

```text
ID: LLM07
Title: Exposure of System Prompt and Governance Instructions
Description: The contents or structure of Lyra’s system prompt are disclosed, enabling more targeted manipulation but not necessarily exposing direct secrets.
Impact Definition: Cost associated with revising prompts, updating governance instructions, and addressing any downstream effects from more effective attacks or jailbreak attempts.
Probability Definition: Annual chance that logs, debugging tools, or conversational behaviors reveal substantive portions of the system prompt.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Avoid placing credentials or other true secrets in prompts
  - Limit user-facing introspection into full prompt content
  - Separate governance logic into configuration where possible
  - Sanitize logs and traces that might capture prompt internals
Residual Notes:
  - Primarily a multiplier for other risks (LLM01, LLM06) rather than a standalone driver of loss.
```

---

## 9. <a href="https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/" target="_blank">LLM08 – Vector and Embedding Weaknesses</a>

### 9.1 Context in the Lyra System

Vectors and embeddings are how Lyra turns documents, notes, and other artefacts into something she can search semantically. OWASP highlights that weaknesses in how vectors are generated, stored, and accessed can lead to leakage of sensitive information, adversarial retrieval, and cross-tenant issues. For Lyra, the concern is more localized but still real: Qdrant and related stores hold encapsulated representations of household routines, preferences, and histories.

If access controls around the vector store are weak, an attacker who reaches it does not need raw documents; they can extract or manipulate embeddings directly. Even without an external attacker, poorly separated collections, adversarially crafted chunks, or inconsistent embedding strategies can cause Lyra to pull the wrong material for a given query, systematically biasing her answers.

### 9.2 Risk Characteristics

**Impact (I)**  
Impact includes unintentional disclosure of sensitive household content via retrieval, systematic misretrieval that degrades Lyra’s usefulness, and long debugging cycles as you try to determine whether the problem lies in the model, the embeddings, or the documents themselves. In more severe cases, an attacker with direct access to Qdrant could attempt partial inversion of embeddings to reconstruct approximate original text.

**Probability (P)**  
Probability increases with scale and heterogeneity. As Lyra’s memory grows, collections multiply, and more types of content are embedded, the odds of collisions, accidental cross-collection access, or misconfigured ACLs grow. Automation that ingests content without strong tagging or partitioning further increases the chance of retrieval errors.

### 9.3 Risk Object Definition

```text
ID: LLM08
Title: Embedding Store Weaknesses and Misretrieval
Description: Weaknesses in how embeddings are generated, stored, or accessed lead to privacy leakage, systematic retrieval errors, or exploitation of the vector store itself.
Impact Definition: Cost associated with misinformed decisions, privacy exposure through retrieval, and time spent diagnosing and repairing embedding or collection issues.
Probability Definition: Annual chance that embedding- or retrieval-related issues materially affect Lyra’s behavior or leak sensitive content.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Partition embeddings into clearly separated collections with well-defined access
  - Apply authentication and authorization around Qdrant and related services
  - Periodically sample and test retrieval behavior for drift or bias
  - Consider re-embedding or migrating collections when major changes are made
Residual Notes:
  - Closely related to LLM04; the distinction is between poisoned content and structural weaknesses in the embedding layer.
```

---

## 10. <a href="https://genai.owasp.org/llmrisk/llm092025-misinformation/" target="_blank">LLM09 – Misinformation and Overreliance</a>

### 10.1 Context in the Lyra System

Misinformation occurs when Lyra produces answers that are wrong but sound plausible. OWASP notes hallucination, bias, and incomplete information as core drivers. In Lyra’s case, misinformation spans both model level behavior and tool use. Incorrect interpretation of sensor status, misreading of a document in memory, or misusing an external API can all produce confident but wrong guidance.

Overreliance is the multiplier. When Lyra is treated as an authority and not a fallible tool, errors propagate into real decisions involving departure times, troubleshooting steps, configuration choices, or interpretations of household events. A home assistant designed to feel helpful and confident will naturally tend toward this failure mode unless counterbalanced.

### 10.2 Risk Characteristics

**Impact (I)**  
Most individual misinformation events are low to moderate impact: wasted time, wrong routes, extra troubleshooting steps, or minor scheduling issues. Some can be more serious if they touch health, safety, or financial decisions, which Lyra is explicitly not intended to own. Over time, the aggregate effect is a friction cost and, if unacknowledged, erosion of trust.

**Probability (P)**  
Probability is effectively continuous. Even with good models, careful prompting, and RAG grounding, hallucinations and misinterpretations will continue to occur. The real variable is how often these errors intersect with important decisions without verification. As Lyra is integrated into more workflows, the opportunity for such intersections increases.

### 10.3 Risk Object Definition

```text
ID: LLM09
Title: Acting on False but Plausible Guidance
Description: Lyra provides incorrect information or advice that appears credible enough that the user acts on it, leading to time loss, misconfiguration, or other unwanted outcomes.
Impact Definition: Cost of time lost, rework, and secondary impacts when incorrect outputs are followed, including any downstream corrections to systems or schedules.
Probability Definition: Annual chance that a materially consequential decision is made based on unverified, incorrect output.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Use RAG and external tools to ground answers in observable data where possible
  - Encourage designs that surface uncertainty instead of feigned confidence
  - Require explicit confirmation for higher-stakes decisions or actions
  - Provide easy ways to cross-check or “audit” the basis of a given answer
Residual Notes:
  - A steady background contributor to ALE: low impact per event, high frequency over time.
```

---

## 11. <a href="https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/" target="_blank">LLM10 – Unbounded Consumption</a>

### 11.1 Context in the Lyra System

Unbounded consumption describes situations where Lyra is allowed to consume disproportionate compute, memory, or bandwidth relative to what the household environment can comfortably support. OWASP frames this largely in terms of denial of service and economic exhaustion in cloud settings. In Lyra’s case the focus shifts to local resource exhaustion in the form of GPU saturation, CPU spikes, RAM pressure, log growth, and network congestion across Pi nodes and services.

Because Lyra is multi modal and tool enabled, there are many avenues for runaway consumption, including long-context conversations, repeated STT calls in noisy conditions, vision loops from the mirror camera, excessive RAG queries, or misconfigured automations that trigger frequent evaluations. Even without an attacker, a poorly designed interaction pattern can starve other services.

### 11.2 Risk Characteristics

**Impact (I)**  
Impact is typically service degradation as opposed to permanent damage. This comes in the form of slowed or stalled responses, container crashes, watchdog restarts, or unresponsiveness in other household services sharing the same hardware. In extreme cases, continuous saturation could affect hardware thermals or accelerate wear, but the main cost is downtime and recovery effort.

**Probability (P)**  
Probability rises with complexity and concurrency. The more always-on modalities Lyra has, and the more she is woven into background automations, the higher the chance that some interaction pattern will push the system into sustained high load. Adversarial triggering is possible, but accidental overload through enthusiastic usage or design mistakes is more likely.

### 11.3 Risk Object Definition

```text
ID: LLM10
Title: Resource Exhaustion from Unbounded or Mismanaged Usage
Description: Lyra or her surrounding services consume excessive compute, memory, storage, or bandwidth, leading to degraded performance or outages.
Impact Definition: Cost associated with downtime, degraded experience, manual recovery, and any lost work or missed automations attributable to resource exhaustion.
Probability Definition: Annual chance that usage patterns, configuration, or adversarial activity drive Lyra into sustained resource overconsumption.
Inputs Needed:
    i_min:
    i_mode:
    i_max:
    p_alpha:
    p_beta:
Mitigations:
  - Apply request, token, and concurrency limits at the gateway and model layers
  - Use timeouts and circuit breakers for tool calls and long-running tasks
  - Monitor GPU, CPU, memory, and log growth with simple thresholds and alerts
  - Separate critical household services from Lyra’s heaviest workloads where possible
Residual Notes:
  - Often manifests as a nuisance and reliability issue, but can mask or amplify other risks if not monitored.
```

---

## 12. Risk Landscape and Clustering

In Lyra’s context, the OWASP categories cluster into a few distinct shapes of risk.

High impact, low frequency risks show up in supply chain compromise and excessive authority. A compromised model, library, or container (LLM03), or a tool layer that allows Lyra to take high impact actions without adequate policy or confirmation (LLM06), can both lead to rare but severe events that require rebuilding the system and carefully reviewing past actions. Vector and embedding weaknesses (LLM08), when combined with large scale ingestion (LLM04), can also produce integrity failures that are difficult to detect and expensive to unwind.

Medium impact, medium frequency risks live mostly in prompt injection (LLM01), sensitive disclosure (LLM02), improper output handling (LLM05), and misinformation (LLM09). These are the categories that, while individually less dramatic, can accumulate into a meaningful portion of annual loss through repeated smaller incidents. They are also the risks most directly shaped by architectural choices around context boundaries, memory discipline, UI design, and how much autonomy Lyra is granted for everyday tasks.

Low impact, high frequency risks are dominated by unbounded or poorly managed consumption (LLM10) and, in Lyra’s configuration, most instances of prompt leakage (LLM07). These risks are often experienced as reliability issues or nuisances in the form of slow responses, occasional outages, or the need to restart services, unless they combine with other categories to become more serious.

## 13. Expected Drivers of Annual Loss

From a quantitative perspective, a mature Lyra installation is likely to see annual loss dominated by integrity drift and background friction and not single catastrophes.

RAG and vector DB related issues (LLM04 and LLM08) are strong candidates for top recurring contributors. Small distortions in memory or retrieval can produce a steady stream of minor misguidance and rework, especially as more content is ingested automatically. Misinformation and overreliance (LLM09) add a constant background cost, as incorrect but plausible answers will inevitably shape some decisions, even in a cautious household.

Supply chain compromise (LLM03) remains a long tail threat: unlikely in any given year with disciplined practices, but extremely costly if it occurs, because it calls the entire environment’s trustworthiness into question. Excessive agency (LLM06) is more tunable: its contribution to loss depends directly on how much real-world authority Lyra is granted. With strict scoping and confirmation, it can be kept low; with broad permissions, it can move toward the catastrophic end of the spectrum.

The practical conclusion is that governance for Lyra and systems like it should focus first on controlling what the system is allowed to change, and second on maintaining the integrity of what it remembers. The classic confidentiality. A focused view of security is still relevant, but in a household intelligence system, the primary enemies are drift and overreach. With the gradual accumulation of slightly wrong information, and the overextension of a system’s authority into domains where errors are costly to repair.

The architecture Lyra/Echo uses is not unique. The same combination of local reasoning, memory, perception, and tool use is appearing in early commercial prototypes, and it will define the next generation of home technology. As these devices mature and begin taking on more responsibility in everyday environments, the risks outlined here will move from theoretical to routine. Understanding them now, in a system whose behavior can be observed and shaped directly, offers a way to prepare for what will eventually become common. 
