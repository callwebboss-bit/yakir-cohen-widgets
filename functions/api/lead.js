/**
 * Cloudflare Pages Function — /api/lead
 * שומר ליד ב-KV + שולח וואטסאפ webhook (אופציונלי)
 * KV binding: YKP_LEADS
 */

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: CORS });
  }

  const { name, phone, service, page, ts } = body;
  if (!name || !phone) {
    return new Response(JSON.stringify({ ok: false, error: 'missing fields' }), { status: 400, headers: CORS });
  }

  /* שמור ב-YKP_LEADS — key לפי timestamp */
  const key  = `lead:${ts || Date.now()}`;
  const lead = { name, phone, service: service || 'כללי', page: page || '', ts: ts || new Date().toISOString() };
  await env.YKP_LEADS.put(key, JSON.stringify(lead), { expirationTtl: 60 * 60 * 24 * 90 }); // 90 יום

  /* Webhook לוואטסאפ עסקי (אופציונלי) */
  const webhookUrl = await env.YKP_WIDGET_CONFIG.get('LEAD_WEBHOOK_URL');
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 ליד חדש מגל!\nשם: ${name}\nטלפון: ${phone}\nשירות: ${service}\nעמוד: ${page}`
        })
      });
    } catch (_) {}
  }

  return new Response(JSON.stringify({ ok: true }), { headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
