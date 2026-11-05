/* Spotify OAuth PKCE + Web Playback SDK. No client secret is used. */
(() => {
  const SCOPES = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative';
  const store = sessionStorage;
  let player = null, deviceId = null, sdkReady = false;
  const clientId = () => localStorage.getItem('bodifi.spotify.clientId') || '';
  const redirect = () => `${location.origin}${location.pathname}`;
  const b64 = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const hash = async str => b64(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))));
  const token = () => { try { return JSON.parse(store.getItem('bodifi.spotify.token') || 'null'); } catch { return null; } };
  async function auth() {
    if (!clientId()) throw new Error('Enter the Spotify Client ID first.');
    if (!isSecureContext) throw new Error('Spotify login needs HTTPS or http://localhost.');
    const verifier = b64(crypto.getRandomValues(new Uint8Array(64)));
    const state = b64(crypto.getRandomValues(new Uint8Array(16)));
    store.setItem('bodifi.pkce', JSON.stringify({ verifier, state }));
    const q = new URLSearchParams({ client_id: clientId(), response_type: 'code', redirect_uri: redirect(), scope: SCOPES, code_challenge_method: 'S256', code_challenge: await hash(verifier), state });
    location.assign(`https://accounts.spotify.com/authorize?${q}`);
  }
  async function getToken(body) {
    const response = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || data.error || 'Spotify authorization failed');
    const prior = token();
    const next = { ...data, refresh_token: data.refresh_token || prior?.refresh_token, expiry: Date.now() + data.expires_in * 1000 };
    store.setItem('bodifi.spotify.token', JSON.stringify(next));
    return next.access_token;
  }
  async function callback() {
    const p = new URLSearchParams(location.search);
    if (!p.has('code') && !p.has('error')) return;
    const clear = () => history.replaceState({}, '', redirect());
    if (p.has('error')) { const msg = p.get('error'); clear(); throw new Error(`Spotify denied authorization: ${msg}`); }
    const pkce = JSON.parse(store.getItem('bodifi.pkce') || 'null');
    if (!pkce || p.get('state') !== pkce.state) { clear(); throw new Error('Login state mismatch. Try connecting again.'); }
    try {
      await getToken({ grant_type: 'authorization_code', code: p.get('code'), redirect_uri: redirect(), client_id: clientId(), code_verifier: pkce.verifier });
    } finally { store.removeItem('bodifi.pkce'); clear(); }
  }
  async function accessToken() {
    let t = token();
    if (!t) throw new Error('Connect your Spotify account first.');
    if (Date.now() > t.expiry - 60000) {
      if (!t.refresh_token) throw new Error('Spotify session expired. Reconnect.');
      await getToken({ grant_type: 'refresh_token', refresh_token: t.refresh_token, client_id: clientId() });
      t = token();
    }
    return t.access_token;
  }
  async function api(path, { method = 'GET', body } = {}) {
    const make = async () => fetch(`https://api.spotify.com/v1${path}`, { method, headers: { Authorization: `Bearer ${await accessToken()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    let r = await make();
    if (r.status === 401 && token()?.refresh_token) { await getToken({ grant_type: 'refresh_token', refresh_token: token().refresh_token, client_id: clientId() }); r = await make(); }
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `Spotify API error ${r.status}`); }
    return r.status === 204 || r.status === 202 ? null : r.json();
  }
  function sdk() {
    return new Promise((resolve, reject) => {
      if (window.Spotify) return resolve();
      const timeout = setTimeout(() => reject(new Error('Spotify SDK timed out. Check network or browser restrictions.')), 12000);
      const previous = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = () => { clearTimeout(timeout); previous?.(); resolve(); };
      if (!document.querySelector('script[data-spotify-sdk]')) { const s = document.createElement('script'); s.src = 'https://sdk.scdn.co/spotify-player.js'; s.dataset.spotifySdk = 'true'; s.onerror = () => { clearTimeout(timeout); reject(new Error('Could not load Spotify Web Playback SDK.')); }; document.head.append(s); }
    });
  }
  async function connect(onState, onError) {
    if (player && deviceId) { await player.activateElement?.(); return deviceId; }
    await sdk();
    player = new Spotify.Player({ name: 'BODiFi Music Player', getOAuthToken: async cb => { try { cb(await accessToken()); } catch (e) { onError(e); } }, volume: .72 });
    player.addListener('ready', ({ device_id }) => { deviceId = device_id; sdkReady = true; onState?.({ ready: true }); });
    player.addListener('not_ready', () => { deviceId = null; sdkReady = false; onState?.({ ready: false }); });
    player.addListener('player_state_changed', data => { if (data) onState?.({ playback: data }); });
    for (const name of ['initialization_error', 'authentication_error', 'account_error', 'playback_error']) player.addListener(name, ({ message }) => onError(new Error(`${name}: ${message}`)));
    if (!await player.connect()) throw new Error('Spotify player could not connect. Premium is required.');
    await player.activateElement?.();
    return await new Promise((resolve, reject) => { let attempts = 0; const check = () => { if (deviceId) return resolve(deviceId); if (++attempts > 40) return reject(new Error('Spotify device not ready.')); setTimeout(check, 250); }; check(); });
  }
  async function play({ uris, context_uri, offset } = {}) {
    if (!deviceId) throw new Error('Connect the Spotify browser player first.');
    await api('/me/player', { method: 'PUT', body: { device_ids: [deviceId], play: false } });
    const body = context_uri ? { context_uri, ...(offset != null ? { offset } : {}) } : { uris };
    return api(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, { method: 'PUT', body });
  }
  const search = async (q, type = 'track,playlist', offset = 0) => api(`/search?${new URLSearchParams({ q, type, limit: '10', offset: String(offset) })}`);
  const myPlaylists = async (offset = 0) => api(`/me/playlists?limit=20&offset=${offset}`);
  const playlistItems = async id => api(`/playlists/${encodeURIComponent(id)}/items?limit=50`);
  async function playlistItemsAll(id) {
    let offset = 0, all = [], total = Infinity;
    while (offset < total && all.length < 1000) {
      const page = await api(`/playlists/${encodeURIComponent(id)}/items?limit=50&offset=${offset}`);
      const batch = page.items || [];
      all.push(...batch);
      total = page.total ?? all.length;
      if (!batch.length) break;
      offset += batch.length;
    }
    return all;
  }
  window.BodifiSpotify = {
    auth, callback, clientId, setClientId(id) { localStorage.setItem('bodifi.spotify.clientId', id.trim()); },
    connected: () => Boolean(token()), accessToken, api, connect, play, search, myPlaylists, playlistItems, playlistItemsAll,
    pause: () => api('/me/player/pause', { method: 'PUT' }), resume: () => api('/me/player/play', { method: 'PUT' }),
    next: () => api('/me/player/next', { method: 'POST' }), prev: () => api('/me/player/previous', { method: 'POST' }),
    seek: ms => api(`/me/player/seek?position_ms=${Math.round(ms)}`, { method: 'PUT' }),
    volume: value => api(`/me/player/volume?volume_percent=${Math.round(value)}`, { method: 'PUT' }),
    shuffle: enabled => api(`/me/player/shuffle?state=${enabled}`, { method: 'PUT' }),
    logout() { store.removeItem('bodifi.spotify.token'); player?.disconnect(); player = null; deviceId = null; },
    device: () => deviceId,
  };
})();
