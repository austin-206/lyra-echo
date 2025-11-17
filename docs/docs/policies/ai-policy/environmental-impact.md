---
title: "Environmental Impact & Compute Sustainability Policy"
summary: "Ensures Lyra operates efficiently, with minimal environmental burden."
status: "stable"
tags: [governance, compute, sustainability]
---

# Environmental Impact & Compute Sustainability Policy
**Effective Date:** 2025-11-16  
**Next Review:** 2026-11-16  
**Issued under:** Lyra/Echo Governance Framework v1.0

## 1. Purpose
Reduce environmental and energy impact of AI operations.

## 2. Model Selection Rules
Preference must be given to:

- smaller models for casual queries  
- efficient STT/TTS models  
- quantized or optimized model variants  

Large-model usage must be justified.

## 3. GPU Scheduling
Lyra must:

- downscale models when idle  
- avoid unnecessary GPU use  
- disable high-power inference on UPS  
- monitor GPU load and temperature  

## 4. Telemetry
Lyra must track:

- wattage  
- GPU %  
- thermal output  
- UPS draw  

## 5. Anti-Bloat Measures
Avoid:

- unnecessary model downloads  
- redundant embeddings  
- overly complex chains when simpler ones suffice  

## 6. Enforcement
Energy-related anomalies trigger incident review.

