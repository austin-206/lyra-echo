# Quantified Risk Management

## Purpose
Establish a measurable, data-driven approach to evaluating and prioritizing risk across the Lyra/Echo ecosystem. This method follows the principles of replacing ordinal ratings with quantitative estimation and simulation.

---

## Methodology Overview

### 1. Measurement Philosophy
Every uncertainty that affects a decision can be measured; not perfectly, but sufficiently to reduce uncertainty. Risk management focuses on the value of information gained through better estimates, not on subjective scores.

Key points:

- Replace “High/Medium/Low” with calibrated probability ranges.

- Express impact in measurable units: downtime hours, replacement cost, or amount of data lost.

- Use 90% confidence intervals for uncertain quantities.

- Compute expected loss or use Monte Carlo simulation to model combined outcomes.

### 2. Quantitative Model
For each identified risk:

\[
\text{Expected Loss (E)} = P(\text{Event}) \times I(\text{Impact})
\]

Where P and I are random variables drawn from estimated distributions.

**Impact (I):** range of cost or time consequence.  
**Probability (P):** chance per time period (e.g., per year).  
**Exposure (E):** expected annualized loss (expectation of P × I).

---

## Application to Lyra/Echo

### Quantification Targets
| Category | Measured Unit | Example Metric |
|:--|:--|:--|
| Power Continuity | Minutes of downtime | UPS runtime, MTTR |
| Data Integrity | \$ per data loss event | Restore cost, time lost |
| Security Events | Probability per year | Incident frequency |
| Hardware Failure | Replacement cost USD | Component cost × probability |
| Privacy Breach | Severity index (0–1) | Exposure likelihood |
| Orchestration Reliability | % of turns failed | Performance telemetry baseline |

---

## Example Risk Register

| ID | Risk | Impact Range (USD) | Likelihood (per year) | Expected Loss (E = P × I) | Mitigation | Residual Exposure |
|:--|:--|:--|:--|:--|:--|:--|
| R‑001 | Power loss during processing | 150 – 500 | 0.20 | 65 | UPS + auto‑shutdown | 10 |
| R‑002 | Disk corruption of vector DB | 500 – 2 000 | 0.05 | 75 | Nightly NAS backup | 15 |
| R‑003 | MQTT broker failure | 100 – 300 | 0.25 | 50 | Health checks + redundancy | 10 |
| R‑004 | Unauthorized access to API | 200 – 1 000 | 0.02 | 12 | VLAN isolation + auth tokens | 2 |
| R‑005 | Sensor misread causing automation error | 50 – 150 | 0.30 | 30 | Node‑RED validation flow | 5 |
| R‑006 | GPU thermal throttling | 100 – 400 | 0.10 | 25 | DCGM monitor + fan curve | 5 |

All values represent 90% confidence interval estimates.  
Residual exposure represents post‑control expected loss.

---

## Monte Carlo Simulation

A Monte Carlo model estimates the distribution of total annual loss across many possible outcomes.

1. Define distributions for impact and probability for each risk.  
   Example:  
   ```python
   Impact_R001 ~ Triangular(150, 300, 500)
   Prob_R001   ~ Beta(α=2, β=8)  # mean 0.2
   ```
2. Simulate 10 000 iterations.  
3. Sum losses per iteration.  
4. Plot distribution and compute expected annual loss (ALE).

Example output:
- Mean ALE ≈ \$260 per year  
- 95th percentile ≈ \$640  
Focus mitigations on the few risks contributing ≥ 20% of ALE.

See the Risk Simulator to calculate risk range.

---

## Decision Criteria

| Rule | Condition | Action |
|:--|:--|:--|
| **Treat** | Cost of mitigation < Expected Loss | Implement control |
| **Accept** | Cost ≈ Expected Loss and impact tolerable | Monitor only |
| **Transfer** | Insurance or contractual coverage available | Optional |
| **Avoid** | Unacceptable impact > tolerance | Redesign system |

---

## Calibration and Updating

| Step | Description |
|:--|:--|
| **Calibration training** | Use Hubbard’s 10‑20‑30 method to align confidence intervals with reality. |
| **Data feedback** | Replace estimates with observed metrics (e.g., MTBF, incident frequency). |
| **Quarterly review** | Re‑estimate ranges and update probabilities. |
| **Change trigger** | Major config or policy change → immediate re‑assessment. |

---

## Integration with Governance

| Source | Output | Dependency |
|:--|:--|:--|
| Access Control Policy | Control effectiveness ratings | Residual risk updates |
| Change Management | Trigger re‑evaluation | Event log for risk register |
| Incident Response | Empirical probability data | Updated P values |
| Security Assessments | Compliance status | Risk acceptance threshold |

---

## Tools and Formats
- **Risk Register:** `risk-register.csv` (numeric data for analysis).  
- **Simulation:** Javascript Monte Carlo simulator with randomized ranges.  
- **Visualization:** Histogram of ALE and contribution chart by risk ID.  
- **Integration:** Metrics exported to Prometheus (`risk_expected_loss`, `risk_residual_loss`).

---

## Example Javascript Snippet from the Monte Carlo sim
```
function simulate(risks,trials=10000){
  const totals=new Float64Array(trials);
  for(let t=0;t<trials;t++){
    let sum=0;
    for(const r of risks){
      const I=randTri(r.i_min,r.i_mode,r.i_max);
      const P=randBeta(r.p_alpha,r.p_beta);
      sum+=I*P;
    }
    totals[t]=sum;
  }
  totals.sort();
  const mean=totals.reduce((a,b)=>a+b,0)/trials;
  const p95=totals[Math.floor(0.95*(trials-1))];
  return {totals,mean,p95};
}

function makeBins(arr,bins=24){
  const min=arr[0], max=arr[arr.length-1];
  const width=(max-min)/(bins||1)||1;
  const edges=Array.from({length:bins},(_,i)=>min+i*width);
  const counts=new Array(bins).fill(0);
  for(const v of arr){ let idx=Math.min(bins-1,Math.floor((v-min)/width)); counts[idx]++; }
  return {edges,counts};
}
function findBinIndex(value,edges){
  if(!edges||edges.length<2) return 0;
  const width=(edges[edges.length-1]-edges[0])/(edges.length-1);
  let idx=Math.floor((value-edges[0])/width);
  return Math.max(0,Math.min(edges.length-1,idx));
}
```

---

## Reporting and Review
- Include top 5 risks by expected loss in each quarterly report.  
- Track trend lines of expected loss before and after controls.  
- Retain each revision of `risk-register.csv` under `/docs/governance/archives/`.  
- Reference change control ID from changelog.

---
## Summary
Quantitative risk management turns uncertainty into a decision making tool.

By estimating probabilities and impact ranges, Lyra/Echo prioritizes controls with the highest expected value of risk reduction:

*“Measure what matters; reduce what uncertainty you can.”*


_Last updated: 2025‑11‑11_
