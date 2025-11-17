# Risk Simulator (Monte Carlo)

This tool lets you experiment with how uncertain risks combine across the system.  
Instead of assigning vague labels like “high” "medium" or “low”, it runs thousands of random trials to show a range of possible annual losses and how often they occur.

Each trial looks at two factors for every risk:

- **Impact — how bad it is when it happens.**  
  We assume you have a best-case, a worst-case, and a “most likely” value (in USD).  
  The simulator treats that as a triangular shape: most of the time it lands near your expected cost, but occasionally toward the edges.  
  > Example: if a disk failure usually costs $300 to replace but could be as low as $150 or as high as $500, enter 150 / 300 / 500.

- **Probability — how often it happens.**  
  Real events aren’t perfectly predictable; they hover around a typical frequency.  
  The simulator models that with a beta shape between 0 and 1, meaning “chance per period.”  
  The two parameters (α and β) control how spread-out or peaked that probability is.  
  > Example: if you believe a failure occurs about 1 time in 5 years, a mean of 0.2 with moderate certainty is roughly α = 2, β = 8.

It then multiplies the random impact × random probability for each risk, adds them together, and repeats this thousands of times to produce a distribution of total annual loss.

Run the simulation to see:

- the average expected annual loss,

- the 95th percentile (“bad year” scenario),

- and a bar chart of how those outcomes are distributed.

## Inputs

<table id="mc-risks">
  <thead>
    <tr>
      <th>Risk</th>
      <th>Impact Minimum</th>
      <th>Mode</th>
      <th>Maximum</th>
      <th>α</th>
      <th>β</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><input type="text" value="Disk replacement"></td>
      <td><input type="number" value="150"></td>
      <td><input type="number" value="300"></td>
      <td><input type="number" value="500"></td>
      <td><input type="number" value="2"></td>
      <td><input type="number" value="8"></td>
    </tr>
    <tr>
      <td><input type="text" value="Pi / node rebuild"></td>
      <td><input type="number" value="500"></td>
      <td><input type="number" value="900"></td>
      <td><input type="number" value="2000"></td>
      <td><input type="number" value="1.5"></td>
      <td><input type="number" value="28.5"></td>
    </tr>
    <tr>
      <td><input type="text" value="Power / reset events"></td>
      <td><input type="number" value="100"></td>
      <td><input type="number" value="200"></td>
      <td><input type="number" value="300"></td>
      <td><input type="number" value="3"></td>
      <td><input type="number" value="9"></td>
    </tr>
  </tbody>
</table>

<div class="mc-actions">
  <!-- Material-style button -->
  <button id="mc-run" class="md-button md-button--primary">Run Simulation</button>
  Trials: <input id="mc-trials" type="number" value="10000" style="width:110px;">
</div>

## Results

After each run, the simulator shows two key numbers:

- **Mean ALE (Average Annual Loss Expectancy)** —  
  This is the long-run average cost if the system behaved exactly as it does now.  
  It’s the best single summary of “how expensive normal risk is” over time.  
  A Mean ALE of $250 means that across thousands of simulated years, you’d expect to lose about $250 per year on average from the combined risks.

- **p95 ALE (95th Percentile Annual Loss)** —  
  This represents a “bad-year” scenario.  
  95 % of simulated years were cheaper than this number; only 5 % were worse.  
  If p95 = $800, it means that once in roughly 20 years you might face an $800 loss event.  
  It’s a practical upper-bound for budgeting and control planning.

The bar chart beneath the results shows how often each outcome occurred across all trials.  
A tight cluster means uncertainty is low; a wide spread suggests that your inputs are too uncertain or that a single risk dominates the total.

---

**Results** — Mean ALE: <span id="mc-mean">0.00</span> · p95 ALE: <span id="mc-p95">0.00</span>

---

## Distribution

<canvas id="mc-chart" height="380"></canvas>

!!! note "Understanding the Distribution"

    The chart shows how total annual loss varied across every simulated year.

    - A **narrow, tall peak** means the outcomes were consistent — your inputs are well-understood and no single risk dominates.  
    - A **wide, flat shape** means there’s more uncertainty — the system has several comparable risks or the estimates are still rough.  
    - A **long right tail** (bars trailing off to the right) means a few rare, high-impact events drive most of your exposure.  
      Those are usually the best candidates for further mitigation or monitoring.

    In short:
    *The tighter the curve, the more predictable your system.  
    The wider or more lopsided it is, the more value there is in better measurement or control.*

---

