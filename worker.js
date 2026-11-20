// Cloudflare Worker "karaoke-search": YouTube search for the Karaoke Queue big screen.
// The YouTube API key stays here as a secret; the TV only sends the party password.
//
// Secrets to set (Worker → Settings → Variables and Secrets, type "Secret"):
//   YT_API_KEY      your YouTube Data API v3 key
//   PARTY_PASSWORD  the password you'll type on the TV once
//
// Endpoints (all need header  X-Party-Password: <password>):
//   GET /check          -> { ok: true }   (used to test the password)
//   GET /search?q=...   -> { items: [{ videoId, title, channel }] }

const ALLOWED_ORIGINS = ['https://duckunicorn.github.io'];
const SITE = 'https://duckunicorn.github.io/'; // the API key only accepts this referrer

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Party-Password',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
    if (!env.YT_API_KEY || !env.PARTY_PASSWORD) return json({ error: 'Worker is missing its YT_API_KEY or PARTY_PASSWORD secret.' }, 500);

    if (!(await samePassword(request.headers.get('X-Party-Password') || '', env.PARTY_PASSWORD))) {
      await new Promise(r => setTimeout(r, 400)); // slow down guessing
      return json({ error: 'Wrong party password.' }, 401);
    }

    const url = new URL(request.url);
    if (url.pathname === '/check') return json({ ok: true });

    if (url.pathname === '/search') {
      const q = (url.searchParams.get('q') || '').trim().slice(0, 120);
      if (!q) return json({ items: [] });

      // Cache results for a day so repeat songs don't use up the YouTube quota.
      const cacheKey = new Request('https://karaoke-search.cache/search?q=' + encodeURIComponent(q.toLowerCase()));
      const cache = caches.default;
      const hit = await cache.match(cacheKey);
      if (hit) return json(await hit.json());

      const api = new URL('https://www.googleapis.com/youtube/v3/search');
      for (const [k, v] of Object.entries({
        part: 'snippet', type: 'video', videoEmbeddable: 'true', maxResults: '10', q, key: env.YT_API_KEY,
      })) api.searchParams.set(k, v);

      const res = await fetch(api, { headers: { Referer: SITE } });
      const data = await res.json();
      if (data.error) return json({ error: 'YouTube: ' + (data.error.message || res.status) }, 502);

      const body = {
        items: (data.items || []).filter(it => it.id && it.id.videoId).map(it => ({
          videoId: it.id.videoId,
          title: decode(it.snippet.title),
          channel: decode(it.snippet.channelTitle),
        })),
      };
      ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=86400' },
      })));
      return json(body);
    }

    return json({ error: 'Not found' }, 404);
  },
};

async function samePassword(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

function decode(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
