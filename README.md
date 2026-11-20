# 🎤 Karaoke Queue

A karaoke queue for parties that needs no server. Put `index.html` on the TV. Guests scan the QR code and type the songs they want to sing. The TV finds a karaoke video for each one and plays them in order.

## Put it on GitHub Pages (about 2 minutes)

1. Create a new **public** repository on GitHub, for example `karaoke`.
2. Click **Add file → Upload files** and drag in all of these files: `index.html`, `join.html`, `common.js`, `style.css`, `README.md`. Commit.
3. Go to **Settings → Pages**. Under "Build and deployment", set **Source: Deploy from a branch**, **Branch: `main` / `(root)`**, then **Save**.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/karaoke/`.

## Running a party

1. On the computer connected to the TV, open `https://YOUR-USERNAME.github.io/karaoke/` and click **Start the party**. The click is required so the browser allows sound.
2. Guests scan the QR code, or go to `.../join.html` and type the 4-letter room code.
3. Guests enter their name and type a song and artist, like *Dancing Queen ABBA*, then tap **Add**. Pasting a YouTube link works too.
4. When it's their turn, the TV searches YouTube for a karaoke version that's allowed to play on other sites, skipping channels that block it, like Sing King and KaraFun. If the video still won't play, it tries the next result. Before each song, a "Next up on the mic" screen with a countdown shows who's singing, and the singer's phone buzzes.

### Host controls (move the mouse to show them)
| Key | Action |
|---|---|
| Space | Pause / resume |
| N or → | Skip to the next song |
| Q | Open the queue (reorder, remove, play now, add a song) |
| F | Fullscreen |

**⚙ Settings** has the countdown length, the YouTube API key, a new room code option and a "clear queue" button.

## Fast song search with a party password
The TV can search YouTube through a private Cloudflare Worker (`worker.js`, deployed as **karaoke-search**). The Worker holds the YouTube API key as a secret, so the key never reaches a browser. The TV only needs the **party password**: type it once on the start screen, or under ⚙ Settings. The browser remembers it, and its password manager can save and fill it.

To set up the Worker: in Cloudflare open **Workers & Pages → karaoke-search → Settings → Variables and Secrets** and add two **Secrets**:
- `YT_API_KEY`: your YouTube Data API v3 key
- `PARTY_PASSWORD`: any password you like

Without the password the TV falls back to free public search mirrors, which are slower and less reliable. Searches through the Worker are cached for a day to save the free YouTube quota (about 100 new searches a day).

## Good to know
- **The big-screen tab must stay open.** It holds the queue, which is also saved in that browser, so a refresh keeps it.
- Phones connect directly to the TV browser over WebRTC using [PeerJS](https://peerjs.com/)'s free public connection broker. Being on the same Wi-Fi works best; cellular usually works too.
- **Blocked videos:** many YouTube uploads, including all Sing King and KaraFun videos, can't play on other sites. The TV only picks videos YouTube says are allowed, and if one still fails (age or region limits) it moves on to the next result. If nothing works, it shows **Open on YouTube** and **Skip**.
- Opening `index.html` straight from your computer (`file://`) won't produce a working QR code. Use the GitHub Pages URL.
