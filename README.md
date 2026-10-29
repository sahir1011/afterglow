# Afterglow

A free music player with a wild UI. It plays music from YouTube, and its colours change to match each song.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer. There's nothing to install. In this folder, run:

```bash
npm start
```

Then open http://127.0.0.1:5173

Without any setup you can already play the starter picks, or paste any YouTube or YouTube Music link (press Ctrl+V anywhere on the page).

## Turn on search (free, about 3 minutes)

1. Open https://console.cloud.google.com/apis/library/youtube.googleapis.com, sign in, create a project if asked, and press **Enable**.
2. Go to **APIs & Services → Credentials → Create credentials → API key**, and copy the key.
3. Copy `.env.example` to `.env`, then paste the key after `YOUTUBE_API_KEY=`.
4. Restart the server (press Ctrl+C, then run `npm start` again).

The key stays on your computer. The server makes the YouTube calls, so the key never reaches the browser, and `.env` is in `.gitignore`.

**Daily limit:** the free key gives you 10,000 units a day. One search uses 100 units, so you get about 100 new searches a day. Repeating a search uses no units, because the server remembers results for 6 hours. Playing songs uses no units at all.

## Features

- Search all of YouTube's music, see what's trending in your country, and pick from 16 mood shortcuts
- Liked Songs, your own playlists, a queue ("Play next" and "Add to queue"), and Recently played. All of these are saved in your browser.
- Shuffle and repeat (all, or one song)
- The colour theme comes from each song's thumbnail
- Vibe mode, full screen with flowing lights (press `V`)
- Keyboard: `Space` play or pause · `←` `→` skip 5 seconds · `Shift+←` `Shift+→` previous or next song · `/` search · `Esc` close

## Things to know

- YouTube's rules say the video has to stay visible while it plays. So it sits in the Now Playing panel, or in a floating card on smaller screens.
- Some music videos are blocked from playing outside youtube.com. When one of those comes up, Afterglow skips it automatically.
- There may be ads on some videos, because YouTube controls those.
