/**
 * Cloudflare Pages Function — /api/lead v2
 * שומר ליד ב-KV + שולח WhatsApp (CallMeBot) + Email (Resend)
 * KV bindings: YKP_LEADS, YKP_WIDGET_CONFIG
 */

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// מיפוי שירותים → אימוג'י + המלצות קרובות
const SERVICE_MAP = {
  'הקלטה':   { emoji: '🎙️', related: 'עריכה, מיקס ומאסטר, ווידאו' },
  'recording':{ emoji: '🎙️', related: 'עריכה, מיקס ומאסטר, ווידאו' },
  'ווידאו':   { emoji: '🎬', related: 'ריל לאינסטגרם, עריכה, הפקה' },
  'video':    { emoji: '🎬', related: 'ריל לאינסטגרם, עריכה, הפקה' },
  'פודקאסט': { emoji: '🎧', related: 'הקלטה, עריכה, הפצה לספוטיפיי' },
  'podcast':  { emoji: '🎧', related: 'הקלטה, עריכה, הפצה לספוטיפיי' },
  'אירועים': { emoji: '🎪', related: 'שידור חי, הקלטה, ווידאו' },
  'events':   { emoji: '🎪', related: 'שידור חי, הקלטה, ווידאו' },
  'אקדמיה':  { emoji: '🎓', related: 'הקלטה, ווידאו, עריכה' },
  'academy':  { emoji: '🎓', related: 'הקלטה, ווידאו, עריכה' },
};

function getServiceInfo(service) {
  if (!service) return { emoji: '📋', related: null };
  const key = Object.keys(SERVICE_MAP).find(k =>
    service.toLowerCase().includes(k.toLowerCase())
  );
  return SERVICE_MAP[key] || { emoji: '📋', related: null };
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' });
    const date = d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jerusalem' });
    return time + ' | ' + date;
  } catch { return ts; }
}

async function sendWhatsApp(phone, apiKey, message) {
  const encoded = encodeURIComponent(message);
  const url = 'https://api.callmebot.com/whatsapp.php?phone=' + phone + '&text=' + encoded + '&apikey=' + apiKey;
  await fetch(url);
}

async function sendEmail(apiKey, toEmail, subject, htmlBody) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'גל | יקיר כהן <onboarding@resend.dev>',
      to: [toEmail],
      subject,
      html: htmlBody
    })
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ ok: false }), { status: 400, headers: CORS }); }

  const { name, phone, service, page, ts } = body;
  if (!name || !phone) {
    return new Response(JSON.stringify({ ok: false, error: 'missing fields' }), { status: 400, headers: CORS });
  }

  const timestamp = ts || new Date().toISOString();
  const key = 'lead:' + Date.now();
  const lead = { name, phone, service: service || 'כללי', page: page || '', ts: timestamp };

  // 1. שמור ב-KV (180 יום)
  await env.YKP_LEADS.put(key, JSON.stringify(lead), { expirationTtl: 60 * 60 * 24 * 180 });

  const svcInfo = getServiceInfo(service);
  const timeStr = formatTime(timestamp);

  // 2. WhatsApp דרך CallMeBot
  const waPhone  = await env.YKP_WIDGET_CONFIG.get('CALLMEBOT_PHONE');
  const waApiKey = await env.YKP_WIDGET_CONFIG.get('CALLMEBOT_APIKEY');
  if (waPhone && waApiKey) {
    const lines = [
      '🔔 *ליד חדש מגל!*',
      '',
      '👤 שם: ' + name,
      '📞 טלפון: ' + phone,
      svcInfo.emoji + ' שירות: ' + (service || 'כללי'),
      svcInfo.related ? '💡 עשוי להתעניין ב: ' + svcInfo.related : '',
      page ? '📄 עמוד: ' + page : '',
      '⏰ ' + timeStr
    ].filter(Boolean).join('\n');
    try { await sendWhatsApp(waPhone, waApiKey, lines); } catch (_) {}
  }

  // 3. מייל דרך Resend
  const resendKey   = await env.YKP_WIDGET_CONFIG.get('RESEND_API_KEY');
  const notifyEmail = await env.YKP_WIDGET_CONFIG.get('NOTIFY_EMAIL');
  if (resendKey && notifyEmail) {
    const html = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:12px;">' +
      '<h2 style="color:#e63946;margin-top:0;">🔔 ליד חדש מגל!</h2>' +
      '<table style="width:100%;border-collapse:collapse;">' +
      '<tr><td style="padding:8px 0;color:#555;width:130px;">👤 שם</td><td style="font-weight:bold;">' + name + '</td></tr>' +
      '<tr><td style="padding:8px 0;color:#555;">📞 טלפון</td><td><a href="tel:' + phone + '" style="color:#e63946;">' + phone + '</a></td></tr>' +
      '<tr><td style="padding:8px 0;color:#555;">' + svcInfo.emoji + ' שירות</td><td>' + (service || 'כללי') + '</td></tr>' +
      (svcInfo.related ? '<tr><td style="padding:8px 0;color:#555;">💡 פוטנציאל</td><td style="color:#128C7E;">' + svcInfo.related + '</td></tr>' : '') +
      (page ? '<tr><td style="padding:8px 0;color:#555;">📄 עמוד</td><td>' + page + '</td></tr>' : '') +
      '<tr><td style="padding:8px 0;color:#555;">⏰ זמן</td><td>' + timeStr + '</td></tr>' +
      '</table>' +
      '<a href="tel:' + phone + '" style="display:inline-block;margin-top:16px;background:#e63946;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">📞 התקשר עכשיו</a>' +
      '</div>';
    try { await sendEmail(resendKey, notifyEmail, '🔔 ליד חדש: ' + name + ' — ' + (service || 'כללי'), html); } catch (_) {}
  }

  return new Response(JSON.stringify({ ok: true }), { headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
