/* ═══════════════════════════════════════════════════════
   ARTIFACT ATLAS — UPDATE 3 of 4
   Version: 1.3.0
   Feature: Live Civil War News Carousel (RSS-powered)
   Deploy: Day 7-10 of testing window
   Fix: Replaced direct Anthropic API call (CORS-blocked)
        with Google News RSS via rss2json.com
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

  function detectCategory(text) {
    const t = text.toLowerCase();
    if (/shipwreck|vessel|ship|boat/.test(t)) return 'Shipwreck';
    if (/metal detect|detecting|detector/.test(t)) return 'Metal Detecting';
    if (/relic|artifact|bullet|buckle|coin/.test(t)) return 'Relic Find';
    if (/museum|exhibit|display|collection/.test(t)) return 'Museum';
    if (/archaeolog|excavat|dig/.test(t)) return 'Archaeology';
    if (/reenact|living history/.test(t)) return 'Reenactment';
    if (/historic site|monument|park|battlefield/.test(t)) return 'Battlefield';
    return 'Historic Site';
  }

  function extractSource(url) {
    try {
      return new URL(url).hostname.replace('www.','');
    } catch(e) { return 'News'; }
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
.nw-readmore{display:inline-block;margin-top:10px;font-family:'Cinzel',Georgia,serif;font-size:.55rem;letter-spacing:.12em;color:#7a4910;text-decoration:none;border-bottom:1px solid rgba(122,73,16,.3)}
.nw-readmore:hover{color:#c9933a;border-color:#c9933a}
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
  <button class="nw-rb" id="nw-rb" onclick="window._aaFetchNews(true)">
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

  /* ── RSS-based fetch (replaces blocked Anthropic API call) ── */
  async function fetchNews(forceRefresh) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!forceRefresh && cached) {
      try {
        const {ts, data} = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) { articles = data; render(); return; }
      } catch(e) { /* bad cache, refetch */ }
    }

    setLoading(true);
    const btn = document.getElementById('nw-rb');
    if (btn) { btn.disabled = true; btn.classList.add('loading'); }

    // Google News RSS queries — NC first, then broader
    const queries = [
      'North+Carolina+Civil+War+relic+archaeology',
      'civil+war+metal+detecting+relic+find',
      'civil+war+battlefield+archaeology+discovery',
    ];

    try {
      const allItems = [];
      for (const q of queries) {
        const rssUrl = encodeURIComponent(
          `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`
        );
        const resp = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&count=4`
        );
        if (!resp.ok) continue;
        const json = await resp.json();
        if (json.items && json.items.length) allItems.push(...json.items);
      }

      // Deduplicate by title prefix
      const seen = new Set();
      const unique = allItems.filter(item => {
        const key = (item.title || '').slice(0, 50).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 6);

      if (!unique.length) throw new Error('No articles returned');

      // Sort NC stories first
      unique.sort((a,b) => {
        const ncA = /north carolina|\bNC\b|Raleigh|Wilmington|Fayetteville|Charlotte/i.test(a.title+a.description) ? -1 : 1;
        const ncB = /north carolina|\bNC\b|Raleigh|Wilmington|Fayetteville|Charlotte/i.test(b.title+b.description) ? -1 : 1;
        return ncA - ncB;
      });

      articles = unique.map(item => {
        const title = (item.title || '').replace(/ - [^-]+$/, ''); // strip " - Source Name" suffix Google adds
        const rawDesc = (item.description || '').replace(/<[^>]*>/g, '').trim();
        const summary = rawDesc.slice(0, 280) + (rawDesc.length > 280 ? '…' : '');
        const combined = title + ' ' + summary;
        const isNC = /north carolina|\bNC\b|Raleigh|Wilmington|Fayetteville|Charlotte/i.test(combined);
        const category = detectCategory(combined);
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        const dateStr = pubDate.toLocaleDateString('en-US', {month:'long', year:'numeric'});
        const source = item.author || extractSource(item.link);
        return { headline: title, source, date: dateStr, category, isNC, summary: summary || title, link: item.link };
      });

      localStorage.setItem(CACHE_KEY, JSON.stringify({ts: Date.now(), data: articles}));
      render();
      const lu = document.getElementById('nw-lu');
      if (lu) lu.textContent = 'Updated ' + new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});

    } catch(e) {
      console.warn('AA news fetch:', e);
      useFallback();
    } finally {
      if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
    }
  }

  /* Fallback static articles if RSS is unreachable */
  function useFallback() {
    articles = [
      { headline:'Civil War Relic Hunting in North Carolina', source:'Artifact Atlas', date:'2025', category:'Relic Find', isNC:true,
        summary:'North Carolina's Civil War battlefields continue to yield significant relic finds. Metal detectorists and archaeologists alike are uncovering artifacts from Sherman\'s March and the Carolinas Campaign.', link:'' },
      { headline:'NC Shipwrecks: Underwater Civil War History', source:'NC DNCR', date:'2025', category:'Shipwreck', isNC:true,
        summary:'North Carolina\'s coastal waters hold dozens of Civil War-era shipwrecks. The CSS Neuse and other ironclads remain important archaeological sites protected by state law.', link:'' },
      { headline:'Battlefield Preservation News', source:'American Battlefield Trust', date:'2025', category:'Battlefield', isNC:false,
        summary:'The American Battlefield Trust continues to preserve Civil War battlefield land across the country, preventing development on historically significant ground.', link:'' },
    ];
    render();
    const lu = document.getElementById('nw-lu');
    if (lu) lu.textContent = 'Showing cached content — check your connection';
  }

  function render() {
    const container = document.getElementById('nw-cards');
    const dotsEl = document.getElementById('nw-dots');
    if (!container || !dotsEl) return;
    container.innerHTML = ''; dotsEl.innerHTML = ''; cur = 0;

    articles.forEach((a,i) => {
      const {icon,color} = getCat(a.category);
      const nc = a.isNC ? '<span class="nw-nc">NC</span>' : '';
      const readMore = a.link ? `<a class="nw-readmore" href="${esc(a.link)}" target="_blank" rel="noopener">Read Full Story →</a>` : '';
      const card = document.createElement('div');
      card.className = 'nw-card' + (i===0?' on':'');
      card.innerHTML = `
        <div class="nw-ribbon"><span>${icon}</span>${esc(a.category)}${nc}<span class="nw-rdate">${esc(a.date||'')}</span></div>
        <div class="nw-illo" style="background:${color}"><span>${icon}</span></div>
        <div class="nw-body">
          <div class="nw-hl">${esc(a.headline)}</div>
          <div class="nw-src">${esc(a.source)}</div>
          <div class="nw-sum">${esc(a.summary)}${readMore}</div>
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

    // Swipe support
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
