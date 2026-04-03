// popup.js

const PRESETS = [
  { username: 'TradingTerminal', displayName: 'Trading Terminal', avatar: 'https://unavatar.io/x/TradingTerminal' },
  { username: 'gmgnai',          displayName: 'GMGN AI',          avatar: 'https://unavatar.io/x/gmgnai' },
  { username: 'rainbetcom',      displayName: 'Rainbet',           avatar: 'https://unavatar.io/x/rainbetcom' },
  { username: 'Stake',           displayName: 'Stake',             avatar: 'https://unavatar.io/x/Stake' },
  { username: 'bcgame',          displayName: 'BC.Game',           avatar: 'https://unavatar.io/x/bcgame' },
  { username: 'AxiomExchange',   displayName: 'Axiom',             avatar: 'https://unavatar.io/x/AxiomExchange' },
  { username: 'Spumpio',         displayName: 'Spump.io',          avatar: 'https://unavatar.io/x/Spumpio' },
  { username: 'luckio',          displayName: 'Luck.io',           avatar: 'https://unavatar.io/x/luckio' },
  { username: 'pip_world',       displayName: 'PiP World',         avatar: 'https://unavatar.io/x/pip_world' },
  { username: 'OnlyFans',        displayName: 'OnlyFans',          avatar: 'https://unavatar.io/x/OnlyFans' },
  { username: 'Flipgg_',         displayName: 'Flip.gg',           avatar: 'https://unavatar.io/x/Flipgg_' },
  { username: 'cysic_xyz',       displayName: 'Cysic',             avatar: 'https://unavatar.io/x/cysic_xyz' },
];

let enabledUsernames = new Set();
let customBadges = [];

const presetList  = document.getElementById('presetList');
const customPanel = document.getElementById('customPanel');
const countBadge  = document.getElementById('countBadge');
const urlInput    = document.getElementById('urlInput');
const addBtn      = document.getElementById('addBtn');
const toastEl     = document.getElementById('toast');
const byLink      = document.getElementById('byLink');

// ── Footer link ──────────────────────────────────────────────────────────────
byLink.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://x.com/loshmi297' });
});

// ── Tabs ─────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// ── Count ─────────────────────────────────────────────────────────────────────
function updateCount() {
  const n = enabledUsernames.size + customBadges.length;
  countBadge.textContent = n + ' hidden';
  countBadge.className = 'count-badge' + (n > 0 ? ' live' : '');
}

// ── Render presets ────────────────────────────────────────────────────────────
function renderPresets() {
  presetList.innerHTML = '';
  PRESETS.forEach(preset => {
    const on = enabledUsernames.has(preset.username.toLowerCase());
    const row = document.createElement('div');
    row.className = 'preset-item' + (on ? ' on' : '');

    const img = document.createElement('img');
    img.className = 'preset-avatar';
    img.src = preset.avatar;
    img.alt = '';
    img.onerror = () => { img.style.opacity = '0.2'; };

    const text = document.createElement('div');
    text.className = 'preset-text';
    text.innerHTML = `<div class="preset-name">${preset.displayName}</div><div class="preset-handle">@${preset.username}</div>`;

    const tog = document.createElement('div');
    tog.className = 'tog';

    row.appendChild(img);
    row.appendChild(text);
    row.appendChild(tog);

    row.addEventListener('click', () => {
      const nowOn = !row.classList.contains('on');
      row.classList.toggle('on', nowOn);
      chrome.runtime.sendMessage({ action: 'toggleUsername', username: preset.username, enabled: nowOn }, () => {
        if (nowOn) enabledUsernames.add(preset.username.toLowerCase());
        else enabledUsernames.delete(preset.username.toLowerCase());
        updateCount();
        toast(nowOn ? `@${preset.username} blocked` : `@${preset.username} unblocked`);
      });
    });

    presetList.appendChild(row);
  });
}

// ── Render custom ─────────────────────────────────────────────────────────────
function renderCustom() {
  customPanel.innerHTML = '';
  if (!customBadges.length) {
    customPanel.innerHTML = '<div class="custom-empty">No custom badges yet.<br>Right-click a badge on X<br>or paste a URL below.</div>';
    return;
  }
  const label = document.createElement('div');
  label.className = 'custom-section-label';
  label.textContent = 'Blocked by URL';
  customPanel.appendChild(label);

  customBadges.forEach(badge => {
    const item = document.createElement('div');
    item.className = 'custom-item';

    const img = document.createElement('img');
    img.className = 'custom-thumb';
    img.src = badge.url;
    img.onerror = () => { img.style.opacity = '0.2'; };

    const info = document.createElement('div');
    info.className = 'custom-info';
    info.innerHTML = `<div class="custom-label">${badge.label || 'Badge'}</div><div class="custom-url">${badge.url.replace('https://pbs.twimg.com/profile_images/', '…/')}</div>`;

    const btn = document.createElement('button');
    btn.className = 'rm-btn';
    btn.innerHTML = '&times;';
    btn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'removeBadge', url: badge.url }, () => {
        customBadges = customBadges.filter(b => b.url !== badge.url);
        renderCustom();
        updateCount();
        toast('Removed');
      });
    });

    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(btn);
    customPanel.appendChild(item);
  });
}

// ── Add URL ───────────────────────────────────────────────────────────────────
addBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url || !url.startsWith('http')) { toast('Invalid URL'); return; }
  chrome.runtime.sendMessage({ action: 'addBadgeManual', url, label: 'Custom Badge' }, res => {
    if (res?.success) {
      urlInput.value = '';
      loadAll(() => { renderCustom(); updateCount(); toast('Added'); });
    } else { toast(res?.reason || 'Error'); }
  });
});
urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addBtn.click(); });

// ── Load & init ───────────────────────────────────────────────────────────────
function loadAll(cb) {
  chrome.runtime.sendMessage({ action: 'getAll' }, res => {
    enabledUsernames = new Set((res?.blockedUsernames || []).map(u => u.toLowerCase()));
    customBadges = res?.blockedBadges || [];
    if (cb) cb();
  });
}

loadAll(() => { renderPresets(); renderCustom(); updateCount(); });
