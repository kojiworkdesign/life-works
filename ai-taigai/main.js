const form = document.getElementById('form');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const resultContent = document.getElementById('resultContent');
const APP_URL = 'https://life-works.net/ai-taigai/';

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const job = document.getElementById('job').value.trim();
  const tasks = document.getElementById('tasks').value.trim();
  if (!job || !tasks) return;

  form.classList.add('hidden');
  resultDiv.classList.remove('hidden');
  loadingDiv.classList.remove('hidden');
  resultContent.classList.add('hidden');

  try {
    const response = await fetch('/api/ai-taigai/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, tasks })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const extinctionDate = new Date();
    extinctionDate.setDate(extinctionDate.getDate() + data.days);
    const dateStr = `${extinctionDate.getFullYear()}年${extinctionDate.getMonth() + 1}月${extinctionDate.getDate()}日 消滅予定`;

    document.getElementById('daysNumber').textContent = data.days.toLocaleString();
    document.getElementById('extinctionDate').textContent = dateStr;
    document.getElementById('commentBox').textContent = data.comment;

    const safeSkillsEl = document.getElementById('safeSkills');
    safeSkillsEl.innerHTML = `
      <p class="safe-skills-label">🛡️ 生き残るためのスキル</p>
      <ul>${data.safe_skills.map(s => `<li>${s}</li>`).join('')}</ul>
    `;

    const countdownBox = document.getElementById('countdownBox');
    const daysNumber = document.getElementById('daysNumber');
    const countdownLabel = document.getElementById('countdownLabel');
    if (data.level === 'safe') {
      countdownBox.style.borderColor = 'rgba(0, 204, 102, 0.5)';
      countdownBox.style.background = 'rgba(0, 204, 102, 0.06)';
      daysNumber.style.color = '#00cc66';
      daysNumber.style.textShadow = '0 0 40px rgba(0, 204, 102, 0.7)';
      countdownLabel.textContent = '✅ あなたの仕事が消えるまで';
    } else if (data.level === 'critical') {
      countdownBox.style.borderColor = 'rgba(255, 0, 0, 0.8)';
      countdownBox.style.background = 'rgba(255, 0, 0, 0.12)';
    }

    const tweetText = encodeURIComponent(
      `私の仕事「${job}」がAIに奪われるまであと${data.days.toLocaleString()}日😱\n消滅予定日：${dateStr.replace(' 消滅予定', '')}\n\n#AIに奪われるまであと何日\n${APP_URL}`
    );
    document.getElementById('tweetBtn').href = `https://twitter.com/intent/tweet?text=${tweetText}`;

    loadingDiv.classList.add('hidden');
    resultContent.classList.remove('hidden');

  } catch (err) {
    loadingDiv.innerHTML = '<p style="color:#ff6b6b;line-height:1.8">エラーが発生しました。<br>再度お試しください。</p>';
  }
});
