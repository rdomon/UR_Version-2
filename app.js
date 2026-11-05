/* Bodifi Music Player — vanilla JS
   Flow: Select instructor → Music service → Class type → Playlist → Ready to play (confirm) → Now playing
   Every numbered step is tappable at any time; selections are kept when jumping between steps. */
(() => {
  'use strict';

  // ---------- Data ----------
  const STEPS = [
    { id: 'instructor', label: 'Select instructor' },
    { id: 'service', label: 'Music service' },
    { id: 'class', label: 'Class type' },
    { id: 'playlist', label: 'Playlist' },
    { id: 'ready', label: 'Ready to play' },
  ];
  const CONFIRM = 4;
  const NOW_PLAYING = 5;
  const STEP_HINTS = ['select an instructor', 'choose a music service', 'load a class', 'choose a playlist'];

  const INSTRUCTORS = [
    { name: 'Jordan M.', initial: 'J', hue: 18 },
    { name: 'Alex R.', initial: 'A', hue: 200 },
    { name: 'Taylor S.', initial: 'T', hue: 285 },
    { name: 'Morgan L.', initial: 'M', hue: 140 },
    { name: 'Casey P.', initial: 'C', hue: 50 },
    { name: 'Riley T.', initial: 'R', hue: 330 },
  ];

  const SERVICES = [
    {
      name: 'Spotify',
      available: true,
      path: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
    },
    {
      name: 'Apple Music',
      available: false,
      path: 'M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.323-.16.67-.25 1.018-.324.378-.082.758-.153 1.134-.24.274-.063.457-.23.51-.516a.904.904 0 00.02-.193c0-1.815 0-3.63-.002-5.443a.725.725 0 00-.026-.185c-.04-.15-.15-.243-.304-.234-.16.01-.318.035-.475.066-.76.15-1.52.303-2.28.456l-2.325.47-1.374.278c-.016.003-.032.01-.048.013-.277.077-.377.203-.39.49-.002.042 0 .086 0 .13-.002 2.602 0 5.204-.003 7.805 0 .42-.047.836-.215 1.227-.278.64-.77 1.04-1.434 1.233-.35.1-.71.16-1.075.172-.96.036-1.755-.6-1.92-1.544-.14-.812.23-1.685 1.154-2.075.357-.15.73-.232 1.108-.31.287-.06.575-.116.86-.177.383-.083.583-.323.6-.714v-.15c0-2.96 0-5.922.002-8.882 0-.123.013-.25.042-.37.07-.285.273-.448.546-.518.255-.066.515-.112.774-.165.733-.15 1.466-.296 2.2-.444l2.27-.46c.67-.134 1.34-.27 2.01-.403.22-.043.442-.088.663-.106.31-.025.523.17.554.482.008.073.012.148.012.223.002 1.91.002 3.822 0 5.732z',
    },
  ];

  const CLASSES = [
    { name: 'Yoga', time: '60 min', detail: 'Balanced' },
    { name: 'Pilates', time: '50 min', detail: 'Core' },
    { name: 'Strength Training', time: '45 min', detail: 'High energy' },
  ];

  // dur = seconds, hue = placeholder artwork colour
  const PLAYLISTS = [
    {
      name: 'Power Hour', count: '24 tracks', length: '1 hr 26 min', hue: 75,
      tracks: [
        { title: 'Run It Up', artist: 'Sienna Vale', dur: 222, hue: 75 },
        { title: 'All The Way', artist: 'Nova Ray', dur: 198, hue: 15 },
        { title: 'Higher Ground', artist: 'Sienna Vale', dur: 242, hue: 210 },
        { title: 'Move With Me', artist: 'Jordan K.', dur: 216, hue: 330 },
        { title: 'One More Round', artist: 'The Current', dur: 231, hue: 45 },
      ],
    },
    {
      name: 'Sweat Sessions', count: '21 tracks', length: '1 hr 12 min', hue: 265,
      tracks: [
        { title: 'Neon Pulse', artist: 'Kite Avenue', dur: 205, hue: 265 },
        { title: 'Midnight Sprint', artist: 'Nova Ray', dur: 189, hue: 300 },
        { title: 'After Hours', artist: 'The Current', dur: 224, hue: 240 },
        { title: 'Heartbeat City', artist: 'Sienna Vale', dur: 211, hue: 180 },
        { title: 'Lights Out', artist: 'Jordan K.', dur: 197, hue: 20 },
      ],
    },
    {
      name: 'Cool Down', count: '18 tracks', length: '58 min', hue: 150,
      tracks: [
        { title: 'Slow Morning', artist: 'Marlow', dur: 236, hue: 150 },
        { title: 'Deep Breath', artist: 'Aya Lin', dur: 208, hue: 190 },
        { title: 'Open Window', artist: 'Marlow', dur: 251, hue: 95 },
        { title: 'Soft Landing', artist: 'The Current', dur: 219, hue: 35 },
        { title: 'Still Water', artist: 'Aya Lin', dur: 244, hue: 220 },
      ],
    },
  ];

  // ---------- State ----------
  const state = {
    step: 0,            // 0-3 setup, 4 ready/confirm, 5 now playing
    instructor: 0,
    instructorChosen: false,
    demoSignedIn: false, // prototype-only sign-in; nothing is sent or stored
    started: false,     // music has been started at least once
    service: null,
    classType: null,
    playlist: null,
    track: 0,
    elapsed: 0,
    playing: false,
    shuffle: false,
    volume: 72,
    collapsed: false,
    home: false,        // landing dashboard is showing
  };

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const currentTracks = () => PLAYLISTS[state.playlist ?? 0].tracks;
  const currentTrack = () => currentTracks()[state.track];

  const spotify = window.BodifiSpotify;
  let realPlaylist = null, realTracks = [], realTrack = null, realActive = false;
  let pendingPlay = null; // Spotify playlist/song chosen but not started yet (starts from the Ready screen)
  let playlistListUnavailable = false;
  let libraryOffset = 0, libraryLoading = false, currentSpotifyTab = 'search';
  const libraryItems = new Map();
  let profileCache = null;
  let realPosition = 0, realDuration = 0, realPaused = true;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const imageHTML = (url, hue = 100) => url && /^https:\/\//.test(url) ? `<img class="spotify-cover" src="${safe(url)}" alt="Album art" />` : artHTML(hue);
  const report = err => { console.error(err); toast(err.message || String(err)); $('spotifyResults').textContent = err.message || String(err); };
  async function realAction(fn) { try { await fn(); } catch (err) { report(err); } }
  function applyPlayback(data) {
    if (!data?.playback) return;
    const ps = data.playback, tr = ps.track_window?.current_track;
    if (!tr) return;
    realActive = true; realTrack = { uri: tr.uri, title: tr.name, artist: tr.artists?.map(x => x.name).join(', ') || '', dur: (tr.duration_ms || 0)/1000, image: tr.album?.images?.[0]?.url };
    realPosition = ps.position / 1000; realDuration = realTrack.dur; realPaused = ps.paused;
    state.playing = !realPaused;
    if (state.step === NOW_PLAYING) { renderTrackInfo(); renderPlayButton(); }
  }
  async function connectPlayback() {
    const r = await spotify.connect(applyPlayback, report);
    toast('Spotify browser player is ready'); return r;
  }
  function showSpotifyModal() { $('spotifyModal').hidden = false; renderSpotifyAccount(); setSpotifyTab(currentSpotifyTab); }
  function setSpotifyTab(tab) {
    currentSpotifyTab = tab;
    document.querySelectorAll('[data-spotify-tab]').forEach(b => {
      const active = b.dataset.spotifyTab === tab;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    $('spotifySearchView').hidden = tab !== 'search';
    $('spotifyLibraryView').hidden = tab !== 'library';
    $('spotifyProfileView').hidden = tab !== 'account';
    $('spotifyModalTitle').textContent = spotify.connected()
      ? ({ search:'Search music', library:'My Library', account:'My Spotify Account' })[tab]
      : (state.demoSignedIn ? 'Demo account' : 'Sign in (demo)');
    if (!spotify.connected()) return;
    if (tab === 'library' && !libraryItems.size) realAction(() => fetchMyPlaylists(true));
    if (tab === 'account') realAction(fetchMyProfile);
  }
  async function fetchMyProfile() {
    const el = $('spotifyProfile');
    el.textContent = 'Loading your Spotify profile…';
    try {
      profileCache = profileCache || await spotify.api('/me');
      const p = profileCache;
      const photo = p.images?.[0]?.url;
      const profileLink = p.external_urls?.spotify || `https://open.spotify.com/user/${encodeURIComponent(p.id || '')}`;
      el.innerHTML = `<div class="spotify-profile-card">${photo ? `<img class="spotify-profile-avatar" src="${safe(photo)}" alt="Spotify profile image">` : '<span class="spotify-profile-avatar placeholder">♫</span>'}<div><strong>${safe(p.display_name || p.id || 'Spotify user')}</strong><small>Connected Spotify account</small><a target="_blank" rel="noopener noreferrer" href="${safe(profileLink)}">Open profile on Spotify ↗</a></div></div>`;
    } catch(e) { el.textContent = `Could not load your account: ${e.message}`; }
  }
  async function fetchMyPlaylists(reset = false) {
    if (libraryLoading) return;
    if (reset) { libraryOffset = 0; libraryItems.clear(); $('myPlaylists').replaceChildren(); }
    libraryLoading = true;
    const el = $('myPlaylists');
    const more = $('loadMorePlaylists');
    more.hidden = true;
    const status = document.createElement('p'); status.className = 'spotify-help-text'; status.textContent = 'Loading playlists…'; el.append(status);
    try {
      const page = await spotify.myPlaylists(libraryOffset);
      status.remove();
      const items = (page?.items || []).filter(Boolean);
      for (const x of items) {
        if (!x.id || !x.uri) continue;
        libraryItems.set(x.id, x);
        const b = document.createElement('button'); b.className = 'spotify-result'; b.type = 'button';
        b.dataset.kind = 'playlist'; b.dataset.id = x.id; b.dataset.uri = x.uri;
        const cover = imageHTML(x.images?.[0]?.url);
        const count = x.items?.total ?? x.tracks?.total;
        b.innerHTML = `${cover}<span><strong>${safe(x.name)}</strong><small>${count == null ? 'Spotify playlist' : `${count} tracks`} · ${safe(x.owner?.display_name || 'Spotify')}</small></span><span class="spotify-action">Play ›</span>`;
        el.append(b);
      }
      libraryOffset += items.length;
      if (!libraryItems.size) el.innerHTML = '<p class="spotify-help-text">No playlists found on this Spotify account.</p>';
      more.hidden = !(page?.next && items.length);
    } catch (e) {
      status.remove();
      const err = document.createElement('p'); err.className = 'playlist-notice';
      err.textContent = `Could not load playlists: ${e.message}. Try reconnecting Spotify and allowing playlist access.`;
      el.append(err);
    } finally { libraryLoading = false; }
  }
  // The only sign-in in this prototype is the BODiFi demo form below: no Client ID, no real Spotify connection.
  function renderDemoForm() {
    $('spotifyAccount').innerHTML = `<form id="demoSigninForm" class="demo-form" novalidate>
      <p class="demo-banner"><strong>Prototype sign-in.</strong> For the usability test only — do not type a real password. Nothing is sent or saved.</p>
      <div class="demo-field">
        <label for="demoEmail">Email</label>
        <input id="demoEmail" type="email" aria-label="Email" placeholder="name@example.com" autocomplete="off" autocapitalize="off" spellcheck="false" data-osk-next="#demoPassword" />
      </div>
      <div class="demo-field">
        <label for="demoPassword">Password</label>
        <input id="demoPassword" type="password" aria-label="Password" placeholder="Any password" autocomplete="off" autocapitalize="off" />
      </div>
      <p id="demoError" class="demo-error" role="alert" hidden></p>
      <div class="demo-actions"><button type="submit" class="spotify-primary">Sign in</button><button type="button" id="demoCancel" class="spotify-outline">Cancel</button></div>
    </form>`;
    $('spotifySearchForm').hidden = true;
    document.querySelector('.spotify-tabs').hidden = true;
    setTimeout(() => $('demoEmail')?.focus(), 80); // opens the on-screen keyboard straight away
  }
  function renderSpotifyAccount() {
    if (state.demoSignedIn) {
      $('spotifyAccount').innerHTML = `<div class="spotify-connected"><span class="connection-dot"></span> Demo account signed in <button id="demoSignOut" class="spotify-link" type="button">Sign out</button></div><p class="spotify-help-text">Prototype mode: music search needs a real Spotify connection and is not part of this test.</p>`;
      $('spotifySearchForm').hidden = true;
      document.querySelector('.spotify-tabs').hidden = true;
      return;
    }
    renderDemoForm();
  }
  async function performSearch(q, type) {
    $('spotifyResults').textContent = 'Searching Spotify…';
    const result = await spotify.search(q, type);
    const tracks = result.tracks?.items || [], playlists = (result.playlists?.items || []).filter(Boolean);
    $('spotifyResults').innerHTML = `<p class="spotify-result-label">Songs (${tracks.length})</p>` + tracks.map(t => `<button class="spotify-result" data-uri="${safe(t.uri)}" data-kind="track">${imageHTML(t.album?.images?.[0]?.url)}<span><strong>${safe(t.name)}</strong><small>${safe(t.artists?.map(x=>x.name).join(', '))}</small></span><span class="spotify-action">Play ›</span></button>`).join('') + `<p class="spotify-result-label">Playlists (${playlists.length})</p>` + playlists.map(x => `<button class="spotify-result" data-id="${safe(x.id)}" data-uri="${safe(x.uri)}" data-kind="playlist">${imageHTML(x.images?.[0]?.url)}<span><strong>${safe(x.name)}</strong><small>${safe(x.owner?.display_name || 'Spotify playlist')}</small></span><span class="spotify-action">Open ›</span></button>`).join('');
    if (!tracks.length && !playlists.length) $('spotifyResults').innerHTML = '<p>No results found. Try a different search.</p>';
  }
  async function loadPlaylist(id, uri) {
    realPlaylist = { id, uri, title: 'Spotify playlist', total: null };
    realTracks = [];
    realTrack = null;
    playlistListUnavailable = false;
    try {
      const detail = await spotify.api(`/playlists/${encodeURIComponent(id)}`);
      realPlaylist.title = detail.name || 'Spotify playlist';
      realPlaylist.total = detail.items?.total ?? null;
    } catch (e) {
      console.warn('Playlist metadata unavailable:', e);
    }
    try {
      // In Spotify Development Mode (2026), only owned/collaborative
      // playlists expose items. Load all available pages, not just 50.
      const entries = await spotify.playlistItemsAll(id);
      realTracks = entries.map(entry => entry.item || entry.track)
        .filter(x => x?.uri?.startsWith('spotify:track:'))
        .map(x => ({ uri: x.uri, title: x.name, artist: x.artists?.map(y => y.name).join(', ') || '', dur: (x.duration_ms || 0) / 1000, image: x.album?.images?.[0]?.url }));
    } catch (e) {
      playlistListUnavailable = true;
      console.warn('Playlist items unavailable:', e);
      toast('This playlist can play, but Spotify restricts its track list.');
    }
    pendingPlay = { context_uri: uri, label: realPlaylist.title };
    state.playlist = null; state.service = 0;
    $('spotifyModal').hidden = true;
    toast(`Playlist selected: ${realPlaylist.title}`);
    goTo(CONFIRM);
  }
  const NOTE_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';

  const artHTML = (hue) =>
    `<span class="art" style="background:linear-gradient(135deg,hsl(${hue} 24% 62%),hsl(${(hue + 30) % 360} 22% 46%))">${NOTE_SVG}</span>`;

  const avatarStyle = (hue) => `background:linear-gradient(135deg,hsl(${hue} 22% 50%),hsl(${hue} 22% 38%))`;

  let toastTimer;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 2400);
  }

  // ---------- Navigation ----------
  function goTo(step) {
    state.step = step;
    state.home = false;
    render();
  }

  function goBack() {
    if (state.step > 0 && state.step <= CONFIRM) goTo(state.step - 1);
  }

  // Home = landing dashboard. Selections and playback are kept, so nothing is lost.
  function goHome() {
    if (state.home) { toast('You are on Home'); return; }
    state.home = true;
    render();
  }

  // ---------- Home dashboard (sample data for the prototype) ----------
  const HOME_NAV = [
    { id: 'dash', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>' },
    { id: 'start', label: 'Start a class', icon: '<path d="M8 5v14l11-7z"/>' },
    { id: 'lists', label: 'Playlists', icon: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>' },
    { id: 'sched', label: 'Schedule', icon: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>' },
    { id: 'msg', label: 'Messages', icon: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 8 9 6 9-6"/>' },
    { id: 'set', label: 'Settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>' },
  ];
  const HOME_SCHEDULE = [
    { day: 'Today', time: '9:00 AM', cls: 'Yoga' },
    { day: 'Today', time: '12:00 PM', cls: 'Pilates' },
    { day: 'Today', time: '5:30 PM', cls: 'Strength Training' },
  ];
  const HOME_STATS = [
    { label: 'Attendance', value: 78, color: 'var(--sage-600)' },
    { label: 'Playlists ready', value: 92, color: 'var(--moss-500)' },
    { label: 'Rating', value: 96, color: 'var(--clay-600)' },
  ];
  const svgIcon = (inner) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

  function ringHTML(s) {
    const r = 30, c = 2 * Math.PI * r, off = c * (1 - s.value / 100);
    return `<div class="stat-card"><h3>${s.label}</h3>
      <svg class="ring" viewBox="0 0 80 80" role="img" aria-label="${s.label} ${s.value}%">
        <circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--mist-200)" stroke-width="9"/>
        <circle cx="40" cy="40" r="${r}" fill="none" stroke="${s.color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 40 40)"/>
        <text x="40" y="45" text-anchor="middle" font-size="17" font-weight="600" fill="var(--ink-900)">${s.value}%</text>
      </svg></div>`;
  }

  function calendarHTML() {
    const now = new Date(), y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    let cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<i class="dow">${d}</i>`).join('');
    cells += '<i></i>'.repeat(first);
    for (let d = 1; d <= days; d++) cells += `<i class="${d === today ? 'today' : ''}">${d}</i>`;
    const title = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return `<div class="mini-cal" aria-label="${title}"><b>${title}</b><div class="cal-grid">${cells}</div></div>`;
  }

  function renderHome() {
    const first = INSTRUCTORS[state.instructor].name.split(' ')[0];
    const resume = state.started
      ? `<button type="button" class="home-primary" data-home="resume">Resume playing</button>`
      : '';
    const lists = PLAYLISTS.map((p, i) => `
      <li class="home-row"><span class="mini-art">${artHTML(p.hue)}</span>
        <span class="home-row-copy"><strong>${p.name}</strong><small>${p.count} · ${p.length}</small></span></li>`).join('');
    const sched = HOME_SCHEDULE.map(s => `
      <li class="home-row"><span class="time-pill">${s.time}</span>
        <span class="home-row-copy"><strong>${s.cls}</strong><small>${s.day}</small></span></li>`).join('');
    const nav = HOME_NAV.map(n => `
      <button type="button" class="home-nav-item${n.id === 'dash' ? ' active' : ''}" data-home="${n.id}"${n.id === 'dash' ? ' aria-current="page"' : ''}>${svgIcon(n.icon)}<span>${n.label}</span></button>`).join('');
    $('homeScreen').innerHTML = `
      <aside class="home-nav" aria-label="Home navigation">
        <div class="home-profile"><span class="avatar" style="${avatarStyle(INSTRUCTORS[state.instructor].hue)}">${INSTRUCTORS[state.instructor].initial}</span>
          <span><strong>${INSTRUCTORS[state.instructor].name}</strong><small>Instructor</small></span></div>
        <nav>${nav}</nav>
      </aside>
      <div class="home-main">
        <div class="home-head"><h1>Hello, ${first}!</h1><div class="home-actions">${resume}<button type="button" class="home-primary" data-home="start">Start a class</button></div></div>
        <div class="home-grid">
          <section class="home-card"><h2>Recent playlists</h2><ul>${lists}</ul></section>
          <section class="home-card"><h2>Today’s classes</h2><ul>${sched}</ul></section>
          <section class="home-card home-wide"><h2>This month</h2>${calendarHTML()}
            <p class="home-note">Sample data for the prototype.</p></section>
        </div>
      </div>
      <aside class="home-stats" aria-label="Weekly summary">${HOME_STATS.map(ringHTML).join('')}</aside>`;
  }

  function onHomeClick(e) {
    const b = e.target.closest('[data-home]');
    if (!b) return;
    const id = b.dataset.home;
    if (id === 'start') goTo(0);
    else if (id === 'resume') goTo(NOW_PLAYING);
    else if (id === 'dash') toast('You are on Home');
    else toast('Not available in this prototype yet');
  }

  const serviceConnected = () => spotify.connected() || state.demoSignedIn;
  const isDone = (i) => [
    state.instructorChosen,
    state.service !== null,
    state.classType !== null,
    state.playlist !== null || Boolean(pendingPlay),
    state.step === NOW_PLAYING || state.started,
  ][i];
  const isReady = () => [0, 1, 2, 3].every(isDone);
  const firstMissingBefore = (step) => [0, 1, 2, 3].slice(0, step).find((i) => !isDone(i));
  const playlistLabel = () => (pendingPlay ? pendingPlay.label : state.playlist !== null ? PLAYLISTS[state.playlist].name : null);

  const stepNotice = (step) => {
    const i = firstMissingBefore(step);
    if (i === undefined) return '';
    return `<div class="step-notice" role="status"><span>Step ${i + 1} isn’t finished yet — ${STEP_HINTS[i]}.</span><button type="button" class="spotify-outline" data-goto="${i}">Go to step ${i + 1}</button></div>`;
  };
  const searchRow = () => (spotify.connected()
    ? '<div class="search-row"><button type="button" class="spotify-outline search-open" data-open-search>⌕ Search Spotify</button><small>Find songs or playlists from your Spotify account.</small></div>'
    : '');

  // ---------- Rendering ----------
  function renderProgress() {
    $('flowProgress').innerHTML = STEPS.map((s, i) => {
      const current = state.step === i;
      const done = isDone(i) && !current;
      const cls = [current ? 'current' : '', done ? 'complete' : ''].filter(Boolean).join(' ');
      const status = current ? 'current step' : done ? 'completed' : 'not completed yet';
      return `<button type="button" data-step="${i}" class="${cls}" aria-label="Step ${i + 1}: ${s.label}, ${status}" ${current ? 'aria-current="step"' : ''}>
        <i>${done ? '✓' : i + 1}</i><span>${s.label}</span></button>`;
    }).join('');
  }

  function updateScrollCue() {
    const list = $('instructorList'), cue = $('scrollCue');
    if (!list || !cue) return;
    const more = list.scrollHeight - list.clientHeight - list.scrollTop > 6;
    cue.hidden = !more;
  }

  function renderSetup() {
    const eyebrow = $('setupEyebrow');
    const title = $('setupTitle');
    const sub = $('setupSub');
    const body = $('setupBody');
    const inst = INSTRUCTORS[state.instructor];

    $('backButton').hidden = state.step === 0;
    $('helpButton').hidden = false;

    if (state.step === 0) {
      eyebrow.textContent = 'Welcome back';
      title.textContent = 'Select instructor';
      sub.textContent = `Choose your profile to load your classes and playlists. ${INSTRUCTORS.length} instructors — swipe or scroll the list.`;
      body.innerHTML = `<div class="scroll-wrap">
        <div class="instructor-list" id="instructorList" role="list" tabindex="0" aria-label="Instructors. Scroll for more.">
          ${INSTRUCTORS.map((p, i) => `
          <button class="instructor-row ${state.instructorChosen && state.instructor === i ? 'selected' : ''}" type="button" role="listitem" data-pick="${i}">
            <span class="choice-avatar" style="${avatarStyle(p.hue)}">${p.initial}</span>
            <span class="row-name"><strong>${p.name}</strong><small>Instructor</small></span>
            <span class="row-go" aria-hidden="true">${state.instructorChosen && state.instructor === i ? '✓' : '›'}</span>
          </button>`).join('')}
        </div>
        <button class="scroll-cue" id="scrollCue" type="button" aria-label="Scroll down for more instructors"><span>Scroll for more instructors</span><b aria-hidden="true">↓</b></button>
      </div>`;
      requestAnimationFrame(updateScrollCue);
    } else if (state.step === 1) {
      eyebrow.textContent = inst.name;
      title.textContent = 'Music service';
      sub.textContent = 'Choose a connected service for today’s class.';
      body.innerHTML = `${stepNotice(1)}<div class="choice-grid two">${SERVICES.map((s, i) => `
        <button class="choice-card ${state.service === i ? 'selected' : ''} ${s.available ? '' : 'unavailable'}" type="button" data-pick="${i}" ${s.available ? '' : 'disabled aria-disabled="true"'}>
          <span class="service-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${s.path}"/></svg></span>
          <strong>${s.name}</strong>
          <small>${s.available ? (serviceConnected() ? 'Connected ✓' : 'Tap to sign in') : 'Not available yet'}</small>
        </button>`).join('')}</div>${searchRow()}`;
    } else if (state.step === 2) {
      eyebrow.textContent = state.service !== null ? `${SERVICES[state.service].name} connected` : inst.name;
      title.textContent = 'Class type';
      sub.textContent = 'Select the class you are about to teach, then load it.';
      body.innerHTML = `${stepNotice(2)}<div class="choice-grid three">${CLASSES.map((c, i) => `
        <button class="choice-card class-card ${state.classType === i ? 'selected' : ''}" type="button" data-pick="${i}">
          <span class="class-number">0${i + 1}</span>
          <strong>${c.name}</strong><small>${c.time} · ${c.detail}</small>
        </button>`).join('')}</div>
        <div class="action-row"><button type="button" class="spotify-primary big-action" id="loadClass" ${state.classType === null ? 'disabled' : ''}>${state.classType === null ? 'Select a class to load' : `Load “${CLASSES[state.classType].name}” →`}</button></div>`;
    } else if (state.step === 3) {
      eyebrow.textContent = state.classType !== null ? CLASSES[state.classType].name : inst.name;
      title.textContent = 'Playlist';
      sub.textContent = 'Select music, then review it on the next screen.';
      body.innerHTML = `${stepNotice(3)}<div class="playlist-choices">${PLAYLISTS.map((p, i) => `
        <button class="playlist-choice ${state.playlist === i && !pendingPlay ? 'selected' : ''}" type="button" data-pick="${i}">
          ${artHTML(p.hue)}
          <span class="meta"><strong>${p.name}</strong><small>${p.count} · ${p.length}</small></span>
          <svg width="8" height="15" viewBox="0 0 10.5 19.5" fill="none"><path d="M0.75 18.75L9.75 9.75L0.75 0.75" stroke="#C8F542" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>`).join('')}</div>${searchRow()}`;
    } else if (state.step === CONFIRM) {
      const ready = isReady();
      eyebrow.textContent = ready ? 'Class loaded' : 'Almost there';
      title.textContent = ready ? 'Ready to play' : 'Almost ready';
      sub.textContent = ready ? 'Check the details below, then start the music.' : 'Finish the steps marked “Not selected yet”.';
      const rows = [
        ['Instructor', state.instructorChosen ? inst.name : null],
        ['Music service', state.service !== null ? SERVICES[state.service].name : null],
        ['Class', state.classType !== null ? `${CLASSES[state.classType].name} · ${CLASSES[state.classType].time}` : null],
        ['Playlist', playlistLabel()],
      ];
      body.innerHTML = `<div class="summary">${rows.map(([label, value], i) => `
        <div class="summary-row ${value ? '' : 'missing'}">
          <span class="summary-step">${value ? '✓' : i + 1}</span>
          <span class="summary-copy"><small>${label}</small><strong>${safe(value || 'Not selected yet')}</strong></span>
          <button type="button" class="summary-change" data-goto="${i}">${value ? 'Change' : 'Choose'}</button>
        </div>`).join('')}</div>
        <div class="action-row">
          <button type="button" class="spotify-primary big-action" id="startMusic" ${ready ? '' : 'disabled'}>▶ Start music</button>
          ${state.started ? '<button type="button" class="spotify-outline big-action" data-goto="5">Back to Now playing</button>' : ''}
        </div>`;
    }
  }

  function renderPlaylistPanel() {
    const pl = realActive ? { name: realPlaylist?.title || 'Spotify music', tracks: realTracks } : PLAYLISTS[state.playlist ?? 0];
    $('plName').textContent = pl.name;
    $('browseBtn').textContent = realActive ? 'Search Spotify' : `Browse all ${parseInt(pl.count, 10)} tracks`;
    const displayCount = realActive
      ? (playlistListUnavailable ? (realPlaylist?.total != null ? `${realPlaylist.total} tracks · list restricted` : 'Track list restricted')
        : realPlaylist?.total != null && realTracks.length < realPlaylist.total ? `${realTracks.length} of ${realPlaylist.total} tracks` : `${realTracks.length} tracks`)
      : pl.count;
    $('plSummary').innerHTML = `<span>${safe(displayCount)}</span><span>${realActive ? 'Spotify' : pl.length}</span><span>${safe(CLASSES[state.classType ?? 0].detail)}</span>`;
    // A search result is one song, not an empty playlist. For a playlist
    // Spotify restricts, show the real now-playing track without claiming to
    // have downloaded the playlist's full track list.
    const showCurrentOnly = realActive && !realTracks.length && realTrack;
    const rows = showCurrentOnly ? [realTrack] : pl.tracks;
    $('trackList').innerHTML = rows.map((t, i) => {
      const active = realActive ? (realTrack?.uri === t.uri) : i === state.track;
      return `<button type="button" class="track-row ${active ? 'active' : ''}" data-track="${i}" ${showCurrentOnly ? 'data-current-only="true"' : ''}>
        <span class="track-number">${active && state.playing ? '●' : String(i + 1).padStart(2, '0')}</span>
        ${imageHTML(t.image, t.hue)}
        <span class="row-copy"><strong>${safe(t.title)}</strong><small>${safe(t.artist)}</small></span>
        <span class="duration">${fmt(t.dur)}</span>
        ${active ? '<svg width="7" height="14" viewBox="0 0 10.5 19.5" fill="none"><path d="M0.75 18.75L9.75 9.75L0.75 0.75" stroke="#C8F542" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<span></span>'}
      </button>`;
    }).join('');
    if (realActive && playlistListUnavailable) {
      $('trackList').insertAdjacentHTML('beforeend', '<p class="playlist-notice">Spotify limits track lists to playlists you own or collaborate on. The current song appears above; search for other songs using Search Spotify.</p>');
    } else if (realActive && !rows.length) {
      $('trackList').insertAdjacentHTML('beforeend', '<p class="playlist-notice">No tracks available yet. Start playback or search for music.</p>');
    }
  }

  function renderTrackInfo() {
    const t = realActive ? (realTrack || realTracks[0] || {title:"Select a song",artist:"Spotify",dur:1}) : currentTrack();
    $('trackTitle').textContent = t.title;
    $('trackArtist').textContent = t.artist;
    $('albumArt').innerHTML = imageHTML(t.image, t.hue);
    $('timeTotal').textContent = fmt(t.dur || 0);
    $('ctxInstructor').textContent = INSTRUCTORS[state.instructor].name;
    $('ctxService').textContent = SERVICES[state.service ?? 0].name;
    $('ctxClass').textContent = CLASSES[state.classType ?? 0].name;
    renderPlaylistPanel();
    renderTime();
  }

  function setRange(el, pct) {
    el.value = pct;
    el.style.setProperty('--value', `${pct}%`);
  }

  function renderTime() {
    const t = realActive ? (realTrack || {dur:1}) : currentTrack();
    const pct = Math.min(100, ((realActive ? realPosition : state.elapsed) / (t.dur || 1)) * 100);
    setRange($('songProgress'), pct);
    $('timeElapsed').textContent = fmt(realActive ? realPosition : state.elapsed);
  }

  function renderPlayButton() {
    const b = $('playBtn');
    b.setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
    b.innerHTML = state.playing
      ? '<svg width="34" height="34" viewBox="0 0 33 33" fill="none"><path d="M11 8.25V24.75M22 8.25V24.75" stroke="#111827" stroke-width="4.125" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<span class="play-icon"></span>';
  }

  function renderHeader() {
    const p = INSTRUCTORS[state.instructor];
    $('profileName').textContent = p.name;
    $('profileAvatar').textContent = p.initial;
    $('profileAvatar').setAttribute('style', avatarStyle(p.hue));
  }

  function render() {
    const playing = state.step === NOW_PLAYING;
    const home = state.home;
    $('homeScreen').hidden = !home;
    $('setupScreen').hidden = playing || home;
    $('dashboard').hidden = !playing || home;
    $('dashboard').classList.toggle('playlist-collapsed', state.collapsed);
    renderHeader();
    $('logoButton').setAttribute('aria-current', home ? 'page' : 'false');
    $('homeButton').classList.toggle('active', home);
    if (home) {
      renderHome();
    } else if (playing) {
      renderTrackInfo();
      renderPlayButton();
      $('shuffleBtn').classList.toggle('on', state.shuffle);
      $('shuffleBtn').setAttribute('aria-pressed', String(state.shuffle));
    } else {
      renderProgress();
      renderSetup();
    }
  }

  // ---------- Playback ----------
  function selectTrack(i) {
    state.track = i;
    state.elapsed = 0;
    state.playing = true;
    renderTrackInfo();
    renderPlayButton();
  }

  function nextIndex(dir) {
    const n = currentTracks().length;
    if (state.shuffle && n > 1) {
      let r;
      do { r = Math.floor(Math.random() * n); } while (r === state.track);
      return r;
    }
    return (state.track + dir + n) % n;
  }

  function move(dir) {
    selectTrack(nextIndex(dir));
  }

  setInterval(() => {
    if (realActive) { if (state.step === NOW_PLAYING && !realPaused) { realPosition = Math.min(realDuration, realPosition + .25); renderTime(); } return; }
    if (state.step !== NOW_PLAYING || !state.playing) return;
    state.elapsed += 0.25;
    if (state.elapsed >= currentTrack().dur) {
      move(1);
    } else {
      renderTime();
    }
  }, 250);

  // ---------- Clock ----------
  function updateClock() {
    $('clock').textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      .format(new Date()).replace(' ', '');
  }
  updateClock();
  setInterval(updateClock, 15000);

  // ---------- Help ----------
  function openHelp() { $('helpOverlay').hidden = false; $('helpClose').focus(); }
  function closeHelp() { $('helpOverlay').hidden = true; }

  // ---------- Events ----------
  // Every numbered step is tappable; chosen values are kept.
  $('flowProgress').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-step]');
    if (b) goTo(Number(b.dataset.step));
  });

  function startMusic() {
    if (!isReady()) return;
    state.started = true;
    if (pendingPlay) {
      const p = pendingPlay;
      realActive = true; state.playing = false;
      goTo(NOW_PLAYING);
      realAction(async () => {
        await connectPlayback();
        await spotify.play(p.context_uri ? { context_uri: p.context_uri } : { uris: p.uris });
      });
    } else {
      if (realActive) spotify.pause().catch(() => {});
      realActive = false; state.track = 0; state.elapsed = 0; state.playing = true;
      goTo(NOW_PLAYING);
    }
  }

  function pickService(i) {
    if (!SERVICES[i].available) return;
    state.service = i;
    if (serviceConnected()) { toast(state.demoSignedIn && !spotify.connected() ? 'Signed in with the demo account' : 'Spotify is connected'); goTo(2); }
    else showSpotifyModal();
  }

  $('setupBody').addEventListener('click', (e) => {
    if (e.target.closest('[data-open-search]')) { showSpotifyModal(); return; }
    const go = e.target.closest('[data-goto]');
    if (go) { goTo(Number(go.dataset.goto)); return; }
    if (e.target.closest('#scrollCue')) { const l = $('instructorList'); l.scrollBy({ top: l.clientHeight * 0.8, behavior: 'smooth' }); return; }
    if (e.target.closest('#loadClass')) { if (state.classType !== null) { toast(`Class loaded: ${CLASSES[state.classType].name}`); goTo(3); } return; }
    if (e.target.closest('#startMusic')) { startMusic(); return; }
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    const i = Number(b.dataset.pick);
    if (state.step === 0) { state.instructor = i; state.instructorChosen = true; goTo(1); }
    else if (state.step === 1) pickService(i);
    else if (state.step === 2) { state.classType = i; render(); }
    else if (state.step === 3) {
      pendingPlay = null; state.playlist = i;
      state.track = 0; state.elapsed = 0; state.playing = false;
      goTo(CONFIRM);
    }
  });
  $('setupBody').addEventListener('scroll', (e) => { if (e.target.id === 'instructorList') updateScrollCue(); }, true);
  window.addEventListener('resize', updateScrollCue);

  $('backButton').addEventListener('click', goBack);
  $('profileButton').addEventListener('click', () => goTo(0));
  $('homeButton').addEventListener('click', goHome);
  $('homeScreen').addEventListener('click', onHomeClick);
  $('logoButton').addEventListener('click', goHome);
  $('helpButton').addEventListener('click', openHelp);
  $('helpClose').addEventListener('click', closeHelp);
  $('helpOverlay').addEventListener('click', (e) => { if (e.target === $('helpOverlay')) closeHelp(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHelp(); });

  $('playBtn').addEventListener('click', () => { if (realActive) { realAction(async () => { if (realPaused) await spotify.resume(); else await spotify.pause(); }); return; } state.playing = !state.playing; renderPlayButton(); renderPlaylistPanel(); });
  $('prevBtn').addEventListener('click', () => { if (realActive) { realAction(() => spotify.prev()); return; }
    if (state.elapsed > 3) { state.elapsed = 0; renderTime(); } else move(-1);
  });
  $('nextBtn').addEventListener('click', () => realActive ? realAction(() => spotify.next()) : move(1));
  $('shuffleBtn').addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    $('shuffleBtn').classList.toggle('on', state.shuffle);
    $('shuffleBtn').setAttribute('aria-pressed', String(state.shuffle));
    if (realActive) realAction(() => spotify.shuffle(state.shuffle)); else toast(state.shuffle ? 'Shuffle on' : 'Shuffle off');
  });

  $('songProgress').addEventListener('input', (e) => {
    const pct = Number(e.target.value);
    if (realActive) { realAction(() => spotify.seek((pct / 100) * realDuration * 1000)); return; }
    state.elapsed = (pct / 100) * currentTrack().dur;
    renderTime();
  });
  $('volume').addEventListener('input', (e) => {
    state.volume = Number(e.target.value);
    setRange(e.target, state.volume);
    $('volumeLabel').textContent = `${state.volume}%`;
    if (realActive) realAction(() => spotify.volume(state.volume));
  });

  $('trackList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-track]');
    if (b) { if (realActive) { const t = b.dataset.currentOnly ? realTrack : realTracks[Number(b.dataset.track)]; if (t?.uri) realAction(() => spotify.play({uris:[t.uri]})); } else selectTrack(Number(b.dataset.track)); }
  });
  $('changePlaylist').addEventListener('click', () => goTo(3));
  $('collapsePlaylist').addEventListener('click', () => { state.collapsed = true; $('dashboard').classList.add('playlist-collapsed'); });
  $('expandPlaylist').addEventListener('click', () => { state.collapsed = false; $('dashboard').classList.remove('playlist-collapsed'); });
  $('browseBtn').addEventListener('click', () => realActive ? showSpotifyModal() : toast('Showing the first 5 sample tracks')); 

  $('closeSpotifyModal').addEventListener('click', () => { $('spotifyModal').hidden = true; });
  $('spotifyModal').addEventListener('click', e => { if (e.target === $('spotifyModal')) $('spotifyModal').hidden = true; });
  $('spotifyAccount').addEventListener('submit', e => {
    if (e.target.id === 'spotifyClientForm') { e.preventDefault(); spotify.setClientId(e.target.querySelector('input').value); renderSpotifyAccount(); }
    if (e.target.id === 'demoSigninForm') {
      e.preventDefault();
      const email = $('demoEmail').value.trim(), pass = $('demoPassword').value, err = $('demoError');
      const problem = !/^\S+@\S+\.\S+$/.test(email) ? 'Enter an email address like name@example.com.' : !pass ? 'Enter a password (any text works in this prototype).' : '';
      if (problem) { err.textContent = problem; err.hidden = false; return; }
      $('demoEmail').value = ''; $('demoPassword').value = ''; // never kept
      state.demoSignedIn = true; state.service = 0;
      $('spotifyModal').hidden = true; renderSpotifyAccount();
      toast('Signed in with the demo account'); goTo(2);
    }
  });
  $('spotifyAccount').addEventListener('click', e => {
    if (e.target.id === 'connectSpotify') realAction(() => { saveResume(); return spotify.auth(); });
    if (e.target.id === 'activateSpotify') realAction(connectPlayback);
    if (e.target.id === 'logoutSpotify') { spotify.logout(); realActive = false; libraryItems.clear(); profileCache = null; currentSpotifyTab = 'search'; renderSpotifyAccount(); setSpotifyTab('search'); render(); }
    if (e.target.id === 'editClientId') { spotify.setClientId(''); renderSpotifyAccount(); }
    if (e.target.id === 'demoCancel') { $('spotifyModal').hidden = true; }
    if (e.target.id === 'demoSignOut') { state.demoSignedIn = false; state.service = null; renderSpotifyAccount(); render(); }
  });
  $('spotifySearchForm').addEventListener('submit', e => { e.preventDefault(); realAction(() => performSearch($('spotifyQuery').value.trim(), $('spotifySearchType').value)); });
  document.querySelectorAll('[data-spotify-tab]').forEach(b => b.addEventListener('click', () => setSpotifyTab(b.dataset.spotifyTab)));
  $('refreshLibrary').addEventListener('click', () => realAction(() => fetchMyPlaylists(true)));
  $('loadMorePlaylists').addEventListener('click', () => realAction(() => fetchMyPlaylists(false)));
  $('myPlaylists').addEventListener('click', e => {
    const b = e.target.closest('button[data-kind="playlist"]'); if (!b) return;
    realAction(() => loadPlaylist(b.dataset.id, b.dataset.uri));
  });
  $('spotifyResults').addEventListener('click', e => {
    const b = e.target.closest('button.spotify-result'); if (!b) return;
    realAction(async () => {
      if (b.dataset.kind === 'playlist') return loadPlaylist(b.dataset.id, b.dataset.uri);
      const label = b.querySelector('strong')?.textContent || 'Spotify song';
      pendingPlay = { uris: [b.dataset.uri], label };
      realPlaylist = { title: 'Spotify search', total: 1 }; realTracks = []; realTrack = null; playlistListUnavailable = false;
      state.playlist = null; state.service = 0; $('spotifyModal').hidden = true;
      toast(`Song selected: ${label}`);
      goTo(CONFIRM);
    });
  });
  // ---------- Init ----------
  // The Spotify sign-in leaves this page and comes back, so selections are saved for that round trip only.
  const RESUME_KEY = 'bodifi.resume';
  function saveResume() {
    try {
      sessionStorage.setItem(RESUME_KEY, JSON.stringify({
        instructor: state.instructor, instructorChosen: state.instructorChosen, service: state.service, classType: state.classType, playlist: state.playlist,
      }));
    } catch { /* storage unavailable: selections simply start fresh */ }
  }
  const returningFromSpotify = /[?&](code|error)=/.test(location.search);
  if (returningFromSpotify) {
    try { Object.assign(state, JSON.parse(sessionStorage.getItem(RESUME_KEY) || '{}')); } catch { /* ignore */ }
  }
  setRange($('volume'), state.volume);
  render();
  spotify.callback().then(() => {
    if (!returningFromSpotify) return;
    try { sessionStorage.removeItem(RESUME_KEY); } catch { /* ignore */ }
    if (spotify.connected()) { state.service = 0; toast('Spotify connected'); goTo(2); }
  }).catch(report);
})();
