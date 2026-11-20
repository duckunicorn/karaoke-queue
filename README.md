# 🎤 Karaoke Queue

A karaoke queue for parties that needs no server. Put `index.html` on the TV. Guests scan the QR code, add YouTube karaoke videos from their phones, and each song plays automatically when the one before it ends.

## Put it on GitHub Pages (about 2 minutes)

1. Create a new **public** repository on GitHub, for example `karaoke`.
2. Click **Add file → Upload files** and drag in all of these files: `index.html`, `join.html`, `common.js`, `style.css`, `README.md`. Commit.
3. Go to **Settings → Pages**. Under "Build and deployment", set **Source: Deploy from a branch**, **Branch: `main` / `(root)`**, then **Save**.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/karaoke/`.

## Running a party

1. On the computer connected to the TV, open `https://YOUR-USERNAME.github.io/karaoke/` and click **Start the party**. The click is required so the browser allows sound.
2. Guests scan the QR code, or go to `.../join.html` and type the 4-letter room code.
3. Guests enter their name and add a song:
   - **Without an API key (default):** they type a song and tap **Find**, which opens a YouTube search. They copy the video link, paste it back in, and tap **Add**.
   - **With an API key:** they search and tap **Add** without leaving the page. See below.
4. Before each song, a "Next up on the mic" screen with a countdown shows who's singing. The singer's phone also buzzes.

### Host controls (move the mouse to show them)
| Key | Action |
|---|---|
| Space | Pause / resume |
| N or → | Skip to the next song |
| Q | Open the queue (reorder, remove, play now, add a song) |
| F | Fullscreen |

**⚙ Settings** has the countdown length, the YouTube API key, a new room code option and a "clear queue" button.

## Optional: in-app song search
1. Go to the [Google Cloud console](https://console.cloud.google.com/), create a project, and enable **YouTube Data API v3**.
2. Under **Credentials**, choose **Create credentials → API key**. It's best to restrict the key to the YouTube Data API.
3. On the big screen, open **⚙ Settings** and paste the key. It's stored only in that browser and is never sent to phones; searches run on the TV's browser.

The free quota allows roughly 100 searches a day. Search results only include videos that allow embedding.

## Good to know
- **The big-screen tab must stay open.** It holds the queue, which is also saved in that browser, so a refresh keeps it.
- Phones connect directly to the TV browser over WebRTC using [PeerJS](https://peerjs.com/)'s free public connection broker. Being on the same Wi-Fi works best; cellular usually works too.
- **Blocked videos:** some YouTube owners turn off playback on other sites. The site checks every link before it's added, and a blocked one is refused on the guest's phone with a request to pick another version. If a video still fails at play time (age or region limits), the TV finds another version automatically when you've added an API key. Otherwise it shows **Open on YouTube** (plays it in a new window; close the window when the song ends to continue) and **Skip**. Note that **Sing King and KaraFun block this**, so the Find button leaves them out of the YouTube search. Zoom Karaoke, Atomic Karaoke, Party Tyme, Easy Karaoke and most smaller karaoke channels work.
- Opening `index.html` straight from your computer (`file://`) won't produce a working QR code. Use the GitHub Pages URL.
