(() => {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => {
  s = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`;
};
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16M9 4v16M14 4l6 16"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7.2 3.8 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.4 0 5.6 3.2 4.4 6.6C19.5 15.4 12 20 12 20z"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.6-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5.5" y="4" width="4.5" height="16" rx="1.2"/><rect x="14" y="4" width="4.5" height="16" rx="1.2"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5.2v13.6a.8.8 0 0 0 1.2.7l10.2-6.8a.8.8 0 0 0 0-1.4L6.2 4.5A.8.8 0 0 0 5 5.2z"/><rect x="17" y="4.5" width="2.6" height="15" rx="1"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5.2v13.6a.8.8 0 0 1-1.2.7L7.6 12.7a.8.8 0 0 1 0-1.4l10.2-6.8a.8.8 0 0 1 1.2.7z"/><rect x="4.4" y="4.5" width="2.6" height="15" rx="1"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
  vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  queue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h13M3 12h13M3 18h8M18 15v6M15 18h6"/></svg>',
  nextUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11M3 12h7M3 18h7"/><path d="M15 11v8l6-4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>'
};

/* ================= data ================= */
// Starter picks play without an API key (only search and trending need one).
const STARTERS = [
  ['OPf0YbXqDm0', 'Uptown Funk', 'Mark Ronson ft. Bruno Mars'],
  ['fJ9rUzIMcZQ', 'Bohemian Rhapsody', 'Queen'],
  ['JGwWNGJdvx8', 'Shape of You', 'Ed Sheeran'],
  ['kJQP7kiw5Fk', 'Despacito', 'Luis Fonsi ft. Daddy Yankee'],
  ['60ItHLz5WEA', 'Faded', 'Alan Walker'],
  ['hT_nvWreIhg', 'Counting Stars', 'OneRepublic'],
  ['YQHsXMglC9A', 'Hello', 'Adele'],
  ['dQw4w9WgXcQ', 'Never Gonna Give You Up', 'Rick Astley']
].map(([id, title, artist]) => ({ id, title, artist, channel: artist, thumb: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`, dur: 0, views: 0 }));
const MOODS = [
  ['Pop hits', 'top pop hits', '#ff4fa3', '#ffb84f'], ['Lo-fi beats', 'lofi hip hop beats', '#ff9e6b', '#5b3f9f'],
  ['Bollywood', 'bollywood hits', '#ff3b5c', '#ffb84f'], ['Hip-hop', 'hip hop hits', '#7a1fd1', '#ff3b5c'],
  ['Workout', 'workout gym music', '#ff6a3d', '#ffd23f'], ['Chill', 'chill vibes music', '#19e0c8', '#2a56ff'],
  ['Phonk', 'phonk music', '#3b0a45', '#ff2e63'], ['K-pop', 'kpop hits', '#ff9df0', '#6a5cff'],
  ['Punjabi', 'punjabi hits', '#ffb84f', '#e8364f'], ['Synthwave', 'synthwave', '#ff4fa3', '#6a5cff'],
  ['Rock classics', 'classic rock hits', '#a83232', '#2b2b2b'], ['Afrobeats', 'afrobeats hits', '#2fd36b', '#ffb84f'],
  ['Deep house', 'deep house mix', '#2152ff', '#19e0c8'], ['Jazz', 'jazz classics', '#c99a5b', '#3a2a5c'],
  ['R&B', 'rnb hits', '#9b4dff', '#ff6fb5'], ['Acoustic', 'acoustic covers', '#d9a066', '#5b7a3f']
];
const region = ((navigator.language || 'en-US').split('-')[1] || 'US').toUpperCase();
let regionName = region; try { regionName = new Intl.DisplayNames(['en'], { type: 'region' }).of(region); } catch {}

const S = { hasKey: false, view: { type: 'home' }, queue: [], from: '', track: null, playing: false, loading: false,
  shuffle: store.get('ag2-shuf', false), repeat: store.get('ag2-rep', 0), volume: store.get('ag2-vol', 80), muted: false };
let liked = store.get('ag2-liked', []);
let playlists = store.get('ag2-pls', []);
let recent = store.get('ag2-recent', []);
const trending = { tracks: [], loading: false, err: null };
const search = { q: '', tracks: [], next: null, loading: false, err: null };

const REG = new Map();
const reg = t => { const o = REG.get(t.id); if (o) { if (!o.dur && t.dur) o.dur = t.dur; if (!o.views && t.views) o.views = t.views; return o; } REG.set(t.id, t); return t; };
const regAll = l => l.map(reg);
liked = regAll(liked); recent = regAll(recent); playlists.forEach(p => p.tracks = regAll(p.tracks));
regAll(STARTERS);
const plain = t => ({ id: t.id, title: t.title, artist: t.artist, channel: t.channel, thumb: t.thumb, dur: t.dur || 0, views: t.views || 0 });
const save = () => { store.set('ag2-liked', liked.map(plain)); store.set('ag2-pls', playlists.map(p => ({ ...p, tracks: p.tracks.map(plain) }))); store.set('ag2-recent', recent.map(plain)); };
const isLiked = id => liked.some(t => t.id === id);

async function api(path) {
  const r = await fetch(path);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || 'Something went wrong. Try again.'), { reason: j.reason });
  return j;
}
function listFor(key) {
  if (key === 'liked') return liked;
  if (key === 'recent') return recent;
  if (key === 'starters') return STARTERS;
  if (key === 'trending') return trending.tracks;
  if (key === 'search') return search.tracks;
  if (key === 'queue') return S.queue;
  if (key.startsWith('pl:')) return playlists.find(p => p.id === key.slice(3))?.tracks || [];
  if (key.startsWith('one:')) { const t = REG.get(key.slice(4)); return t ? [t] : []; }
  return [];
}
function nameFor(key) {
  if (key === 'liked') return 'Liked Songs';
  if (key === 'recent') return 'Recently played';
  if (key === 'starters') return 'Starter picks';
  if (key === 'trending') return `Trending in ${regionName}`;
  if (key === 'search') return `Search: ${search.q}`;
  if (key.startsWith('pl:')) return playlists.find(p => p.id === key.slice(3))?.name || 'Playlist';
  return 'Now playing';
}
function currentList() {
  const v = S.view;
  if (v.type === 'playlist') return ['pl:' + v.id, listFor('pl:' + v.id)];
  if (v.type === 'liked' && liked.length) return ['liked', liked];
  if (v.type === 'search' && search.tracks.length) return ['search', search.tracks];
  if (trending.tracks.length) return ['trending', trending.tracks];
  return ['starters', STARTERS];
}

/* ================= YouTube player ================= */
let yt = null, ytReady = false, pendingId = null, errStreak = 0;
window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player('yt', {
    width: '100%', height: '100%',
    playerVars: { playsinline: 1, rel: 0, controls: 0, disablekb: 1, iv_load_policy: 3, fs: 0, origin: location.origin },
    events: {
      onReady() { ytReady = true; applyVol(); if (pendingId) { yt.loadVideoById(pendingId); pendingId = null; } },
      onStateChange(e) {
        const st = e.data;
        if (st === 1) {
          S.playing = true; S.loading = false; errStreak = 0;
          const d = yt.getDuration();
          if (S.track && d && Math.abs((S.track.dur || 0) - d) > 2) { S.track.dur = d; save(); }
        } else if (st === 2) { S.playing = false; S.loading = false; }
        else if (st === 3) { S.loading = true; }
        else if (st === 0) { S.playing = false; next(true); }
        syncState();
      },
      onError() {
        S.loading = false; S.playing = false; errStreak++;
        if (errStreak < 5 && S.queue.length > 1) { toast('This one only plays on YouTube itself. Skipping to the next song.'); setTimeout(() => next(true, true), 1200); }
        else toast('This video only plays on YouTube itself. Try another song.');
        syncState();
      }
    }
  });
};
function load(id) { if (ytReady) yt.loadVideoById(id); else pendingId = id; }
function playTrack(t, list, from) {
  t = reg(t);
  if (list) { S.queue = list.slice(); S.from = from || ''; }
  if (!S.queue.some(x => x.id === t.id)) { S.queue = [t]; S.from = from || ''; }
  S.track = t; S.loading = true; S.playing = false;
  recent = [t, ...recent.filter(x => x.id !== t.id)].slice(0, 30); save();
  load(t.id); onTrackChange();
}
function toggle() {
  if (!S.track) {
    const [key, l] = currentList();
    if (l.length) playTrack(S.shuffle ? l[Math.floor(Math.random() * l.length)] : l[0], l, key);
    return;
  }
  if (!ytReady) return;
  const st = yt.getPlayerState();
  if (st === 1 || st === 3) yt.pauseVideo(); else yt.playVideo();
}
const curTime = () => (ytReady && S.track && yt.getCurrentTime) ? yt.getCurrentTime() || 0 : 0;
const curDur = () => S.track ? (S.track.dur || (ytReady && yt.getDuration ? yt.getDuration() : 0) || 0) : 0;
function seekTo(sec) { if (!ytReady || !S.track) return; yt.seekTo(Math.max(0, Math.min(sec, curDur() - 1)), true); }
function next(auto, skipping) {
  if (!S.track) return;
  if (auto && !skipping && S.repeat === 2) { seekTo(0); yt.playVideo(); return; }
  const q = S.queue, i = q.findIndex(x => x.id === S.track.id);
  let j;
  if (S.shuffle && q.length > 1) { do j = Math.floor(Math.random() * q.length); while (j === i); }
  else j = i + 1;
  if (j >= q.length) {
    if (S.repeat === 1 || !auto) j = 0;
    else { S.playing = false; syncState(); return; }
  }
  playTrack(q[j]);
}
function prev() {
  if (!S.track) return;
  if (curTime() > 3) { seekTo(0); return; }
  const q = S.queue, i = q.findIndex(x => x.id === S.track.id);
  playTrack(q[(i - 1 + q.length) % q.length]);
}
function applyVol() {
  const v = S.muted ? 0 : S.volume;
  $('#vol').value = S.volume; $('#vol').style.setProperty('--p', v + '%');
  $('#muteb').innerHTML = v === 0 ? I.mute : I.vol; $('#muteb').setAttribute('aria-label', S.muted ? 'Unmute' : 'Mute');
  if (ytReady) { yt.setVolume(S.volume); S.muted ? yt.mute() : yt.unMute(); }
}

/* ================= colour theming from the thumbnail ================= */
const DEF = ['hsl(330 100% 65%)', 'hsl(246 100% 68%)', 'hsl(36 100% 65%)'];
let PAL = DEF.slice();
function themeFrom(t) {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = 32; c.height = 18;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, 32, 18);
    let d; try { d = g.getImageData(0, 0, 32, 18).data; } catch { return; }
    const B = Array.from({ length: 12 }, () => ({ w: 0, h: 0, s: 0, l: 0 }));
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), l = (mx + mn) / 2, dl = mx - mn;
      if (dl < .06) continue;
      const s = dl / (1 - Math.abs(2 * l - 1));
      let h = mx === r ? ((gg - b) / dl) % 6 : mx === gg ? (b - r) / dl + 2 : (r - gg) / dl + 4; h = (h * 60 + 360) % 360;
      const w = s * s * (1 - Math.abs(l - .5) * 1.6) + .01, k = Math.floor(h / 30) % 12;
      B[k].w += w; B[k].h += h * w; B[k].s += s * w; B[k].l += l * w;
    }
    const top = B.filter(b => b.w > .5).sort((a, b) => b.w - a.w).slice(0, 3).map(b => [b.h / b.w, b.s / b.w]);
    if (!top.length) return;
    while (top.length < 3) top.push([(top[0][0] + (top.length === 1 ? 45 : -55) + 360) % 360, top[0][1]]);
    PAL = top.map(([h, s], i) => `hsl(${Math.round(h)} ${Math.round(Math.max(s, .62) * 100)}% ${[62, 58, 66][i]}%)`);
    const r = document.documentElement;
    r.style.setProperty('--c1', PAL[0]); r.style.setProperty('--c2', PAL[1]); r.style.setProperty('--c3', PAL[2]);
  };
  img.src = '/api/thumb?id=' + encodeURIComponent(t.id);
}

/* ================= views ================= */
const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const plDur = l => { const s = l.reduce((a, t) => a + (t.dur || 0), 0); return `${l.length} song${l.length === 1 ? '' : 's'}${s ? `, ${s >= 3600 ? Math.floor(s / 3600) + ' hr ' : ''}${Math.round(s % 3600 / 60)} min` : ''}`; };
const mosaic = (l, cls = '') => {
  const th = [...new Set(l.map(t => t.thumb))].slice(0, 4);
  if (!th.length) return `<div class="mosaic empty ${cls}">${I.music}</div>`;
  if (th.length < 4) return `<div class="mosaic one ${cls}"><img src="${esc(th[0])}" alt=""></div>`;
  return `<div class="mosaic ${cls}">${th.map(s => `<img src="${esc(s)}" alt="">`).join('')}</div>`;
};
const setupCard = () => `<section class="setup">
  <h3>Turn on search: one free key, about 3 minutes</h3>
  <p>Starter picks and pasted YouTube links already work. To search every song on YouTube and see what's trending, Afterglow needs a free YouTube Data API key.</p>
  <ol>
    <li>Open <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener">YouTube Data API v3 in Google Cloud</a>, sign in, create a project if asked, and press <b>Enable</b>.</li>
    <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Credentials</a> → <b>Create credentials</b> → <b>API key</b>, and copy it.</li>
    <li>In the <code>afterglow</code> folder, copy <code>.env.example</code> to <code>.env</code> and paste the key after <code>YOUTUBE_API_KEY=</code>.</li>
    <li>Stop the server and run <code>npm start</code> again, then refresh this page.</li>
  </ol>
</section>`;
function rows(list, key) {
  return `<div class="tracks" role="list">
    <div class="thead"><span>#</span><span>Title</span><span class="ha">Channel</span><span class="hp">Plays</span><span></span><span></span><span>Time</span></div>
    ${list.map((t, i) => `<div class="row" role="listitem" tabindex="0" data-act="play-track" data-tid="${esc(t.id)}" data-list="${esc(key)}">
      <span class="n"><b>${i + 1}</b><i class="eq"><s></s><s></s><s></s><s></s></i>${I.play}</span>
      <span class="t"><img src="${esc(t.thumb)}" alt="" loading="lazy"><span><strong>${esc(t.title)}</strong><em>${esc(t.artist)}</em></span></span>
      <span class="al">${esc(t.channel || t.artist)}</span>
      <span class="pl">${t.views ? compact.format(t.views) : '—'}</span>
      <button class="like" data-act="like" data-id="${esc(t.id)}" aria-pressed="${isLiked(t.id)}" aria-label="Save ${esc(t.title)} to Liked Songs">${I.heart}</button>
      <button class="more" data-act="menu" data-id="${esc(t.id)}" data-list="${esc(key)}" aria-label="More options for ${esc(t.title)}" aria-haspopup="menu">${I.dots}</button>
      <span class="d">${t.dur ? fmt(t.dur) : '—'}</span>
    </div>`).join('')}
  </div>`;
}
const card = (t, key, i, rank) => `<div class="card" role="button" tabindex="0" data-act="play-track" data-tid="${esc(t.id)}" data-list="${key}">
  <div class="art"><img src="${esc(t.thumb)}" alt="" loading="lazy">${rank ? `<span class="rank">${i + 1}</span>` : ''}<span class="fab" aria-hidden="true">${I.play}</span></div>
  <strong>${esc(t.title)}</strong><em>${esc(t.artist)}</em></div>`;
const moodGrid = () => `<div class="moods">${MOODS.map(([n, q, a, b]) => `<button class="mood" data-act="mood" data-q="${esc(q)}" style="background:linear-gradient(135deg, ${a}, ${b})">${n}</button>`).join('')}</div>`;
const skeleton = n => Array.from({ length: n }, () => '<div class="skel"></div>').join('');

function renderMain() {
  const v = S.view, m = $('#main'); let h = '';
  if (v.type === 'home') {
    const quick = (recent.length ? recent : STARTERS).slice(0, 6);
    h = `<div class="view">
      <h1 class="hello">${greet()}, <span>what's the mood?</span></h1>
      <form class="paste" id="paste-form"><label class="field">${I.link}<span class="sr">YouTube link</span><input id="paste" placeholder="Paste a YouTube or YouTube Music link" autocomplete="off"></label><button class="solid" type="submit">Play it</button></form>
      ${S.hasKey ? '' : setupCard()}
      <section><div class="sec-h"><h2>${recent.length ? 'Jump back in' : 'Start here'}</h2></div>
        <div class="quick">${quick.map(t => `<button class="tile" data-act="play-track" data-tid="${esc(t.id)}" data-list="${recent.length ? 'recent' : 'starters'}"><img src="${esc(t.thumb)}" alt=""><span><strong>${esc(t.title)}</strong><em>${esc(t.artist)}</em></span><i class="fab" aria-hidden="true">${I.play}</i></button>`).join('')}</div>
      </section>
      ${S.hasKey ? `<section><div class="sec-h"><h2>Trending in ${esc(regionName)}</h2><small>YouTube music chart, updated daily</small></div>
        ${trending.err ? `<p class="hint">${esc(trending.err)}</p>` : trending.loading && !trending.tracks.length ? skeleton(2) : `<div class="cards">${trending.tracks.slice(0, 12).map((t, i) => card(t, 'trending', i, true)).join('')}</div>`}
      </section>` : ''}
      <section><div class="sec-h"><h2>Pick a mood</h2>${S.hasKey ? '' : '<small>Needs the free key above</small>'}</div>${moodGrid()}</section>
      <section><div class="sec-h"><h2>Starter picks</h2><small>Play right now, no setup</small></div><div class="cards">${STARTERS.map((t, i) => card(t, 'starters', i)).join('')}</div></section>
    </div>`;
  } else if (v.type === 'search') {
    h = `<div class="view">
      <form id="search-form"><label class="search">${I.search}<span class="sr">Search</span><input id="q" type="search" placeholder="What do you want to listen to?" value="${esc(search.q)}" autocomplete="off" enterkeyhint="search"></label>
      <div class="hint">Press Enter to search. You can also paste a YouTube link here.</div></form>
      <div id="sres"></div></div>`;
  } else if (v.type === 'liked') {
    h = `<div class="view"><header class="phead"><div class="cv heart">${I.heart}</div>
        <div><div class="eyebrow">Playlist</div><h1>Liked Songs</h1><span class="meta">${plDur(liked)} · saved in this browser</span></div></header>
      ${liked.length ? `<div class="actions"><button class="fab" data-act="play-list" data-list="liked" aria-label="Play Liked Songs">${I.play}</button><button class="icon-btn ${S.shuffle ? 'on' : ''}" data-act="shuffle" aria-label="Shuffle">${I.shuffle}</button></div>${rows(liked, 'liked')}`
      : `<div class="empty">${I.heart}<h3>Songs you like will live here</h3><p>Tap the heart on any song to save it.</p><button class="ghost" data-act="nav" data-v="search">Find something</button></div>`}</div>`;
  } else if (v.type === 'library') {
    h = `<div class="view">
      <section><div class="sec-h"><h2>Your library</h2><button class="ghost" data-act="new-pl">New playlist</button></div>
      <div class="cards">
        <div class="card" role="button" tabindex="0" data-act="nav" data-v="liked"><div class="art"><div class="mosaic empty" style="aspect-ratio:1;border-radius:12px;background:linear-gradient(135deg,var(--c2),var(--c1));color:#fff">${I.heart}</div></div><strong>Liked Songs</strong><em>${plDur(liked)}</em></div>
        ${playlists.map(p => `<div class="card" role="button" tabindex="0" data-act="open-pl" data-id="${p.id}"><div class="art">${mosaic(p.tracks).replace('class="mosaic', 'style="aspect-ratio:1;border-radius:12px" class="mosaic')}</div><strong>${esc(p.name)}</strong><em>${plDur(p.tracks)}</em></div>`).join('')}
      </div></section>
      ${recent.length ? `<section><div class="sec-h"><h2>Recently played</h2></div>${rows(recent.slice(0, 15), 'recent')}</section>` : ''}
    </div>`;
  } else if (v.type === 'playlist') {
    const p = playlists.find(x => x.id === v.id);
    if (!p) { S.view = { type: 'library' }; return renderMain(); }
    h = `<div class="view"><header class="phead">${mosaic(p.tracks, 'cv')}
        <div><div class="eyebrow">Playlist</div><h1>${esc(p.name)}</h1><span class="meta">${plDur(p.tracks)}</span></div></header>
      <div class="actions">
        ${p.tracks.length ? `<button class="fab" data-act="play-list" data-list="pl:${p.id}" aria-label="Play ${esc(p.name)}">${I.play}</button><button class="icon-btn ${S.shuffle ? 'on' : ''}" data-act="shuffle" aria-label="Shuffle">${I.shuffle}</button>` : ''}
        <button class="ghost" data-act="rename-pl" data-id="${p.id}">Rename</button><button class="ghost" data-act="delete-pl" data-id="${p.id}">Delete</button>
      </div>
      ${p.tracks.length ? rows(p.tracks, 'pl:' + p.id) : `<div class="empty">${I.music}<h3>This playlist is empty</h3><p>Use the ••• button on any song and choose this playlist to add it.</p><button class="ghost" data-act="nav" data-v="search">Find songs</button></div>`}
    </div>`;
  }
  m.innerHTML = h; m.scrollTop = 0;
  if (v.type === 'search') {
    renderSearch();
    const q = $('#q'); q.focus();
    $('#search-form').addEventListener('submit', e => { e.preventDefault(); const val = q.value.trim(); if (ytId(val)) playLink(val); else runSearch(val); });
  }
  const pf = $('#paste-form'); if (pf) pf.addEventListener('submit', e => { e.preventDefault(); playLink($('#paste').value); });
  renderSide(); syncState();
}
function renderSearch() {
  const box = $('#sres'); if (!box) return;
  if (!S.hasKey) { box.innerHTML = setupCard(); return; }
  if (search.loading && !search.tracks.length) box.innerHTML = skeleton(8);
  else if (search.err) box.innerHTML = `<div class="empty">${I.search}<h3>Search didn't work</h3><p>${esc(search.err)}</p></div>`;
  else if (search.tracks.length) box.innerHTML = `<div class="sec-h"><h2>Songs</h2><small>Results for “${esc(search.q)}”</small></div>${rows(search.tracks, 'search')}
      ${search.next ? `<div class="more-row"><button class="ghost" data-act="more-results">${search.loading ? 'Loading…' : 'Show more'}</button></div>` : ''}`;
  else if (search.q && !search.loading) box.innerHTML = `<div class="empty">${I.search}<h3>Nothing for “${esc(search.q)}”</h3><p>Check the spelling or try the artist's name.</p></div>`;
  else box.innerHTML = `<div class="sec-h"><h2>Browse all</h2></div>${moodGrid()}`;
  syncState();
}
async function runSearch(q, more) {
  q = (q || '').trim(); if (!q) return;
  if (S.view.type !== 'search') { S.view = { type: 'search' }; search.q = q; renderMain(); }
  if (!S.hasKey) return;
  if (!more) { search.q = q; search.tracks = []; search.next = null; }
  search.loading = true; search.err = null; renderSearch();
  try {
    const j = await api(`/api/search?q=${encodeURIComponent(q)}${more && search.next ? '&page=' + encodeURIComponent(search.next) : ''}`);
    if (search.q !== q) return;
    const seen = new Set(search.tracks.map(t => t.id));
    search.tracks = search.tracks.concat(regAll(j.tracks).filter(t => !seen.has(t.id)));
    search.next = j.next;
  } catch (e) { search.err = e.message; }
  search.loading = false; renderSearch();
}
function renderSide() {
  const nv = [['home', 'Home', I.home], ['search', 'Search', I.search], ['library', 'Your Library', I.library]];
  const on = S.view.type === 'playlist' || S.view.type === 'liked' ? 'library' : S.view.type;
  $('#nav').innerHTML = nv.map(([v, l, ic]) => `<button data-act="nav" data-v="${v}" class="${on === v ? 'on' : ''}" aria-label="${l}">${ic}<span>${l}</span></button>`).join('');
  $('#plist').innerHTML = [`<li><button data-act="nav" data-v="liked" class="${S.view.type === 'liked' ? 'on' : ''}"><span class="ph">${I.heart}</span><span><strong>Liked Songs</strong><em>Playlist · ${liked.length} songs</em></span></button></li>`]
    .concat(playlists.map(p => `<li><button data-act="open-pl" data-id="${p.id}" class="${S.view.type === 'playlist' && S.view.id === p.id ? 'on' : ''}">${mosaic(p.tracks)}<span><strong>${esc(p.name)}</strong><em>Playlist · ${p.tracks.length} songs</em></span></button></li>`))
    .concat(playlists.length ? [] : [`<li><button data-act="new-pl"><span class="ph" style="background:rgba(255,255,255,.08);color:var(--mute)">${I.plus}</span><span><strong>Create a playlist</strong><em>It's easy, we'll help</em></span></button></li>`])
    .join('');
}
const miniRow = (x, key) => `<button class="mini" data-act="play-track" data-tid="${esc(x.id)}" data-list="${key}"><img src="${esc(x.thumb)}" alt=""><span><strong>${esc(x.title)}</strong><em>${esc(x.artist)}</em></span></button>`;
function renderNP() {
  const t = S.track;
  $('#np-empty').hidden = !!t;
  $('#np-from').textContent = t ? (S.from ? 'Playing from ' + nameFor(S.from) : 'Now playing') : 'Now playing';
  if (!t) {
    $('#np-info').innerHTML = `<div><h3>Nothing playing</h3><p>Pick a song, or press space.</p></div>`;
    $('#upnext').innerHTML = `<h4>Try one</h4>${STARTERS.slice(0, 5).map(x => miniRow(x, 'starters')).join('')}`;
    return;
  }
  $('#np-info').innerHTML = `<div><h3>${esc(t.title)}</h3><p>${esc(t.artist)}</p></div><button class="like" data-act="like" data-id="${esc(t.id)}" aria-pressed="${isLiked(t.id)}" aria-label="Save to Liked Songs">${I.heart}</button>`;
  const q = S.queue, i = q.findIndex(x => x.id === t.id), nx = [];
  for (let k = 1; k < Math.min(8, q.length); k++) { const j = i + k; if (j < q.length || S.repeat === 1) nx.push(q[j % q.length]); }
  $('#upnext').innerHTML = `<h4>Up next</h4>${nx.length ? nx.map(x => miniRow(x, 'queue')).join('') : '<p>The queue ends here.</p>'}`;
}
function renderNow() {
  const t = S.track;
  $('#now').innerHTML = t
    ? `<img src="${esc(t.thumb)}" alt=""><span><strong>${esc(t.title)}</strong><em>${esc(t.artist)}</em></span><button class="like" data-act="like" data-id="${esc(t.id)}" aria-pressed="${isLiked(t.id)}" aria-label="Save to Liked Songs">${I.heart}</button>`
    : `<span class="ph">${I.music}</span><span><strong>Afterglow</strong><em>Press play to start the music</em></span>`;
}
function onTrackChange() {
  const t = S.track;
  document.title = `${t.title} · ${t.artist}`;
  themeFrom(t);
  renderNow(); renderNP(); syncState();
  $('#vibet').textContent = t.title; $('#vibes').textContent = t.artist;
  $('#vibebg').style.backgroundImage = `url("${t.thumb}")`;
  if (S.view.type === 'library') renderMain();
}
function syncState() {
  document.body.classList.toggle('playing', S.playing);
  const pi = S.playing ? I.pause : I.play;
  const pb = $('#playb'); pb.innerHTML = pi; pb.classList.toggle('loading', S.loading && !S.playing); pb.setAttribute('aria-label', S.playing ? 'Pause' : 'Play');
  $('#vibeplay').innerHTML = pi;
  const id = S.track?.id;
  document.querySelectorAll('.row, .tile, .mini, .card[data-tid]').forEach(el => el.classList.toggle('cur', !!id && el.dataset.tid === id));
  document.querySelectorAll('.tile .fab, .card[data-tid] .fab').forEach(el => el.innerHTML = el.closest('.cur') && S.playing ? I.pause : I.play);
  document.querySelectorAll('[data-act="like"]').forEach(b => b.setAttribute('aria-pressed', isLiked(b.dataset.id)));
  $('#shuf').classList.toggle('on', S.shuffle); $('#shuf').setAttribute('aria-pressed', S.shuffle);
  $('#rep').classList.toggle('on', S.repeat > 0);
  $('#rep').innerHTML = I.repeat + (S.repeat === 2 ? '<span class="one">1</span>' : '');
  $('#rep').setAttribute('aria-label', ['Repeat off', 'Repeat all', 'Repeat one'][S.repeat]);
  if (!S.track) document.title = 'Afterglow';
}

/* ================= links ================= */
function ytId(s) {
  s = (s || '').trim();
  const m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/|music\.youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/);
  return m ? m[1] : null;
}
async function playLink(s) {
  const id = ytId(s);
  if (!id) { toast('Paste a full YouTube link, like youtube.com/watch?v=…'); return; }
  try {
    const { track } = await api('/api/info?id=' + id);
    playTrack(track, [reg(track)], 'one:' + id);
    const p = $('#paste'); if (p) p.value = '';
  } catch (e) { toast(e.message); }
}

/* ================= menu + modal ================= */
const menu = $('#menu');
function openMenu(btn, t, key) {
  const inPl = key.startsWith('pl:') ? playlists.find(p => p.id === key.slice(3)) : null;
  menu.innerHTML = `
    <button data-act="m-next" role="menuitem">${I.nextUp}Play next</button>
    <button data-act="m-queue" role="menuitem">${I.queue}Add to queue</button>
    <button data-act="like" data-id="${esc(t.id)}" role="menuitem">${I.heart}${isLiked(t.id) ? 'Remove from Liked Songs' : 'Save to Liked Songs'}</button>
    <hr><div class="lbl">Add to playlist</div>
    ${playlists.filter(p => p !== inPl).map(p => `<button data-act="m-add" data-pl="${p.id}" role="menuitem">${I.music}${esc(p.name)}</button>`).join('')}
    <button data-act="m-new" role="menuitem">${I.plus}New playlist…</button>
    <hr>
    ${inPl ? `<button data-act="m-remove" data-pl="${inPl.id}" role="menuitem">${I.trash}Remove from this playlist</button>` : ''}
    <a href="https://www.youtube.com/watch?v=${encodeURIComponent(t.id)}" target="_blank" rel="noopener" role="menuitem">${I.out}Open on YouTube</a>`;
  menu.dataset.id = t.id;
  menu.hidden = false;
  const r = btn.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
  menu.style.left = Math.max(8, Math.min(r.right - mw, innerWidth - mw - 8)) + 'px';
  menu.style.top = (r.bottom + mh + 8 > innerHeight ? Math.max(8, r.top - mh - 6) : r.bottom + 6) + 'px';
  menu.querySelector('button')?.focus({ preventScroll: true });
}
const closeMenu = () => { menu.hidden = true; };
let modalResolve = null;
function modal({ title, value = '', button = 'Create', input = true }) {
  $('#modal-title').textContent = title;
  const inp = $('#modal-input'); inp.hidden = !input; inp.value = value;
  $('#modal-form .solid').textContent = button;
  $('#modal').hidden = false;
  setTimeout(() => (input ? inp : $('#modal-form .solid')).focus(), 30);
  return new Promise(res => { modalResolve = res; });
}
function closeModal(v) { $('#modal').hidden = true; if (modalResolve) { modalResolve(v); modalResolve = null; } }
$('#modal-form').addEventListener('submit', e => { e.preventDefault(); closeModal($('#modal-input').hidden ? true : $('#modal-input').value.trim() || null); });
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(null); });
async function newPlaylist(withTrack) {
  const name = await modal({ title: 'New playlist', value: `My Playlist #${playlists.length + 1}` });
  if (!name) return;
  const p = { id: Date.now().toString(36), name: name.slice(0, 60), tracks: withTrack ? [withTrack] : [] };
  playlists.push(p); save();
  toast(withTrack ? `Added to ${p.name}` : `Created ${p.name}`);
  if (withTrack) { renderSide(); } else { S.view = { type: 'playlist', id: p.id }; renderMain(); }
}

/* ================= events ================= */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2800); }

document.addEventListener('click', async e => {
  if (!menu.hidden && !e.target.closest('#menu') && !e.target.closest('[data-act="menu"]')) closeMenu();
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, mt = REG.get(menu.dataset.id);
  switch (a) {
    case 'nav': S.view = { type: el.dataset.v }; renderMain(); break;
    case 'open-pl': S.view = { type: 'playlist', id: el.dataset.id }; renderMain(); break;
    case 'play-list': { const l = listFor(el.dataset.list); if (l.length) playTrack(S.shuffle ? l[Math.floor(Math.random() * l.length)] : l[0], l, el.dataset.list); break; }
    case 'play-track': {
      const t = REG.get(el.dataset.tid); if (!t) return;
      if (S.track && S.track.id === t.id) { toggle(); return; }
      const key = el.dataset.list;
      key === 'queue' ? playTrack(t) : playTrack(t, listFor(key), key);
      break;
    }
    case 'toggle': toggle(); break;
    case 'next': next(); break;
    case 'prev': prev(); break;
    case 'shuffle': S.shuffle = !S.shuffle; store.set('ag2-shuf', S.shuffle); document.querySelectorAll('[data-act="shuffle"]').forEach(b => b.classList.toggle('on', S.shuffle)); syncState(); toast(S.shuffle ? 'Shuffle on' : 'Shuffle off'); break;
    case 'repeat': S.repeat = (S.repeat + 1) % 3; store.set('ag2-rep', S.repeat); syncState(); renderNP(); break;
    case 'like': {
      e.stopPropagation();
      const t = REG.get(el.dataset.id); if (!t) return;
      if (isLiked(t.id)) liked = liked.filter(x => x.id !== t.id); else liked = [t, ...liked];
      save(); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
      toast(isLiked(t.id) ? 'Saved to Liked Songs' : 'Removed from Liked Songs');
      closeMenu();
      if (S.view.type === 'liked') renderMain(); else { renderSide(); syncState(); }
      break;
    }
    case 'menu': e.stopPropagation(); if (!menu.hidden && menu.dataset.id === el.dataset.id) closeMenu(); else openMenu(el, REG.get(el.dataset.id), el.dataset.list); break;
    case 'm-next': case 'm-queue': {
      closeMenu(); if (!mt) return;
      if (!S.track) { playTrack(mt, [mt]); return; }
      S.queue = S.queue.filter(x => x.id !== mt.id || x.id === S.track.id);
      const i = S.queue.findIndex(x => x.id === S.track.id);
      a === 'm-next' ? S.queue.splice(i + 1, 0, mt) : S.queue.push(mt);
      renderNP(); toast(a === 'm-next' ? 'Playing next' : 'Added to queue'); break;
    }
    case 'm-add': {
      closeMenu(); const p = playlists.find(x => x.id === el.dataset.pl); if (!p || !mt) return;
      if (p.tracks.some(x => x.id === mt.id)) { toast(`Already in ${p.name}`); return; }
      p.tracks.push(mt); save(); renderSide(); toast(`Added to ${p.name}`);
      break;
    }
    case 'm-new': closeMenu(); if (mt) newPlaylist(mt); break;
    case 'm-remove': {
      closeMenu(); const p = playlists.find(x => x.id === el.dataset.pl); if (!p || !mt) return;
      p.tracks = p.tracks.filter(x => x.id !== mt.id); save(); renderMain(); toast(`Removed from ${p.name}`);
      break;
    }
    case 'new-pl': newPlaylist(); break;
    case 'rename-pl': {
      const p = playlists.find(x => x.id === el.dataset.id); if (!p) return;
      const name = await modal({ title: 'Rename playlist', value: p.name, button: 'Save' });
      if (name) { p.name = name.slice(0, 60); save(); renderMain(); }
      break;
    }
    case 'delete-pl': {
      const p = playlists.find(x => x.id === el.dataset.id); if (!p) return;
      const ok = await modal({ title: `Delete “${p.name}”?`, input: false, button: 'Delete' });
      if (ok) { playlists = playlists.filter(x => x !== p); save(); S.view = { type: 'library' }; renderMain(); toast('Playlist deleted'); }
      break;
    }
    case 'modal-cancel': closeModal(null); break;
    case 'mood': runSearch(el.dataset.q); break;
    case 'more-results': runSearch(search.q, true); break;
    case 'vibe': openVibe(); break;
    case 'close-vibe': closeVibe(); break;
    case 'mute': S.muted = !S.muted; applyVol(); break;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!$('#modal').hidden) return closeModal(null); if (!menu.hidden) return closeMenu(); if (!$('#vibe').hidden) return closeVibe(); }
  const tag = (e.target.tagName || '').toLowerCase();
  if (!$('#modal').hidden || (tag === 'input' && e.target.type !== 'range')) return;
  if (e.key === 'Enter' && e.target.matches('.row, .card')) { e.target.click(); return; }
  if (e.code === 'Space' && tag !== 'button') { e.preventDefault(); toggle(); }
  else if (e.key === 'ArrowRight' && e.shiftKey) next();
  else if (e.key === 'ArrowLeft' && e.shiftKey) prev();
  else if (e.key === 'ArrowRight' && tag !== 'input') seekTo(curTime() + 5);
  else if (e.key === 'ArrowLeft' && tag !== 'input') seekTo(curTime() - 5);
  else if (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey) $('#vibe').hidden ? openVibe() : closeVibe();
  else if (e.key === '/' ) { e.preventDefault(); S.view = { type: 'search' }; renderMain(); }
});
$('.main').addEventListener('scroll', closeMenu, { passive: true });
window.addEventListener('resize', closeMenu);
document.addEventListener('paste', e => {
  const tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea') return;
  const txt = e.clipboardData?.getData('text') || ''; if (ytId(txt)) { e.preventDefault(); playLink(txt); }
});

const seek = $('#seek'); let dragging = false;
seek.addEventListener('input', () => { dragging = true; seek.style.setProperty('--p', seek.value / 10 + '%'); $('#tcur').textContent = fmt(seek.value / 1000 * curDur()); });
seek.addEventListener('change', () => { dragging = false; seekTo(seek.value / 1000 * curDur()); });
$('#vol').addEventListener('input', e => { S.volume = +e.target.value; S.muted = false; store.set('ag2-vol', S.volume); applyVol(); });

function openVibe() {
  $('#vibe').hidden = false; closeMenu();
  if (!S.track) toggle();
  try { document.documentElement.requestFullscreen?.().catch(() => {}); } catch {}
}
function closeVibe() { $('#vibe').hidden = true; try { if (document.fullscreenElement) document.exitFullscreen(); } catch {} }
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && !$('#vibe').hidden) $('#vibe').hidden = true; });

/* ================= frame loop: player placement, progress, vibe visuals ================= */
const host = $('#yt-host'), pip = $('#pip'), np = $('#np'), vibe = $('#vibe');
let lastRect = '';
function placePlayer() {
  const vibeOpen = !vibe.hidden, npOn = getComputedStyle(np).display !== 'none';
  const wantPip = !!S.track && !vibeOpen && !npOn;
  if (pip.hidden === wantPip) pip.hidden = !wantPip;
  const slot = vibeOpen ? $('#vibe-slot') : npOn ? $('#np-slot') : wantPip ? $('#pip-slot') : null;
  host.classList.toggle('show', !!(slot && S.track));
  host.classList.toggle('over', vibeOpen);
  if (!slot) return;
  const r = slot.getBoundingClientRect(), key = `${r.left|0},${r.top|0},${r.width|0},${r.height|0}`;
  if (key !== lastRect) { lastRect = key; Object.assign(host.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: getComputedStyle(slot).borderRadius }); }
}
const vcv = $('#vibecv');
const particles = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + .5, v: Math.random() * .04 + .01, p: Math.random() * 6 }));
function drawVibe(time) {
  const dpr = Math.min(2, devicePixelRatio || 1), w = vcv.clientWidth, h = vcv.clientHeight;
  if (vcv.width !== Math.round(w * dpr)) { vcv.width = Math.round(w * dpr); vcv.height = Math.round(h * dpr); }
  const g = vcv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const speed = S.playing ? 1 : .25, beat = S.playing ? Math.pow(.5 + .5 * Math.sin(time * Math.PI * 2 * 1.95), 6) : 0;
  g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 5; k++) {
    g.beginPath();
    const yb = h * (.25 + k * .13), amp = h * (.06 + .03 * Math.sin(time * .3 + k)) * (1 + beat * .4);
    for (let x = 0; x <= w; x += 12) {
      const y = yb + Math.sin(x / w * Math.PI * (2 + k * .4) + time * speed * (.6 + k * .15)) * amp + Math.sin(x / w * 9 + time * speed * 1.3 + k) * amp * .25;
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.strokeStyle = PAL[k % 3]; g.globalAlpha = .1 + beat * .06; g.lineWidth = 50 + k * 18; g.lineCap = 'round'; g.stroke();
    g.globalAlpha = .55; g.lineWidth = 1.5; g.stroke();
  }
  g.globalAlpha = 1;
  for (const p of particles) {
    p.y -= p.v * speed * .016 * (1 + beat); if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
    g.fillStyle = PAL[Math.floor(p.p) % 3]; g.globalAlpha = .35 + .35 * Math.sin(time * 2 + p.p);
    g.beginPath(); g.arc(p.x * w + Math.sin(time + p.p) * 12, p.y * h, p.r * (1 + beat), 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function frame(now) {
  placePlayer();
  if (S.track) {
    const d = curDur(), p = curTime();
    if (!dragging) { seek.value = d ? Math.round(p / d * 1000) : 0; seek.style.setProperty('--p', (d ? p / d * 100 : 0) + '%'); $('#tcur').textContent = fmt(p); }
    $('#tdur').textContent = d ? fmt(d) : '0:00';
  }
  if (!vibe.hidden) drawVibe(now / 1000);
  requestAnimationFrame(frame);
}

/* ================= boot ================= */
$('#prevb').innerHTML = I.prev; $('#nextb').innerHTML = I.next; $('#shuf').innerHTML = I.shuffle;
$('#vibenext').innerHTML = I.next; $('#vibex').innerHTML = I.x; $('#np-vibe').innerHTML = I.spark;
$('#vibeb').innerHTML = I.spark + '<span>Vibe</span>';
applyVol(); renderMain(); renderNow(); renderNP(); syncState();
requestAnimationFrame(frame);
api('/api/status').then(async s => {
  S.hasKey = !!s.hasKey;
  if (S.hasKey) { trending.loading = true; if (S.view.type === 'home') renderMain(); }
  else if (S.view.type === 'home' || S.view.type === 'search') renderMain();
  if (!S.hasKey) return;
  try { trending.tracks = regAll((await api('/api/trending?region=' + region)).tracks); }
  catch (e) { trending.err = e.message; }
  trending.loading = false;
  if (S.view.type === 'home') renderMain();
}).catch(() => toast('Lost connection to the Afterglow server. Is it still running?'));
})();
