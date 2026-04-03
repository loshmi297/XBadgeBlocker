// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "blockBadge",
    title: "🚫 Block this badge (X Badge Blocker)",
    contexts: ["image"],
    documentUrlPatterns: ["https://x.com/*", "https://twitter.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "blockBadge" && info.srcUrl) {
    const url = info.srcUrl;
    chrome.storage.local.get({ blockedBadges: [] }, (data) => {
      const badges = data.blockedBadges;
      if (!badges.find(b => b.url === url)) {
        const parts = url.split('/');
        const label = parts[parts.length - 1].split('?')[0].replace(/\.[^.]+$/, '').slice(0, 30) || 'Badge';
        badges.push({ url, label, addedAt: Date.now() });
        chrome.storage.local.set({ blockedBadges: badges }, () => {
          notifyTabs(tab.id);
        });
      }
    });
  }
});

function notifyTabs(specificTabId) {
  const msg = { action: 'blocksUpdated' };
  if (specificTabId) {
    chrome.tabs.sendMessage(specificTabId, msg).catch(() => {});
  }
  chrome.tabs.query({ url: ["https://x.com/*", "https://twitter.com/*"] }, (tabs) => {
    tabs.forEach(t => {
      if (t.id !== specificTabId) chrome.tabs.sendMessage(t.id, msg).catch(() => {});
    });
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getAll') {
    chrome.storage.local.get({ blockedBadges: [], blockedUsernames: [] }, (data) => {
      sendResponse(data);
    });
    return true;
  }

  if (msg.action === 'toggleUsername') {
    chrome.storage.local.get({ blockedUsernames: [] }, (data) => {
      let list = data.blockedUsernames;
      const username = msg.username.toLowerCase();
      if (msg.enabled) {
        if (!list.includes(username)) list.push(username);
      } else {
        list = list.filter(u => u !== username);
      }
      chrome.storage.local.set({ blockedUsernames: list }, () => {
        notifyTabs(null);
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (msg.action === 'removeBadge') {
    chrome.storage.local.get({ blockedBadges: [] }, (data) => {
      const updated = data.blockedBadges.filter(b => b.url !== msg.url);
      chrome.storage.local.set({ blockedBadges: updated }, () => {
        notifyTabs(null);
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (msg.action === 'addBadgeManual') {
    chrome.storage.local.get({ blockedBadges: [] }, (data) => {
      const badges = data.blockedBadges;
      if (!badges.find(b => b.url === msg.url)) {
        badges.push({ url: msg.url, label: msg.label || 'Custom Badge', addedAt: Date.now() });
        chrome.storage.local.set({ blockedBadges: badges }, () => {
          notifyTabs(null);
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, reason: 'Already blocked' });
      }
    });
    return true;
  }
});
