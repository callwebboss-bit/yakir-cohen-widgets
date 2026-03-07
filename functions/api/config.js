/**
 * Cloudflare Pages Function — /api/config
 * GET  → קריאת config מ-KV
 * POST → כתיבת config ל-KV (מוגן בסיסמה)
 * KV binding: YKP_WIDGET_CONFIG
 */

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
};

const CONFIG_KEY = 'gal:config';

export async function onRequestGet(context) {
  const { env } = context;
  const raw = await env.YKP_WIDGET_CONFIG.get(CONFIG_KEY);
  const cfg = raw ? JSON.parse(raw) : {};
  return new Response(JSON.stringify(cfg), { headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  /* אימות token */
  const token      = request.headers.get('X-Admin-Token');
  const storedToken = await env.YKP_WIDGET_CONFIG.get('ADMIN_TOKEN');
  if (!storedToken || token !== storedToken) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: CORS });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: CORS });
  }

  await env.YKP_WIDGET_CONFIG.put(CONFIG_KEY, JSON.stringify(body));
  return new Response(JSON.stringify({ ok: true }), { headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
