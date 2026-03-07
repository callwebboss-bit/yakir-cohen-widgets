/**
 * Cloudflare Pages Function — /api/leads-list
 * מחזיר רשימת לידים לפאנל הניהול (מוגן)
 * KV binding: YKP_LEADS, YKP_WIDGET_CONFIG
 */

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
};

export async function onRequestGet(context) {
  const { request, env } = context;

  const token       = request.headers.get('X-Admin-Token');
  const storedToken = await env.YKP_WIDGET_CONFIG.get('ADMIN_TOKEN');
  if (!storedToken || token !== storedToken) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401, headers: CORS });
  }

  const list   = await env.YKP_LEADS.list({ prefix: 'lead:' });
  const leads  = [];

  for (const key of list.keys) {
    const val = await env.YKP_LEADS.get(key.name);
    if (val) leads.push(JSON.parse(val));
  }

  leads.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  return new Response(JSON.stringify({ ok: true, leads }), { headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
