/* BODiFi on-screen touch keyboard.
   Shown automatically whenever a text field inside the page gets focus (1024 x 600 touchscreen).
   Note: it cannot type into pages hosted by other sites (e.g. the Spotify login page);
   that page needs the operating system's own on-screen keyboard. */
(() => {
  'use strict';
  // Always on for this touchscreen prototype (some kiosk browsers do not report touch support).
  // Add ?keyboard=0 to the URL to turn it off, e.g. when testing with a physical keyboard.
  if (new URLSearchParams(location.search).get('keyboard') === '0') return;

  const TEXT_TYPES = new Set(['text', 'search', 'email', 'password', 'url', 'tel', 'number', '']);
  const LAYOUTS = {
    letters: [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l'],
      ['shift','z','x','c','v','b','n','m','back'],
      ['sym',',','space','.','enter'],
    ],
    symbols: [
      ['1','2','3','4','5','6','7','8','9','0'],
      ['@','#','$','_','&','-','+','(',')','/'],
      ['*','"',"'",':',';','!','?','%','back'],
      ['abc',',','space','.','enter'],
    ],
  };
  const LABELS = { back: '⌫', shift: '⇧', enter: '↵', sym: '123', abc: 'ABC', space: 'space' };

  let target = null;
  let mode = 'letters';
  let shift = false;
  let root = null;

  const isTextField = (el) => {
    if (!el || !el.matches) return false;
    if (el.tagName === 'TEXTAREA') return true;
    return el.tagName === 'INPUT' && TEXT_TYPES.has((el.getAttribute('type') || '').toLowerCase());
  };

  function build() {
    root = document.createElement('div');
    root.className = 'osk';
    root.id = 'osk';
    root.hidden = true;
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', 'On-screen keyboard');
    root.innerHTML = '<div class="osk-bar"><span id="oskHint">Keyboard</span><button type="button" class="osk-key osk-hide" data-key="hide" tabindex="-1" aria-label="Hide keyboard">Hide ⌄</button></div><div class="osk-rows" id="oskRows"></div>';
    document.body.append(root);
    // Pointer-down is used (not click) so the text field never loses focus while typing.
    root.addEventListener('pointerdown', (e) => {
      const key = e.target.closest('[data-key]');
      e.preventDefault();
      if (key) press(key.dataset.key);
    });
    root.addEventListener('mousedown', (e) => e.preventDefault());
    root.addEventListener('click', (e) => e.preventDefault());
  }

  function renderKeys() {
    const rows = LAYOUTS[mode];
    document.getElementById('oskRows').innerHTML = rows.map((row) => `<div class="osk-row">${row.map((k) => {
      const label = LABELS[k] || (mode === 'letters' && shift ? k.toUpperCase() : k);
      const cls = ['osk-key', LABELS[k] ? `osk-${k}` : '', k === 'shift' && shift ? 'on' : ''].filter(Boolean).join(' ');
      const aria = { back: 'Backspace', shift: 'Shift', enter: 'Enter', sym: 'Numbers and symbols', abc: 'Letters', space: 'Space' }[k] || label;
      return `<button type="button" tabindex="-1" class="${cls}" data-key="${k}" aria-label="${aria}">${label}</button>`;
    }).join('')}</div>`).join('');
  }

  function setHeight() {
    document.documentElement.style.setProperty('--kb-h', `${root.offsetHeight}px`);
  }

  function show(el) {
    if (!root) build();
    target = el;
    if (!el.dataset.oskInputmode) el.dataset.oskInputmode = el.getAttribute('inputmode') || '-';
    el.setAttribute('inputmode', 'none'); // keep the browser's own keyboard from also opening
    document.getElementById('oskHint').textContent = el.getAttribute('aria-label') || el.getAttribute('placeholder') || 'Keyboard';
    mode = 'letters';
    shift = el.value.length === 0 && el.getAttribute('autocapitalize') !== 'off';
    renderKeys();
    root.hidden = false;
    document.body.classList.add('kb-open');
    setHeight();
    requestAnimationFrame(() => {
      setHeight();
      try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch { /* ignore */ }
    });
  }

  function hide() {
    if (!root || root.hidden) return;
    root.hidden = true;
    document.body.classList.remove('kb-open');
    document.documentElement.style.removeProperty('--kb-h');
    target = null;
  }

  function fire(el) { el.dispatchEvent(new Event('input', { bubbles: true })); }

  function insert(text) {
    const el = target;
    el.focus({ preventScroll: true });
    try {
      const s = el.selectionStart ?? el.value.length;
      const e = el.selectionEnd ?? s;
      el.setRangeText(text, s, e, 'end');
    } catch { el.value += text; } // e.g. type=email has no selection API
    fire(el);
  }

  function backspace() {
    const el = target;
    el.focus({ preventScroll: true });
    try {
      const s = el.selectionStart ?? el.value.length;
      const e = el.selectionEnd ?? s;
      if (s !== e) el.setRangeText('', s, e, 'end');
      else if (s > 0) el.setRangeText('', s - 1, s, 'end');
    } catch { el.value = el.value.slice(0, -1); }
    fire(el);
  }

  function press(key) {
    if (key === 'hide') { target?.blur(); hide(); return; }
    if (!target || !target.isConnected) { hide(); return; }
    if (key === 'back') return backspace();
    if (key === 'shift') { shift = !shift; return renderKeys(); }
    if (key === 'sym') { mode = 'symbols'; return renderKeys(); }
    if (key === 'abc') { mode = 'letters'; return renderKeys(); }
    if (key === 'enter') {
      const form = target.form;
      if (target.tagName === 'TEXTAREA') return insert('\n');
      const next = target.dataset.oskNext && document.querySelector(target.dataset.oskNext);
      if (next) { next.focus(); return; }
      if (form) { target.blur(); hide(); form.requestSubmit(); } else { target.blur(); hide(); }
      return;
    }
    if (key === 'space') return insert(' ');
    insert(mode === 'letters' && shift ? key.toUpperCase() : key);
    if (mode === 'letters' && shift) { shift = false; renderKeys(); }
  }

  document.addEventListener('focusin', (e) => { if (isTextField(e.target)) show(e.target); });
  // Tapping anywhere that is neither the keyboard nor a text field closes it.
  // Where the press STARTED is remembered on pointer-down, but the keyboard is closed only on click:
  // showing/hiding the keyboard moves the layout, and a click can then land on a different element
  // than the finger started on. A tap on the dim backdrop closes just the keyboard, not the dialog.
  let outsidePress = null;
  document.addEventListener('pointerdown', (e) => {
    const outside = root && !root.hidden && !e.target.closest('#osk') && !isTextField(e.target);
    outsidePress = outside ? { backdrop: e.target.classList.contains('spotify-modal') } : null;
  }, true);
  document.addEventListener('click', (e) => {
    if (!outsidePress) return;
    const { backdrop } = outsidePress;
    outsidePress = null;
    hide();
    if (backdrop) e.stopPropagation();
  }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  window.addEventListener('resize', () => { if (root && !root.hidden) setHeight(); });
})();
