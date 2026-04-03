// popup.js

// ── Preset badge accounts ──────────────────────────────────────────────────────
const PRESETS = [
  {
    username: 'TradingTerminal',
    displayName: 'Trading Terminal',
    description: 'Trading tools platform',
    avatar: 'https://unavatar.io/x/TradingTerminal'
  },
  {
    username: 'gmgnai',
    displayName: 'GMGN AI',
    description: 'On-chain trading analytics',
    avatar: 'https://unavatar.io/x/gmgnai'
  },
  {
    username: 'rainbetcom',
    displayName: 'Rainbet',
    description: 'Crypto casino',
    avatar: 'https://unavatar.io/x/rainbetcom'
  },
  {
    username: 'Stake',
    displayName: 'Stake',
    description: 'Crypto gambling platform',
    avatar: 'https://unavatar.io/x/Stake'
  },
  {
    username: 'bcgame',
    displayName: 'BC.Game',
    description: 'Crypto casino',
    avatar: 'https://unavatar.io/x/bcgame'
  },
  {
    username: 'AxiomExchange',
    displayName: 'Axiom',
    description: 'On-chain trading terminal',
    avatar: 'https://unavatar.io/x/AxiomExchange'
  },
  {
    username: 'Spumpio',
    displayName: 'Spump.io',
    description: 'Token launchpad',
    avatar: 'https://unavatar.io/x/Spumpio'
  },
  {
    username: 'luckio',
    displayName: 'Luck.io',
    description: 'Crypto gaming',
    avatar: 'https://unavatar.io/x/luckio'
  }
];

// ── State ──────────────────────────────────────────────────────────────────────
let enabledUsernames = new Set();
let customBadges = [];

// ── DOM refs ───────────────────────────────────────────────────────────────────
const presetsList  = document.getElementById('presetsList');
const customList   = document.getElementById('customList');
const totalPill    = document.getElementById('totalPill');
const urlInput     = document.getElementById('urlInput');
const addBtn       = document.getElementById('addBtn');
const toastEl      = document.getElementById('toast');

// ── Toast ──────────────────────────────────────────────────────────────────────
function showToast(msg, isError = false) {
  toastEl.textContent = msg;
  toastEl.className = 'toast ' + (isError ? 'err' : 'ok') + ' show';
  setTimeout(() => { toastEl.className = 'toast ' + (isError ? 'err' : 'ok'); }, 2000);
}

// ── Tabs ───────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// ── Pill count ─────────────────────────────────────────────────────────────────
function updatePill() {
  const total = enabledUsernames.size + customBadges.length;
  totalPill.textContent = total + ' blocked';
  totalPill.className = 'pill' + (total > 0 ? ' active' : '');
}

// ── Render Presets ─────────────────────────────────────────────────────────────
function renderPresets() {
  presetsList.innerHTML = '';

  PRESETS.forEach(preset => {
    const isOn = enabledUsernames.has(preset.username.toLowerCase());

    const item = document.createElement('div');
    item.className = 'preset-item' + (isOn ? ' checked' : '');

    const img = document.createElement('img');
    img.className = 'preset-avatar';
    img.src = preset.avatar;
    img.alt = preset.displayName;
    img.onerror = () => { img.src = ''; img.style.background = '#27272f'; };

    const info = document.createElement('div');
    info.className = 'preset-info';

    const name = document.createElement('div');
    name.className = 'preset-name';
    name.textContent = preset.displayName;

    const handle = document.createElement('div');
    handle.className = 'preset-handle';
    handle.textContent = '@' + preset.username;

    info.appendChild(name);
    info.appendChild(handle);

    const toggle = document.createElement('div');
    toggle.className = 'toggle';

    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(toggle);

    item.addEventListener('click', () => {
      const nowOn = !item.classList.contains('checked');
      item.classList.toggle('checked', nowOn);

      chrome.runtime.sendMessage({
        action: 'toggleUsername',
        username: preset.username,
        enabled: nowOn
      }, () => {
        if (nowOn) {
          enabledUsernames.add(preset.username.toLowerCase());
          showToast('@' + preset.username + ' blocked');
        } else {
          enabledUsernames.delete(preset.username.toLowerCase());
          showToast('@' + preset.username + ' unblocked');
        }
        updatePill();
      });
    });

    presetsList.appendChild(item);
  });
}

// ── Render Custom ──────────────────────────────────────────────────────────────
function renderCustom() {
  customList.innerHTML = '';

  if (customBadges.length === 0) {
    customList.innerHTML = '<div class="empty-state">No custom badges yet.<br>Right-click a badge on X<br>or add a URL below.</div>';
    return;
  }

  const label = document.createElement('div');
  label.className = 'section-label';
  label.textContent = 'Blocked by Image URL';
  customList.appendChild(label);

  customBadges.forEach(badge => {
    const item = document.createElement('div');
    item.className = 'custom-item';

    const img = document.createElement('img');
    img.className = 'custom-thumb';
    img.src = badge.url;
    img.onerror = () => { img.style.opacity = '0.3'; };

    const info = document.createElement('div');
    info.className = 'custom-info';

    const lbl = document.createElement('div');
    lbl.className = 'custom-label';
    lbl.textContent = badge.label || 'Badge';

    const url = document.createElement('div');
    url.className = 'custom-url';
    url.textContent = badge.url.replace('https://pbs.twimg.com/profile_images/', '…/');

    info.appendChild(lbl);
    info.appendChild(url);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'removeBadge', url: badge.url }, () => {
        customBadges = customBadges.filter(b => b.url !== badge.url);
        renderCustom();
        updatePill();
        showToast('Badge removed');
      });
    });

    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(removeBtn);
    customList.appendChild(item);
  });
}

// ── Add manual URL ─────────────────────────────────────────────────────────────
addBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) { showToast('Enter a URL', true); return; }
  if (!url.startsWith('http')) { showToast('Invalid URL', true); return; }

  chrome.runtime.sendMessage({ action: 'addBadgeManual', url, label: 'Custom Badge' }, (res) => {
    if (res?.success) {
      urlInput.value = '';
      loadAll(() => { renderCustom(); updatePill(); showToast('Badge added ✓'); });
    } else {
      showToast(res?.reason || 'Error', true);
    }
  });
});
urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addBtn.click(); });

// ── Load all state ─────────────────────────────────────────────────────────────
function loadAll(callback) {
  chrome.runtime.sendMessage({ action: 'getAll' }, (res) => {
    enabledUsernames = new Set((res?.blockedUsernames || []).map(u => u.toLowerCase()));
    customBadges = res?.blockedBadges || [];
    if (callback) callback();
  });
}

// ── Init ───────────────────────────────────────────────────────────────────────
loadAll(() => {
  renderPresets();
  renderCustom();
  updatePill();
});
