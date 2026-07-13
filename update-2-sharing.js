/* ═══════════════════════════════════════════════════════
   ARTIFACT ATLAS — UPDATE 2 of 4
   Version: 1.2.0
   Feature: Social Sharing + Share Your Find panel
   Deploy: Day 4-6 of testing window
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function buildShare() {
    if (document.getElementById('aa-share-wrap')) return;

    const wrap = document.createElement('div');
    wrap.id = 'aa-share-wrap';
    wrap.innerHTML = `
<style>
@keyframes aa-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
#aa-share-panel{position:fixed;bottom:78px;right:20px;z-index:9997;background:#fdf8ed;border:1px solid rgba(122,73,16,.3);border-radius:3px;padding:14px 16px 12px;box-shadow:0 8px 30px rgba(0,0,0,.45);width:210px;display:none}
#aa-share-panel.vis{display:block;animation:aa-up .28s ease}
.sp-ti{font-family:'Cinzel',Georgia,serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#7a4910;margin-bottom:10px}
.sp-x{position:absolute;top:6px;right:8px;background:none;border:none;font-size:1rem;color:#7a4910;cursor:pointer;padding:2px 6px}
.sp-a{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;margin-bottom:5px;border:1px solid rgba(122,73,16,.18);background:rgba(122,73,16,.05);border-radius:2px;font-family:'Cinzel',Georgia,serif;font-size:.56rem;letter-spacing:.1em;color:#4a3420;cursor:pointer;text-decoration:none;transition:background .18s}
.sp-a:hover{background:rgba(122,73,16,.13)}
.sp-divider{height:1px;background:rgba(122,73,16,.15);margin:8px 0}
#aa-share-btn{position:fixed;bottom:76px;right:20px;z-index:9998;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#1c3a1c,#2d5c2d);color:#fdf8ed;border:none;font-size:1.1rem;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;transition:transform .2s}
#aa-share-btn:hover{transform:scale(1.1)}

/* Find submission panel */
#aa-find-panel{position:fixed;inset:0;z-index:99998;display:none;align-items:center;justify-content:center;background:rgba(14,9,4,.85)}
#aa-find-panel.vis{display:flex;animation:aa-wt-in .35s ease}
@keyframes aa-wt-in{from{opacity:0}to{opacity:1}}
.fp-c{background:#fdf8ed;border-radius:4px;max-width:330px;width:92%;padding:26px 24px 20px;box-shadow:0 20px 60px rgba(0,0,0,.7),inset 0 0 0 1px rgba(122,73,16,.28)}
.fp-ti{font-family:'Cinzel',Georgia,serif;font-size:1rem;font-weight:700;color:#1c1208;margin-bottom:4px}
.fp-sub{font-family:'IM Fell English',Georgia,serif;font-style:italic;font-size:.82rem;color:#7a4910;margin-bottom:16px}
.fp-hr{height:1px;background:linear-gradient(90deg,transparent,rgba(122,73,16,.3),transparent);margin:0 0 16px}
.fp-lb{font-family:'Cinzel',Georgia,serif;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:#7a4910;display:block;margin-bottom:5px}
.fp-in,.fp-ta{width:100%;border:1px solid rgba(122,73,16,.3);background:#fdf6e3;border-radius:2px;padding:8px 10px;font-family:'Crimson Text',Georgia,serif;font-size:.9rem;color:#1c1208;margin-bottom:12px;outline:none}
.fp-in:focus,.fp-ta:focus{border-color:#c9933a}
.fp-ta{height:80px;resize:vertical}
.fp-bs{display:flex;gap:8px;margin-top:4px}
.fp-b{flex:1;padding:9px 0;border:none;border-radius:2px;font-family:'Cinzel',Georgia,serif;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:opacity .2s}
.fp-b:hover{opacity:.8}
.fp-cancel{background:rgba(122,73,16,.1);color:#7a4910;border:1px solid rgba(122,73,16,.2)}
.fp-submit{background:#7a4910;color:#fdf8ed}
.fp-thanks{text-align:center;padding:20px 0}
.fp-thanks .fp-ic{font-size:3rem;display:block;margin-bottom:10px}
.fp-thanks p{font-family:'IM Fell English',Georgia,serif;font-style:italic;color:#4a3420;font-size:.95rem;line-height:1.6}
</style>

<div id="aa-share-panel">
  <button class="sp-x" id="sp-x">×</button>
  <div class="sp-ti">⚔ Share &amp; Connect</div>
  <a class="sp-a" id="sp-reddit" href="#" target="_blank" rel="noopener"><span>🔴</span>Share on Reddit</a>
  <a class="sp-a" id="sp-fb" href="#" target="_blank" rel="noopener"><span>🔵</span>Share on Facebook</a>
  <a class="sp-a" id="sp-copy"><span>🔗</span>Copy Link</a>
  <div class="sp-divider"></div>
  <a class="sp-a" id="sp-find"><span>🪙</span>Submit a Find</a>
</div>

<button id="aa-share-btn" title="Share / Submit a Find">↗</button>

<div id="aa-find-panel">
  <div class="fp-c">
    <div class="fp-ti">🪙 Submit Your Find</div>
    <div class="fp-sub">Share a discovery with the Artifact Atlas community</div>
    <div class="fp-hr"></div>
    <div id="fp-form">
      <label class="fp-lb">What did you find?</label>
      <input class="fp-in" id="fp-item" type="text" placeholder="e.g. Confederate bullet, buckle, coin...">
      <label class="fp-lb">General location (county or region)</label>
      <input class="fp-in" id="fp-loc" type="text" placeholder="e.g. Johnston County, NC">
      <label class="fp-lb">Tell us about it (optional)</label>
      <textarea class="fp-ta" id="fp-desc" placeholder="Depth, soil type, nearby site..."></textarea>
      <div class="fp-bs">
        <button class="fp-b fp-cancel" id="fp-cancel">Cancel</button>
        <button class="fp-b fp-submit" id="fp-submit">Submit Find</button>
      </div>
    </div>
    <div class="fp-thanks" id="fp-thanks" style="display:none">
      <span class="fp-ic">🏆</span>
      <p>Thanks for sharing your find! The community appreciates it.<br><br>Keep hunting responsibly!</p>
      <button class="fp-b fp-submit" id="fp-done" style="margin-top:14px">Done</button>
    </div>
  </div>
</div>`;

    document.body.appendChild(wrap);

    const url = encodeURIComponent('https://play.google.com/store/apps/details?id=com.artifactatlas.guide');
    const txt = encodeURIComponent('Check out Artifact Atlas — free NC Civil War & relic hunting field guide with 70+ battlefield sites!');
    document.getElementById('sp-reddit').href = `https://www.reddit.com/submit?url=${url}&title=${txt}`;
    document.getElementById('sp-fb').href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

    const panel = document.getElementById('aa-share-panel');
    document.getElementById('aa-share-btn').onclick = () => panel.classList.toggle('vis');
    document.getElementById('sp-x').onclick = () => panel.classList.remove('vis');

    document.getElementById('sp-copy').onclick = (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(decodeURIComponent(url));
      const el = document.getElementById('sp-copy');
      el.innerHTML = '<span>✅</span>Copied!';
      setTimeout(() => { el.innerHTML = '<span>🔗</span>Copy Link'; }, 2000);
    };

    const findPanel = document.getElementById('aa-find-panel');
    document.getElementById('sp-find').onclick = (e) => {
      e.preventDefault();
      panel.classList.remove('vis');
      findPanel.classList.add('vis');
    };
    document.getElementById('fp-cancel').onclick = () => findPanel.classList.remove('vis');
    document.getElementById('fp-submit').onclick = () => {
      document.getElementById('fp-form').style.display = 'none';
      document.getElementById('fp-thanks').style.display = 'block';
      // Save to localStorage as community finds
      const finds = JSON.parse(localStorage.getItem('aa_finds') || '[]');
      finds.push({
        item: document.getElementById('fp-item').value,
        loc: document.getElementById('fp-loc').value,
        desc: document.getElementById('fp-desc').value,
        date: new Date().toLocaleDateString(),
      });
      localStorage.setItem('aa_finds', JSON.stringify(finds));
    };
    document.getElementById('fp-done').onclick = () => {
      findPanel.classList.remove('vis');
      document.getElementById('fp-form').style.display = 'block';
      document.getElementById('fp-thanks').style.display = 'none';
      document.getElementById('fp-item').value = '';
      document.getElementById('fp-loc').value = '';
      document.getElementById('fp-desc').value = '';
    };
  }

  function init() { setTimeout(buildShare, 600); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
})();
