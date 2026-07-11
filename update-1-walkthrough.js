/* ═══════════════════════════════════════════════════════
   ARTIFACT ATLAS — UPDATE 1 of 4
   Version: 1.1.0
   Feature: Dynamic Onboarding Walkthrough
   Deploy: Day 1-2 of testing window
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const KEY = 'aa_walkthrough_v1_done';

  const steps = [
    {
      icon: '⚔',
      title: 'Welcome to Artifact Atlas',
      body: 'Your ultimate field guide to North Carolina Civil War & Revolutionary War sites. Tap Next for a quick tour.',
    },
    {
      icon: '🗺',
      title: 'Interactive Battlefield Map',
      body: 'Explore 70+ historical sites across NC. Tap any marker to see detailed history, terrain notes, and relic hunting guidance.',
    },
    {
      icon: '📖',
      title: 'Site Encyclopedia',
      body: 'Browse battlefields, camps, forts, and naval sites. Filter by Civil War or Revolutionary War era.',
    },
    {
      icon: '⚖',
      title: 'Legal Relic Hunting Guide',
      body: 'Know before you dig. We cover NC state land rules, federal site regulations, and responsible detecting practices.',
    },
    {
      icon: '🤝',
      title: 'Community Forum',
      body: 'Connect with NC relic hunters. Share your finds, ask questions, and get field tips from the community.',
    },
    {
      icon: '🏆',
      title: "You're Ready!",
      body: 'Tap any site on the map to begin exploring. Happy hunting — always hunt responsibly!',
    },
  ];

  function launch() {
    if (localStorage.getItem(KEY)) return;

    const overlay = document.createElement('div');
    overlay.id = 'aa-wt';
    overlay.innerHTML = `
<style>
#aa-wt{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(14,9,4,.88);animation:wt-in .4s ease}
@keyframes wt-in{from{opacity:0}to{opacity:1}}
@keyframes wt-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.wt-c{background:#fdf8ed;border-radius:4px;max-width:320px;width:90%;padding:30px 26px 22px;box-shadow:0 20px 60px rgba(0,0,0,.7),inset 0 0 0 1px rgba(122,73,16,.3);animation:wt-up .35s cubic-bezier(.23,1,.32,1)}
.wt-ic{font-size:3rem;text-align:center;display:block;margin-bottom:12px}
.wt-ti{font-family:'Cinzel',Georgia,serif;font-size:1.05rem;font-weight:700;color:#1c1208;text-align:center;margin-bottom:8px;line-height:1.3}
.wt-hr{height:1px;background:linear-gradient(90deg,transparent,rgba(122,73,16,.3),transparent);margin:0 0 14px}
.wt-bo{font-family:'IM Fell English',Georgia,serif;font-style:italic;font-size:.93rem;color:#4a3420;text-align:center;line-height:1.65;margin-bottom:20px}
.wt-pr{display:flex;justify-content:center;gap:7px;margin-bottom:18px}
.wt-d{width:7px;height:7px;border-radius:50%;background:rgba(122,73,16,.22);transition:all .25s;border:none;cursor:pointer;padding:0}
.wt-d.on{background:#c9933a;transform:scale(1.4)}
.wt-bs{display:flex;gap:9px}
.wt-b{flex:1;padding:9px 0;border:none;border-radius:2px;font-family:'Cinzel',Georgia,serif;font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;transition:opacity .2s}
.wt-b:hover{opacity:.8}
.wt-sk{background:rgba(122,73,16,.1);color:#7a4910;border:1px solid rgba(122,73,16,.22)}
.wt-nx{background:#7a4910;color:#fdf8ed}
</style>
<div class="wt-c" id="wt-card">
  <span class="wt-ic" id="wt-ic"></span>
  <div class="wt-ti" id="wt-ti"></div>
  <div class="wt-hr"></div>
  <div class="wt-bo" id="wt-bo"></div>
  <div class="wt-pr" id="wt-pr"></div>
  <div class="wt-bs">
    <button class="wt-b wt-sk" id="wt-sk">Skip</button>
    <button class="wt-b wt-nx" id="wt-nx">Next →</button>
  </div>
</div>`;

    document.body.appendChild(overlay);
    let cur = 0;

    function dots() {
      document.getElementById('wt-pr').innerHTML =
        steps.map((_,i) => `<button class="wt-d${i===cur?' on':''}" aria-label="Step ${i+1}"></button>`).join('');
      document.querySelectorAll('.wt-d').forEach((d,i) => d.addEventListener('click', () => go(i)));
    }

    function go(i) {
      cur = i;
      const s = steps[i];
      document.getElementById('wt-ic').textContent = s.icon;
      document.getElementById('wt-ti').textContent = s.title;
      document.getElementById('wt-bo').textContent = s.body;
      document.getElementById('wt-nx').textContent = i === steps.length-1 ? "Let's Go! ⚔" : 'Next →';
      dots();
      const c = document.getElementById('wt-card');
      c.style.animation = 'none'; void c.offsetWidth;
      c.style.animation = 'wt-up .3s cubic-bezier(.23,1,.32,1)';
    }

    function done() {
      localStorage.setItem(KEY,'1');
      overlay.style.cssText += 'opacity:0;transition:opacity .35s';
      setTimeout(() => overlay.remove(), 380);
    }

    document.getElementById('wt-sk').onclick = done;
    document.getElementById('wt-nx').onclick = () => cur < steps.length-1 ? go(cur+1) : done();
    go(0);
  }

  // Help button — always visible to replay tour
  function helpBtn() {
    if (document.getElementById('aa-help')) return;
    const b = document.createElement('button');
    b.id = 'aa-help';
    b.textContent = '?';
    b.title = 'Replay tour';
    b.style.cssText = 'position:fixed;bottom:24px;right:20px;z-index:9998;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7a4910,#c97820);color:#fdf8ed;border:none;font-size:1.3rem;font-weight:700;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;transition:transform .2s;font-family:Georgia,serif';
    b.onmouseenter = () => b.style.transform = 'scale(1.1)';
    b.onmouseleave = () => b.style.transform = 'scale(1)';
    b.onclick = () => { localStorage.removeItem(KEY); launch(); };
    document.body.appendChild(b);
  }

  function init() {
    setTimeout(() => { launch(); helpBtn(); }, 900);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
