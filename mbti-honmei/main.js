const GROUPS = {
  analysts:  { label: '分析家', color: '#6c5ce7' },
  diplomats: { label: '外交官', color: '#00b894' },
  sentinels: { label: '番人',   color: '#0984e3' },
  explorers: { label: '探索家', color: '#e17055' },
};

const TYPE_NAMES = {
  INTJ: '建築家', INTP: '論理学者', ENTJ: '指揮官',  ENTP: '討論者',
  INFJ: '提唱者', INFP: '仲介者',  ENFJ: '主人公',  ENFP: '広報運動家',
  ISTJ: '管理者', ISFJ: '擁護者',  ESTJ: '幹部',    ESFJ: '領事',
  ISTP: '巨匠',  ISFP: '冒険家',  ESTP: '起業家',  ESFP: 'エンターテイナー',
};

const form       = document.getElementById('form');
const submitBtn  = document.getElementById('submitBtn');
const resultDiv  = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const resultContent = document.getElementById('resultContent');

let selectedRelation = '';

document.querySelectorAll('.rel-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.rel-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const val = this.dataset.value;
    const otherInput = document.getElementById('relOther');
    if (val === 'other') {
      otherInput.classList.remove('hidden');
      selectedRelation = '';
    } else {
      otherInput.classList.add('hidden');
      selectedRelation = val;
    }
    checkReady();
  });
});

document.getElementById('relOther').addEventListener('input', function() {
  selectedRelation = this.value.trim();
  checkReady();
});

document.getElementById('message').addEventListener('input', checkReady);

function checkReady() {
  const msg = document.getElementById('message').value.trim();
  submitBtn.disabled = !selectedRelation || !msg;
}

function renderResults(data, relation) {
  const container = document.getElementById('groupsContainer');
  container.innerHTML = '';
  document.getElementById('resultIntro').textContent =
    `「${relation}」からの発言を16タイプで分析しました`;

  ['analysts', 'diplomats', 'sentinels', 'explorers'].forEach(groupKey => {
    const group = GROUPS[groupKey];
    const types = data.filter(t => t.group === groupKey);
    if (!types.length) return;

    const section = document.createElement('div');
    section.className = 'group-section';
    section.innerHTML = `
      <div class="group-header" style="--group-color:${group.color}">
        <span class="group-label">${group.label}</span>
      </div>
    `;

    types.forEach(t => {
      const card = document.createElement('div');
      card.className = 'type-card';
      card.style.setProperty('--group-color', group.color);
      card.innerHTML = `
        <div class="type-header">
          <div class="type-info">
            <span class="type-code" style="color:${group.color}">${t.type}</span>
            <span class="type-name">${TYPE_NAMES[t.type] || ''}</span>
          </div>
          <span class="type-catch">${t.catch}</span>
          <span class="type-toggle">＋</span>
        </div>
        <div class="type-body hidden">
          <p class="honmei-text">${t.honmei}</p>
        </div>
      `;

      card.querySelector('.type-header').addEventListener('click', () => {
        const body  = card.querySelector('.type-body');
        const toggle = card.querySelector('.type-toggle');
        const isOpen = !body.classList.contains('hidden');
        body.classList.toggle('hidden');
        toggle.textContent = isOpen ? '＋' : '－';
        card.classList.toggle('open', !isOpen);
      });

      section.appendChild(card);
    });

    container.appendChild(section);
  });
}

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const msg = document.getElementById('message').value.trim();
  if (!selectedRelation || !msg) return;

  form.classList.add('hidden');
  resultDiv.classList.remove('hidden');
  loadingDiv.classList.remove('hidden');
  resultContent.classList.add('hidden');

  try {
    const response = await fetch('/api/mbti-honmei/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relationship: selectedRelation, message: msg }),

    });

    const data = await response.json();
    if (data.error) throw new Error(data.detail || data.error);

    renderResults(data, selectedRelation);

    const tweetText = encodeURIComponent(
      `相手の本心をMBTIで分析してみた🔍\n#MBTI本心診断\nhttps://life-works.net/mbti-honmei/`
    );
    document.getElementById('tweetBtn').href =
      `https://twitter.com/intent/tweet?text=${tweetText}`;

    loadingDiv.classList.add('hidden');
    resultContent.classList.remove('hidden');

  } catch (err) {
    loadingDiv.innerHTML =
      '<p style="color:#ff6b6b;line-height:1.8">エラー: ' + err.message + '</p>';
  }
});
