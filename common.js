// Shared helpers for the host (index.html) and guest (join.html) pages.
window.KQ = (() => {
  const PEER_PREFIX = 'kq-karaoke-queue-v1-';
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I / O to avoid confusion

  const LS = {
    get(k, d) {
      try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode etc. */ }
    },
  };

  function newCode(len = 4) {
    let s = '';
    const buf = new Uint32Array(len);
    crypto.getRandomValues(buf);
    for (const n of buf) s += CODE_CHARS[n % CODE_CHARS.length];
    return s;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function clean(s, max) {
    return String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
  }

  // Pull an 11-character YouTube video id out of any common YouTube link.
  function ytId(text) {
    if (!text) return null;
    text = text.trim();
    const valid = v => (v && /^[\w-]{11}$/.test(v) ? v : null);
    let u;
    try { u = new URL(/^https?:\/\//i.test(text) ? text : 'https://' + text); } catch { return null; }
    const host = u.hostname.replace(/^(www|m|music)\./, '');
    if (host === 'youtu.be') return valid(u.pathname.slice(1).split('/')[0]);
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.searchParams.get('v')) return valid(u.searchParams.get('v'));
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{11})/);
      if (m) return m[2];
    }
    return null;
  }

  function thumb(id) {
    return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
  }

  // Render a QR code as a crisp, scalable SVG string.
  function qrSvg(text) {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount(), m = 2, size = n + m * 2;
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + m},${r + m}h1v1h-1z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  }

  function toast(text, ms = 3500) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, ms);
  }

  return { PEER_PREFIX, LS, newCode, uid, esc, clean, ytId, thumb, qrSvg, toast };
})();
