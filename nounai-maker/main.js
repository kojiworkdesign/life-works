const PALETTE = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#cc5de8', '#f783ac', '#20c997'];
const APP_URL = 'https://life-works.net/nounai-maker/';

const form          = document.getElementById('form');
const resultDiv     = document.getElementById('result');
const loadingDiv    = document.getElementById('loading');
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

    await renderResult(data, name);
    loadingDiv.classList.add('hidden');
    resultContent.classList.remove('hidden');

  } catch (err) {
    loadingDiv.innerHTML = '<p style="color:#ff6b6b;line-height:1.8">エラー: ' + err.message + '</p>';
  }
});

async function renderResult(data, name) {
  document.getElementById('resultName').textContent = name + ' の脳内';
  await buildWordCloud(data.items);
  buildLegend(data.items);
  document.getElementById('summaryText').textContent = '「' + data.summary + '」';
  document.getElementById('commentText').textContent = data.comment;

  const topItems = [...data.items]
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3)
    .map(i => i.emoji + i.label + i.percent + '%')
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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// head2.png（黒=頭の内側、白=外側）からwordcloud2用マスクを生成
// wordcloud2: 白=配置OK、有色=配置NG → 反転が必要
function createWCMask(img, size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const d = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < d.data.length; i += 4) {
    const bright = (d.data[i] + d.data[i+1] + d.data[i+2]) / 3;
    if (bright < 128) {
      // 黒（頭の内側）→ 白（配置OK）
      d.data[i] = 255; d.data[i+1] = 255; d.data[i+2] = 255; d.data[i+3] = 255;
    } else {
      // 白（外側）→ 黒（配置NG）
      d.data[i] = 0; d.data[i+1] = 0; d.data[i+2] = 0; d.data[i+3] = 255;
    }
  }
  ctx.putImageData(d, 0, 0);
  return c;
}

// head2.pngからCSSマスク用data URLを生成
// 黒（内側）→ 不透明（表示）、白（外側）→ 透明（非表示）
function createCSSMask(img, size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const d = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < d.data.length; i += 4) {
    const bright = (d.data[i] + d.data[i+1] + d.data[i+2]) / 3;
    if (bright < 128) {
      d.data[i] = 255; d.data[i+1] = 255; d.data[i+2] = 255; d.data[i+3] = 255;
    } else {
      d.data[i] = 0; d.data[i+1] = 0; d.data[i+2] = 0; d.data[i+3] = 0;
    }
  }
  ctx.putImageData(d, 0, 0);
  return c.toDataURL('image/png');
}

function buildWordCloud(items) {
  return new Promise(async (resolve) => {
    const headImg = await loadImage('head2.png');
    const SIZE = 600;
    const wcCanvas = document.getElementById('wcCanvas');
    wcCanvas.width = SIZE;
    wcCanvas.height = SIZE;

    // wordcloud2用マスク（反転: 白=配置OK、黒=配置NG）
    const wcMask = createWCMask(headImg, SIZE);

    // 色をアイテムに固定割り当て
    const colorMap = {};
    items.forEach((item, idx) => { colorMap[item.label] = PALETTE[idx % PALETTE.length]; });

    // パーセントを正規化（max=10）
    const maxP = Math.max(...items.map(i => i.percent));
    const wordList = items.map(item => [item.label, Math.round(item.percent / maxP * 10)]);

    WordCloud(wcCanvas, {
      list: wordList,
      gridSize: Math.round(SIZE / 40),
      weightFactor: SIZE / 80,
      fontFamily: '"Hiragino Sans", "Noto Sans JP", "Yu Gothic", sans-serif',
      fontWeight: 'bold',
      color: (word) => colorMap[word] || PALETTE[0],
      rotateRatio: 0,
      rotationSteps: 1,
      backgroundColor: '#08080f',
      maskCanvas: wcMask,
      shrinkToFit: true,
      drawOutOfBound: false,
      shuffle: false,
    });

    // wordcloudstop後にcanvas合成でくり抜く（CSS maskより確実）
    wcCanvas.addEventListener('wordcloudstop', () => {
      const alphaMaskUrl = createCSSMask(headImg, SIZE);
      const maskImg = new Image();
      maskImg.onload = () => {
        const ctx = wcCanvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(maskImg, 0, 0, SIZE, SIZE);
        ctx.globalCompositeOperation = 'source-over';
        resolve();
      };
      maskImg.src = alphaMaskUrl;
    }, { once: true });

    setTimeout(resolve, 5000);
  });
}

function buildLegend(items) {
  const legend = document.getElementById('legend');
  legend.innerHTML = '';
  [...items]
    .sort((a, b) => b.percent - a.percent)
    .forEach((item) => {
      const idx = items.indexOf(item);
      const row = document.createElement('div');
      row.className = 'legend-item';
      row.innerHTML = `
        <div class="legend-color" style="background:${PALETTE[idx % PALETTE.length]}"></div>
        <span class="legend-emoji">${item.emoji}</span>
        <span class="legend-label">${item.label}</span>
        <span class="legend-percent">${item.percent}%</span>
      `;
      legend.appendChild(row);
    });
}
