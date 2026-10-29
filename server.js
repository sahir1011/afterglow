// Afterglow — tiny zero-dependency server.
// Serves the player from ./public and proxies YouTube calls so your API key never reaches the browser.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');

// --- load .env (KEY=value per line) ---
try {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* no .env yet */ }

const KEY = (process.env.YOUTUBE_API_KEY || '').trim();
const PORT = Number(process.env.PORT) || 5173;
const HAS_KEY = KEY.length > 20 && !KEY.startsWith('paste');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };

// --- cache API responses so repeat searches don't burn quota (one search = 100 of your 10,000 daily units) ---
const cache = new Map();
const TTL = 6 * 60 * 60 * 1000;
async function yt(endpoint, params) {
  const cacheKey = endpoint + '?' + new URLSearchParams(params);
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${new URLSearchParams({ ...params, key: KEY })}`);
  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body?.error?.message || 'YouTube request failed');
    err.status = res.status; err.reason = body?.error?.errors?.[0]?.reason || 'error';
    throw err;
  }
  cache.set(cacheKey, { t: Date.now(), v: body });
  return body;
}

const isoToSec = iso => { const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || ''); return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0; };
const JUNK = /\s*[([](?:official|lyric|lyrics|audio|video|music video|visuali[sz]er|hd|hq|4k|explicit|clean|full song|mv)[^)\]]*[)\]]/gi;
function toTrack(v) {
  const sn = v.snippet || {};
  const channel = (sn.channelTitle || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
  let title = (sn.title || '').replace(JUNK, '').replace(/\s*\|.*$/, '').trim();
  let artist = channel;
  const dash = title.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (dash) { artist = dash[1].trim(); title = dash[2].trim(); }
  const th = sn.thumbnails || {};
  return {
    id: v.id,
    title: title || sn.title || 'Untitled',
    artist: artist || 'Unknown artist',
    channel,
    thumb: (th.maxres || th.medium || th.high || th.default || {}).url || `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
    dur: isoToSec(v.contentDetails?.duration),
    views: Number(v.statistics?.viewCount || 0)
  };
}
async function details(ids) {
  if (!ids.length) return [];
  const d = await yt('videos', { part: 'snippet,contentDetails,statistics,status', id: ids.join(',') });
  return d.items.filter(v => v.status?.embeddable !== false).map(toTrack).filter(t => t.dur > 0);
}

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
const cleanId = s => (s || '').replace(/[^\w-]/g, '').slice(0, 20);

const ROUTES = {
  // ---- these work without a key ----
  async '/api/status'(res) { send(res, 200, { hasKey: HAS_KEY }); },

  // Title + channel for one video via oEmbed, so pasted links and starter picks always work.
  async '/api/info'(res, url) {
    const id = cleanId(url.searchParams.get('id'));
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}`);
    if (!r.ok) return send(res, 404, { error: 'That video is private, deleted, or blocks playback on other sites.' });
    const o = await r.json();
    send(res, 200, { track: toTrack({ id, snippet: { title: o.title, channelTitle: o.author_name, thumbnails: { medium: { url: `https://i.ytimg.com/vi/${id}/mqdefault.jpg` } } } }) });
  },

  // Same-origin copy of a thumbnail so the page can read its colours for theming.
  async '/api/thumb'(res, url) {
    const r = await fetch(`https://i.ytimg.com/vi/${cleanId(url.searchParams.get('id'))}/mqdefault.jpg`);
    if (!r.ok) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
    res.end(Buffer.from(await r.arrayBuffer()));
  },

  // ---- these need YOUTUBE_API_KEY ----
  async '/api/search'(res, url) {
    const q = (url.searchParams.get('q') || '').slice(0, 120).trim();
    if (!q) return send(res, 400, { error: 'Type something to search for.' });
    const params = { part: 'snippet', type: 'video', videoCategoryId: '10', videoEmbeddable: 'true', maxResults: '25', q };
    const page = url.searchParams.get('page'); if (page) params.pageToken = page;
    const s = await yt('search', params);
    const tracks = await details(s.items.map(i => i.id.videoId).filter(Boolean));
    send(res, 200, { tracks, next: s.nextPageToken || null });
  },
  async '/api/trending'(res, url) {
    const region = (url.searchParams.get('region') || 'US').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) || 'US';
    const d = await yt('videos', { part: 'snippet,contentDetails,statistics,status', chart: 'mostPopular', videoCategoryId: '10', regionCode: region, maxResults: '30' });
    send(res, 200, { tracks: d.items.filter(v => v.status?.embeddable !== false).map(toTrack) });
  }
};
const NEEDS_KEY = new Set(['/api/search', '/api/trending']);

async function api(res, url) {
  const route = ROUTES[url.pathname];
  if (!route) return send(res, 404, { error: 'Not found' });
  if (NEEDS_KEY.has(url.pathname) && !HAS_KEY) return send(res, 503, { error: 'Add your YouTube API key to the .env file, then restart the server.', reason: 'noKey' });
  try {
    await route(res, url);
  } catch (e) {
    const msg = e.reason === 'quotaExceeded' ? 'Daily YouTube search limit reached. It resets at midnight Pacific time.'
      : (e.reason === 'keyInvalid' || /api key/i.test(e.message)) ? 'YouTube rejected the API key. Check YOUTUBE_API_KEY in .env and restart.'
      : e.status ? e.message
      : 'Could not reach YouTube. Check your internet connection.';
    send(res, e.status || 502, { error: msg, reason: e.reason });
  }
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) return api(res, url);
  let file = path.normalize(path.join(PUBLIC, decodeURIComponent(url.pathname)));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  if (url.pathname === '/' || !path.extname(file)) file = path.join(PUBLIC, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Afterglow is running → http://127.0.0.1:${PORT}\n`);
  if (!HAS_KEY) console.log('  No YouTube API key yet: search and trending are off. Copy .env.example to .env and paste your key in.\n');
});
