# 🚫 X Badge Blocker

A lightweight Chrome extension that hides tweets from accounts displaying specific affiliate project badges on X (Twitter).

Tired of your feed being flooded by KOL affiliates of the same 10 crypto projects? This cleans it up.

---

## What it does

X lets accounts display affiliate badges next to their username — small icons linking to projects like Stake, GMGN, Axiom, Rainbet and others. X Badge Blocker detects those badges in your feed and silently removes those tweets before you ever see them.

No account blocking. No X API. No login required. Runs entirely in your browser.

---

## Installation

> ⚠️ This extension is not on the Chrome Web Store. You need to load it manually — takes about 30 seconds.

**1. Download**

Click the green **Code** button at the top of this page → **Download ZIP** → unzip the folder somewhere permanent on your computer (don't delete it after installing).

**2. Open Chrome Extensions**

Go to `chrome://extensions/` in your browser address bar.

**3. Enable Developer Mode**

Toggle **Developer mode** on in the top right corner.

**4. Load the extension**

Click **Load unpacked** → navigate to and select the `x-badge-blocker` folder you unzipped.

**5. Done**

The extension icon appears in your toolbar. Open it and start blocking.

> Works on Chrome, Brave, and Edge.

---

## How to use

### Block a preset badge (easiest)

Click the extension icon → **⚡ Presets** tab → toggle any account on. That's it.

Presets included:

| Account | Category |
|---|---|
| @TradingTerminal | Trading tools |
| @gmgnai | On-chain analytics |
| @rainbetcom | Crypto casino |
| @Stake | Crypto gambling |
| @bcgame | Crypto casino |
| @AxiomExchange | Trading terminal |
| @Spumpio | Token launchpad |
| @luckio | Crypto gaming |

### Block any other badge

On X, **right-click** the small affiliate badge icon next to a username → **"🚫 Block this badge (X Badge Blocker)"**.

Alternatively, open the extension → **🔧 Custom** tab → paste the badge image URL and click Add.

### Unblock

Open the extension → toggle off (presets) or click × (custom).

---

## How it works

The extension scans tweets as they load and checks the username row for affiliate badge links. If a badge links to a blocked account, the tweet fades out and collapses. It covers your main feed, search results, profile pages, and infinite scroll.

It does **not** block accounts on X itself — it only filters your local view. No data leaves your browser.

---

## Notes

- After installing, refresh any open X tabs for the extension to activate
- If X updates their layout and blocking stops working, open an issue and I'll push a fix
- Badge detection is based on the affiliate's profile link, not their avatar image — so it won't break if they change their profile picture

---

## License

MIT — do whatever you want with it.
