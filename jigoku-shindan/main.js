const form = document.getElementById('quiz');                                                             
  const submitBtn = document.getElementById('submitBtn');                                                     const resultDiv = document.getElementById('result');                                                        const loadingDiv = document.getElementById('loading');                                                      const resultContent = document.getElementById('resultContent');                                             const questions = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];                                     const APP_URL = 'https://life-works.net/jigoku-shindan/';                                                                                                                                function checkAllAnswered() {                                                                                 submitBtn.disabled = !questions.every(function(q) {                                                           return form.querySelector('input[name="' + q + '"]:checked');                                             });                                                                                                       }                                                                                                         

  function getHellName(score) {
    if (score <= 20) return '✨ ほぼ天国';
    if (score <= 40) return '😤 普通の修行場';
    if (score <= 60) return '🔥 地獄の入口';
    if (score <= 80) return '😈 中級地獄';
    return '💀 最深部・無間地獄';
  }

  form.addEventListener('change', function(e) {
    if (e.target.type === 'radio') {
      var q = e.target.name;
      var freeWrap = document.getElementById('free-' + q);
      if (freeWrap) {
        freeWrap.classList.toggle('visible', e.target.value === 'other');
      }
    }
    checkAllAnswered();
  });

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var scores = questions.map(function(q) {
      var checked = form.querySelector('input[name="' + q + '"]:checked');
      return (checked && checked.value === 'other') ? 2 : parseInt(checked ? checked.value : 0);
    });
    var hellPercent = Math.round(scores.reduce(function(a,b){return a+b;},0) / (questions.length * 3) *     
  100);
    var answers = {};
    questions.forEach(function(q) {
      var checked = form.querySelector('input[name="' + q + '"]:checked');
      if (checked && checked.value === 'other') {
        var ta = form.querySelector('textarea[name="' + q + '_text"]');
        answers[q] = ta ? ta.value : 'その他';
      } else {
        answers[q] = checked ? checked.parentElement.textContent.trim() : '';
      }
    });
    form.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    loadingDiv.classList.remove('hidden');
    resultContent.classList.add('hidden');
    try {
      var response = await fetch('/api/jigoku-shindan/diagnose', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({answers: answers, hellPercent: hellPercent})
      });
      var data = await response.json();
      if (data.error) throw new Error(data.detail || data.error);
      document.getElementById('hellScore').textContent = hellPercent + '%';
      document.getElementById('hellName').textContent = getHellName(hellPercent);
      document.getElementById('diagnosisText').textContent = data.diagnosis;
      var tweetText = encodeURIComponent('私の職場の地獄度は ' + hellPercent + '%「' +
  getHellName(hellPercent) + '」でした🔥\n\n#職場地獄度診断\n' + APP_URL);
      document.getElementById('tweetBtn').href = 'https://twitter.com/intent/tweet?text=' + tweetText;
      loadingDiv.classList.add('hidden');
      resultContent.classList.remove('hidden');
    } catch(err) {
      loadingDiv.innerHTML = '<p style="color:#ff6b6b">エラー: ' + err.message + '</p>';
    }
  });
