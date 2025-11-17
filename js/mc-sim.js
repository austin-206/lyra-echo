
// ---------- Global Chart.js defaults for legibility ----------
(function ensureChartDefaults(){
  if (typeof Chart === 'undefined') return;
  try {
    const body = getComputedStyle(document.body);
    const font = body.getPropertyValue('--md-text-font').trim() || 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--mc-axis-color').trim() || '#222';
    Chart.defaults.font = { family: font, size: 16, weight: '500' };
  } catch (e) {}
})();

// ---------- RNG helpers ----------
function randTri(min, mode, max){
  const u=Math.random(), c=(mode-min)/(max-min);
  if(u<c) return min + Math.sqrt(u*(max-min)*(mode-min));
  return max - Math.sqrt((1-u)*(max-min)*(max-mode));
}
function randGamma(k){
  if(k<1){ const u=Math.random(); return randGamma(1+k)*Math.pow(u,1/k); }
  const d=k-1/3, c=1/Math.sqrt(9*d);
  for(;;){
    let x,v,u;
    do{ x=Math.random()*2-1; v=1+c*x; }while(v<=0);
    v=v*v*v; u=Math.random();
    if(u<1-0.0331*x*x*x*x) return d*v;
    if(Math.log(u)<0.5*x*x + d*(1-v+Math.log(v))) return d*v;
  }
}
function randBeta(a,b){ const x=randGamma(a), y=randGamma(b); return x/(x+y); }

// ---------- Simulation ----------
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

// ---------- UI ----------
function runSimFromForm(){
  const trials = parseInt(document.getElementById('mc-trials').value, 10) || 10000;
  const rows   = document.querySelectorAll('#mc-risks tbody tr');
  const risks  = [];

  rows.forEach(row => {
    const nameInput = row.querySelector('input[type="text"]');
    const numInputs = row.querySelectorAll('input[type="number"]');
    if (numInputs.length < 5) return; // skip incomplete rows

    risks.push({
      name:   nameInput ? nameInput.value : '',
      i_min:  parseFloat(numInputs[0].value),
      i_mode: parseFloat(numInputs[1].value),
      i_max:  parseFloat(numInputs[2].value),
      p_alpha:parseFloat(numInputs[3].value),
      p_beta: parseFloat(numInputs[4].value),
    });
  });

  const { totals, mean, p95 } = simulate(risks, trials);

  const meanEl = document.getElementById('mc-mean');
  const p95El  = document.getElementById('mc-p95');
  if (meanEl) meanEl.textContent = '$' + mean.toFixed(2);
  if (p95El)  p95El.textContent  = '$' + p95.toFixed(2);

  const { edges, counts } = makeBins(totals, 24);

  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  function pickTickIndexes(edges){
    const n = edges.length - 1;
    if (n <= 0) return [0];
    const set = new Set([
      0,
      Math.round(n * 0.25),
      Math.round(n * 0.50),
      Math.round(n * 0.75),
      n
    ]);
    return Array.from(set).sort((a, b) => a - b);
  }

  const tickIdx   = new Set(pickTickIndexes(edges));
  const meanIndex = findBinIndex(mean, edges);
  const p95Index  = findBinIndex(p95,  edges);
  tickIdx.add(p95Index);

  const labels = edges.map((_, i) => tickIdx.has(i) ? fmt.format(edges[i]) : '');

  if (window.mcChart) window.mcChart.destroy();
  const canvas = document.getElementById('mc-chart');
  const ctx    = canvas?.getContext('2d');
  if (!ctx || typeof Chart === 'undefined') return;

  const markerPlugin = {
    id: 'markerPlugin',
    afterDatasetsDraw(chart){
      const { ctx, chartArea: { top, bottom } } = chart;
      const xScale = chart.scales.x;

      const draw = (index, color, text) => {
        if (index == null || !xScale) return;
        const x = xScale.getPixelForTick(index);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.font = '700 16px system-ui, sans-serif';
        ctx.fillText(text, x, top + 16);
        ctx.restore();
      };

      draw(meanIndex, '#2e7d32', 'mean');
      draw(p95Index,  '#c62828', 'p95');
    }
  };

  window.mcChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Annual Loss (simulated)',
        data: counts,
        backgroundColor: 'rgba(66,165,245,.5)',
        borderColor: 'rgba(66,165,245,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 1,
      layout: { padding: { bottom: 18 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          titleFont: { size: 16, weight: '700' },
          bodyFont: { size: 16 },
          callbacks: {
            title: (items) => {
              const i = items[0].dataIndex;
              return `~ ${fmt.format(edges[i])}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            font: { size: 16, weight: '600' },
            color: '#222',
            padding: 10,
            maxRotation: 0,
            minRotation: 0
          },
          grid: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--mc-grid-color') || 'rgba(0,0,0,.08)'
          },
          title: {
            display: true,
            text: 'Annual Loss (USD)',
            color: '#111',
            font: { size: 16, weight: '700' }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) =>
              new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(val),
            font: { size: 16 },
            color: '#222',
            padding: 8
          },
          grid: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--mc-grid-color') || 'rgba(0,0,0,.08)'
          },
          title: {
            display: true,
            text: 'Frequency (simulated years)',
            color: '#111',
            font: { size: 16, weight: '700' }
          }
        }
      }
    },
    plugins: [markerPlugin]
  });
}

// Re-bind for MkDocs Material instant navigation
function mount(){
  const btn=document.getElementById('mc-run');
  if(btn && !btn.dataset.bound){
    btn.addEventListener('click', runSimFromForm);
    btn.dataset.bound='1';
  }
}
if(window.document$){ window.document$.subscribe(mount); }
else { document.addEventListener('DOMContentLoaded', mount); }
