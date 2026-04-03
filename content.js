// content.js - X Badge Blocker
(function () {
  'use strict';

  let blockedUsernames = new Set();
  let blockedImageUrls = new Set();
  let hiddenCount = 0;
  let observer = null;

  function normalizeUsername(str) {
    return str.replace(/^@/, '').toLowerCase().trim();
  }

  function loadBlocks(callback) {
    chrome.storage.local.get({ blockedBadges: [], blockedUsernames: [] }, (data) => {
      blockedUsernames = new Set((data.blockedUsernames || []).map(normalizeUsername));
      blockedImageUrls = new Set((data.blockedBadges || []).map(b => b.url));
      if (callback) callback();
    });
  }

  function isBlockedHref(href) {
    if (!href || !blockedUsernames.size) return false;
    const match = href.match(/(?:x\.com\/|twitter\.com\/|^\/?)([A-Za-z0-9_]+)/);
    if (!match) return false;
    const username = normalizeUsername(match[1]);
    const reserved = new Set(['home','explore','notifications','messages','search','i','settings','compose','intent','hashtag','share','status','lists','bookmarks','more','following','followers']);
    if (reserved.has(username)) return false;
    return blockedUsernames.has(username);
  }

  function isBlockedImageUrl(src) {
    if (!src || !blockedImageUrls.size) return false;
    const normalize = u => u.split('?')[0].replace(/_\d+x\d+|_normal|_bigger|_mini|_reasonably_small/, '');
    const normSrc = normalize(src);
    for (const url of blockedImageUrls) {
      if (normalize(url) === normSrc) return true;
    }
    return false;
  }

  function hasBadge(root) {
    const userNameEl = root.querySelector('[data-testid="UserName"]');
    if (!userNameEl) return false;

    // Check links by href (username-based — most reliable)
    const links = userNameEl.querySelectorAll('a[href]');
    for (const link of links) {
      if (isBlockedHref(link.getAttribute('href') || '')) return true;
    }

    // Check images by URL (right-click added)
    const imgs = userNameEl.querySelectorAll('img[src*="pbs.twimg.com"]');
    for (const img of imgs) {
      if (isBlockedImageUrl(img.src)) return true;
    }

    return false;
  }

  function getTweetContainer(el) {
    let node = el;
    while (node && node !== document.body) {
      if (node.tagName === 'ARTICLE') return node;
      if (node.getAttribute?.('data-testid') === 'cellInnerDiv') return node;
      node = node.parentElement;
    }
    return null;
  }

  function hideTweet(container) {
    if (container.dataset.badgeBlocked) return;
    container.dataset.badgeBlocked = '1';
    hiddenCount++;
    notifyCount();

    container.style.transition = 'opacity 0.2s ease, max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease';
    container.style.overflow = 'hidden';
    container.style.opacity = '0';
    container.style.maxHeight = container.offsetHeight + 'px';
    setTimeout(() => { container.style.maxHeight = '0'; container.style.margin = '0'; container.style.padding = '0'; }, 30);
    setTimeout(() => { container.style.display = 'none'; }, 350);
  }

  function restoreAll() {
    document.querySelectorAll('[data-badge-blocked]').forEach(el => {
      el.removeAttribute('data-badge-blocked');
      el.style.cssText = '';
    });
    hiddenCount = 0;
    notifyCount();
  }

  function notifyCount() {
    chrome.runtime.sendMessage({ action: 'updateCount', count: hiddenCount }).catch(() => {});
  }

  function scanElement(el) {
    if (!blockedUsernames.size && !blockedImageUrls.size) return;
    if (hasBadge(el)) {
      const container = getTweetContainer(el.querySelector('[data-testid="UserName"]') || el);
      if (container) hideTweet(container);
    }
  }

  function scanAll() {
    document.querySelectorAll('article:not([data-badge-blocked])').forEach(scanElement);
  }

  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.tagName === 'ARTICLE') { scanElement(node); continue; }
          node.querySelectorAll?.('article').forEach(scanElement);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'blocksUpdated') {
      loadBlocks(() => { restoreAll(); scanAll(); });
    }
  });

  loadBlocks(() => { scanAll(); startObserver(); });

  const origPush = history.pushState.bind(history);
  history.pushState = function (...args) {
    origPush(...args);
    setTimeout(() => { restoreAll(); loadBlocks(() => scanAll()); }, 600);
  };
  window.addEventListener('popstate', () => {
    setTimeout(() => { restoreAll(); loadBlocks(() => scanAll()); }, 600);
  });
})();
