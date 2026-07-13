/* ═══════════════════════════════════════════════════════
   ARTIFACT ATLAS — UPDATE 3 of 4
   Version: 1.3.0
   Feature: Live Civil War News Carousel (AI-powered)
   Deploy: Day 7-10 of testing window
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const CACHE_KEY = 'aa_news_cache_v1';
  const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

  const categoryEmoji = {
    'shipwreck': {icon:'⚓',color:'#1a2d44'},
    'battlefield': {icon:'⚔',color:'#3d1414'},
    'metal detecting': {icon:'🧲',color:'#3d2210'},
    'relic find': {icon:'🪙',color:'#3d2210'},
    'museum': {icon:'🏛',color:'#1a2d1c'},
    'archaeology': {icon:'⛏',color:'#202e10'},
    'reenactment': {icon:'🎖',color:'#3d1414'},
    'historic site': {icon:'🏰',color:'#1a2432'},
    'default': {icon:'📜',color:'#2a1a08'},
  };

  function getCat(cat) {
    const k = (cat||'').toLowerCase();
    for (const [key,val] of Object.entries(categoryEmoji)) {
      if (k.includes(key)) return val;
    }
    return categoryEmoji.default;
  }

  function esc(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function buildWidget() {
    if (document.getElementById('aa-news-widget')) return;

    // Find best injection point
    const target = document.querySelector('footer') ||
                   document.querySelector('.footer') ||
                   document.querySelector('#forum') ||
                   document.body;

    const widget = document.createElement('div');
    widget.id = 'aa-news-widget';
    widget.innerHTML = `
<style>
#aa-news-widget{padding:24px 16px;background:#0e0904;font-family:'Crimson Text',Georgia,serif}
.nw-head{text-align:center;margin-bottom:16px}
.nw-rule{height:1px;background:linear-gradient(90deg,transparent,#c9933a,transparent);margin:6px 0}
.nw-title{font-family:'Cinzel',Georgia,serif;font-size:.72rem;letter-spacing:.25em;color:#c9933a;text-transform:uppercase}
.nw-sub{font-family:'IM Fell English',Georgia,serif;font-style:italic;font-size:.7rem;color:rgba(201,147,58,.55);margin-top:3px}
.nw-carousel{position:relative;border-radius:3px;overflow:hidden;min-height:320px;background:#fdf8ed;box-shadow:0 8px 30px rgba(0,0,0,.6)}
.nw-loading{position:absolute;inset:0;background:#120c04;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
.nw-loading.gone{display:none}
.nw-spin{font-size:2rem;animation:nw-pulse 1.4s ease-in-out infinite}
.nw-lt{font-family:'Cinzel',Georgia,serif;font-size:.65rem;letter-spacing:.2em;color:#c9933a;text-transform:uppercase}
.nw-lsub{font-family:'IM Fell English',Georgia,serif;font-style:italic;font-size:.75rem;color:rgba(201,147,58,.5);text-align:center;padding:0 24px}
.nw-card{display:none;flex-direction:column;min-height:320px;background:#fdf8ed}
.nw-card.on{display:flex;animation:nw-slide .4s cubic-bezier(.23,1,.32,1)}
.nw-card.left{animation:nw-left .4s cubic-bezier(.23,1,.32,1)}
@keyframes nw-slide{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes nw-left{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
@keyframes nw-pulse{0%,100%{opacity:.4;transform:scale(.95)}50%{opacity:1;transform:scale(1.05)}}
.nw-ribbon{display:flex;align-items:center;gap:7px;background:#7a4910;color:#fdf8ed;font-family:'Cinzel',Georgia,serif;font-size:.56rem;letter-spacing:.16em;text-transform:uppercase;padding:5px 12px}
.nw-nc{margin-left:4px;background:#7a1515;color:#fff;font-size:.48rem;padding:1px 5px;border-radius:1px}
.nw-rdate{margin-left:auto;font-family:'IM Fell English',Georgia,serif;font-style:italic;font-size:.66rem;opacity:.85}
.nw-illo{height:100px;display:flex;align-items:center;justify-content:center;font-size:3rem;border-bottom:2px solid #7a4910;flex-shrink:0}
.nw-body{padding:14px 16px 12px;flex:1;display:flex;flex-direction:column}
.nw-hl{font-family:'Cinzel',Georgia,serif;font-size:.88rem;font-weight:700;color:#1c1208;line-height:1.3;margin-bottom:7px;padding-bottom:7px;border-bottom:1px solid rgba(122,73,16,.2)}
.nw-src{font-family:'Crimson Text',Georgia,serif;font-style:italic;font-size:.72rem;color:#7a4910;margin-bottom:7px}
.nw-src::before{content:'— ';color:#c9933a}
.nw-sum{font-family:'IM Fell English',Georgia,serif;font-size:.88rem;color:#4a3420;line-height:1.65;flex:1}
.nw-nav{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 6px}
.nw-nb{background:none;border:1px solid rgba(201,147,58,.3);color:#c9933a;font-family:'Cinzel',Georgia,serif;font-size:.62rem;letter-spacing:.1em;padding:5px 12px;cursor:pointer;border-radius:2px;transition:background .2s}
.nw-nb:hover:not(:disabled){background:#7a4910;color:#fdf8ed}
.nw-nb:disabled{opacity:.25;cursor:default}
.nw-dots{display:flex;gap:6px}
.nw-dot{width:6px;height:6px;border-radius:50%;background:rgba(122,73,16,.25);cursor:pointer;border:none;transition:all .22s}
.nw-dot.on{background:#c9933a;transform:scale(1.4)}
.nw-ctr{text-align:center;font-family:'Cinzel',Georgia,serif;font-size:.55rem;letter-spacing:.18em;color:rgba(201,147,58,.4);padding-bottom:4px}
.nw-refresh{display:flex;justify-content:center;margin-top:12px}
.nw-rb{background:linear-gradient(135deg,#7a4910,#c97820);border:none;color:#fdf8ed;font-family:'Cinzel',Georgia,serif;font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;padding:7px 16px;cursor:pointer;border-radius:2px;display:flex;align-items:center;gap:6px;transition:opacity .2s}
.nw-rb:hover:not(:disabled){opacity:.85}
.nw-rb:disabled{opacity:.45;cursor:not-allowed}
.nw-rb.loading .nw-sp{animation:nw-spin-r .8s linear infinite;display:inline-block}
@keyframes nw-spin-r{to{transform:rotate(360deg)}}
.nw-lu{font-family:'IM Fell English',Georgia,serif;font-style:italic;font-size:.65rem;color:rgba(201,147,58,.5);text-align:center;margin-top:6px}
</style>

<div class="nw-head">
  <div class="nw-rule"></div>
  <div class="nw-title">⚔ Field Dispatch — Civil War &amp; Relic News ⚔</div>
  <div class="nw-sub">Nationwide Coverage · NC Priority</div>
  <div class="nw-rule" style="margin-top:6px"></div>
</div>

<div class="nw-carousel" id="nw-carousel">
  <div class="nw-loading" id="nw-loading">
    <div class="nw-spin">🔍</div>
    <div class="nw-lt">Scouting the Field...</div>
    <div class="nw-lsub" id="nw-lsub">Searching for Civil War &amp; relic news</div>
  </div>
  <div id="nw-cards"></div>
</div>

<div id="nw-nav-wrap" style="display:none">
  <div class="nw-nav">
    <button class="nw-nb" id="nw-prev" disabled>← Prev</button>
    <div class="nw-dots" id="nw-dots"></div>
    <button class="nw-nb" id="nw-next">Next →</button>
  </div>
  <div class="nw-ctr" id="nw-ctr"></div>
</div>

<div class="nw-refresh">
  <button class="nw-rb" id="nw-rb" onclick="window._aaFetchNews()">
    <span class="nw-sp">⟳</span> Fetch Latest News
  </button>
</div>
<div class="nw-lu" id="nw-lu"></div>`;

    if (target === document.body) {
      document.body.appendChild(widget);
    } else {
      target.parentNode.insertBefore(widget, target);
    }

    window._aaFetchNews = fetchNews;
    fetchNews();
  }

  let articles = [], cur = 0;

  async function fetchNews(forceRefresh) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!forceRefresh && cached) {
      const {ts, data} = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) {
        articles = data; render(); return;
      }
    }

    setLoading(true);
    const btn = document.getElementById('nw-rb');
    if (btn) { btn.disabled = true; btn.classList.add('loading'); }

    const today = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
    const prompt = `Today is ${today}. You are a Civil War relic hunting research assistant for the app Artifact Atlas. Search the web and find the latest news about: 1) Civil War relic finds and metal detecting discoveries especially in North Carolina, 2) Civil War battlefield archaeology and site excavations, 3) Civil War shipwreck discoveries especially in NC, 4) Civil War museum and historic site news in NC, 5) Relic hunting laws and preservation news. Prioritize 2024-${new Date().getFullYear()} articles. NC stories first. Return ONLY a valid JSON array of 5-6 objects, no markdown, no backticks: [{"headline":"max 10 words","source":"Publication, Location","date":"Month YYYY","category":"Shipwreck|Battlefield|Metal Detecting|Relic Find|Museum|Archaeology|Reenactment|Historic Site","isNC":true_or_false,"summary":"2-3 sentences with specific facts","tags":["tag1","tag2"]}]`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          tools: [{type:'web_search_20250305',name:'web_search'}],
          messages: [{role:'user',content:prompt}]
        })
      });
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      const data = await resp.json();
      let txt = (data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').replace(/```json|```/g,'').trim();
      const m = txt.match(/\[[\s\S]*\]/);
      if (!m) throw new Error('No JSON');
      articles = JSON.parse(m[0]);
      if (!articles.length) throw new Error('Empty');
      localStorage.setItem(CACHE_KEY, JSON.stringify({ts:Date.now(),data:articles}));
      render();
      const lu = document.getElementById('nw-lu');
      if (lu) lu.textContent = 'Updated ' + new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
    } catch(e) {
      console.warn('AA news fetch:', e);
      setLoading(false);
    } finally {
      if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
    }
  }

  function render() {
    const container = document.getElementById('nw-cards');
    const dotsEl = document.getElementById('nw-dots');
    if (!container || !dotsEl) return;
    container.innerHTML = ''; dotsEl.innerHTML = ''; cur = 0;

    articles.forEach((a,i) => {
      const {icon,color} = getCat(a.category);
      const nc = a.isNC ? '<span class="nw-nc">NC</span>' : '';
      const card = document.createElement('div');
      card.className = 'nw-card' + (i===0?' on':'');
      card.innerHTML = `
        <div class="nw-ribbon"><span>${icon}</span>${esc(a.category)}${nc}<span class="nw-rdate">${esc(a.date||'')}</span></div>
        <div class="nw-illo" style="background:${color}"><span>${icon}</span></div>
        <div class="nw-body">
          <div class="nw-hl">${esc(a.headline)}</div>
          <div class="nw-src">${esc(a.source)}</div>
          <div class="nw-sum">${esc(a.summary)}</div>
        </div>`;
      container.appendChild(card);

      const d = document.createElement('button');
      d.className = 'nw-dot'+(i===0?' on':'');
      d.onclick = () => goTo(i);
      dotsEl.appendChild(d);
    });

    setLoading(false);
    document.getElementById('nw-nav-wrap').style.display = 'block';
    updateNav();

    document.getElementById('nw-prev').onclick = () => goTo(cur-1, true);
    document.getElementById('nw-next').onclick = () => goTo(cur+1);

    // Swipe
    const car = document.getElementById('nw-carousel');
    car.ontouchstart = e => { car._sx = e.touches[0].clientX; };
    car.ontouchend = e => {
      const dx = e.changedTouches[0].clientX - (car._sx||0);
      if (Math.abs(dx) > 44) goTo(dx < 0 ? cur+1 : cur-1, dx > 0);
    };
  }

  function goTo(idx, fromLeft) {
    if (idx < 0 || idx >= articles.length) return;
    const cards = document.querySelectorAll('.nw-card');
    const dots = document.querySelectorAll('.nw-dot');
    cards[cur].classList.remove('on','left');
    dots[cur].classList.remove('on');
    cur = idx;
    const c = cards[cur];
    c.classList.remove('on','left');
    void c.offsetWidth;
    if (fromLeft) c.classList.add('left');
    c.classList.add('on');
    dots[cur].classList.add('on');
    updateNav();
  }

  function updateNav() {
    const p = document.getElementById('nw-prev');
    const n = document.getElementById('nw-next');
    const ctr = document.getElementById('nw-ctr');
    if (p) p.disabled = cur === 0;
    if (n) n.disabled = cur === articles.length-1;
    if (ctr) ctr.textContent = `Dispatch ${cur+1} of ${articles.length}`;
  }

  function setLoading(on) {
    const l = document.getElementById('nw-loading');
    if (l) l.classList.toggle('gone', !on);
  }

  const msgs = ['Searching NC coastal archaeology reports...','Detecting relic finds coast to coast...','Mining Civil War site databases...','Scouting Cape Fear River shipwreck reports...'];
  let mi = 0;
  setInterval(() => {
    const el = document.getElementById('nw-lsub');
    if (el && !document.getElementById('nw-loading')?.classList.contains('gone')) {
      el.textContent = msgs[mi++ % msgs.length];
    }
  }, 2200);

  function init() { setTimeout(buildWidget, 400); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
})();
