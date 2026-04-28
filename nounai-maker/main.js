const PALETTE = [
  '#ff6b6b', '#ff922b', '#ffd43b', '#69db7c',
  '#4dabf7', '#cc5de8', '#f783ac', '#20c997',
];

const APP_URL = 'https://life-works.net/nounai-maker/';

const form        = document.getElementById('form');
const resultDiv   = document.getElementById('result');
const loadingDiv  = document.getElementById('loading');
const resultContent = document.getElementById('resultContent');

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const name        = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  if (!name || !description) return;

  form.classList.add('hidden');
  resultDiv.classList.remove('hidden');
  loadingDiv.classList.remove('hidden');
  resultContent.classList.add('hidden');

  try {
    const response = await fetch('/api/nounai-maker/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.detail || data.error);

    renderResult(data, name);

    loadingDiv.classList.add('hidden');
    resultContent.classList.remove('hidden');

  } catch (err) {
    loadingDiv.innerHTML = '<p style="color:#ff6b6b;line-height:1.8">エラー: ' + err.message + '</p>';
  }
});

function renderResult(data, name) {
  document.getElementById('resultName').textContent = name + ' の脳内';

  buildGrid(data.items);
  buildLegend(data.items);

  document.getElementById('summaryText').textContent = '「' + data.summary + '」';
  document.getElementById('commentText').textContent = data.comment;

  const topItems = [...data.items]
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3)
    .map(item => item.emoji + item.label + item.percent + '%')
    .join('・');

  const tweetText = encodeURIComponent(
    '【令和版脳内ビジュアライザー】私の脳内\n'
    + topItems + '...\n'
    + '「' + data.summary + '」\n'
    + '#令和版脳内ビジュアライザー\n'
    + APP_URL
  );
  document.getElementById('tweetBtn').href = 'https://twitter.com/intent/tweet?text=' + tweetText;
}

function buildGrid(items) {
  const grid = document.getElementById('colorGrid');
  grid.innerHTML = '';

  // percentの合計を100に正規化してセルを生成
  const total = items.reduce((s, i) => s + i.percent, 0);
  let assigned = 0;

  items.forEach((item, idx) => {
    const count = idx === items.length - 1
      ? 100 - assigned
      : Math.round(item.percent * 100 / total);
    assigned += count;

    for (let j = 0; j < count; j++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.style.backgroundColor = PALETTE[idx % PALETTE.length];
      grid.appendChild(cell);
    }
  });
}

function buildLegend(items) {
  const legend = document.getElementById('legend');
  legend.innerHTML = '';

  [...items]
    .sort((a, b) => b.percent - a.percent)
    .forEach((item, idx) => {
      const originalIdx = items.indexOf(item);
      const row = document.createElement('div');
      row.className = 'legend-item';
      row.innerHTML = `
        <div class="legend-color" style="background:${PALETTE[originalIdx % PALETTE.length]}"></div>
        <span class="legend-emoji">${item.emoji}</span>
        <span class="legend-label">${item.label}</span>
        <span class="legend-percent">${item.percent}%</span>
      `;
      legend.appendChild(row);
    });
}
