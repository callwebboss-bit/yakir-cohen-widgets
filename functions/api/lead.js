/**
 * Cloudflare Pages Function — /api/lead v3
 * שומר ליד ב-KV + שולח WhatsApp (CallMeBot) + Email ליקיר + Email ללקוח (Resend)
 * KV bindings: YKP_LEADS, YKP_WIDGET_CONFIG
 */

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const WA_LINK = 'https://wa.me/972587555456?text=';
const PHONE_DISPLAY = '058-755-5456';
const INSTAGRAM = 'https://www.instagram.com/yakir.cohen.official/';

// מיפוי שירותים → פרטים מלאים למייל ללקוח
const SERVICE_DATA = {
  'הקלטה':   {
    emoji: '🎙️',
    title: 'הקלטה מקצועית באולפן',
    related: 'עריכה, מיקס ומאסטר, ווידאו',
    items: ['הקלטה בסטודיו עם ציוד מהמתקדמים בעולם', 'תיקון זיופים מקצועי עם Melodyne', 'מיקס ומאסטרינג מלא', 'אספקה תוך 24–48 שעות', 'ליווי מקצועי צמוד לאורך כל התהליך'],
    upsells: [
      { emoji: '🎬', title: 'שיר וקליפ משפחתי', desc: 'הפך את השיר שלך לסרטון מרגש לנצח' },
      { emoji: '📱', title: 'ריל לאינסטגרם', desc: 'תוכן וידאו קצר ואיכותי שמגדיל קהל' },
      { emoji: '🎧', title: 'סטודיו פודקאסט', desc: 'פתח ערוץ מקצועי וצמח את קהל המאזינים' }
    ]
  },
  'recording': {
    emoji: '🎙️',
    title: 'Professional Studio Recording',
    related: 'עריכה, מיקס ומאסטר, ווידאו',
    items: ['הקלטה בסטודיו עם ציוד מהמתקדמים בעולם', 'תיקון זיופים מקצועי עם Melodyne', 'מיקס ומאסטרינג מלא', 'אספקה תוך 24–48 שעות', 'ליווי מקצועי צמוד לאורך כל התהליך'],
    upsells: [
      { emoji: '🎬', title: 'שיר וקליפ משפחתי', desc: 'הפך את השיר לסרטון מרגש לנצח' },
      { emoji: '🎧', title: 'סטודיו פודקאסט', desc: 'פתח ערוץ מקצועי ברמה בינלאומית' },
      { emoji: '🎓', title: 'האקדמיה של יקיר', desc: 'קורסי DJ, הנדסת סאונד ו-AI למוזיקה' }
    ]
  },
  'ווידאו':  {
    emoji: '🎬',
    title: 'שיר וקליפ משפחתי',
    related: 'ריל לאינסטגרם, עריכה, הפקה',
    items: ['צילום 4K מקצועי', 'הקלטה באולפן כולל מיקס ומאסטרינג', 'עריכה קצבית ומרגשת', 'חוויה משפחתית בלתי נשכחת', 'קובץ מוכן לשיתוף ולשמירה לנצח'],
    upsells: [
      { emoji: '🎙️', title: 'הקלטת שיר באולפן', desc: 'הוסף עוד שיר לאוסף שלך — ספקה תוך 48 שעות' },
      { emoji: '📱', title: 'ריל לאינסטגרם', desc: 'גזירת קטעי Reels מהקליפ לרשתות החברתיות' },
      { emoji: '🎧', title: 'סטודיו פודקאסט', desc: 'תחום פרימיום שצומח בישראל' }
    ]
  },
  'video':   {
    emoji: '🎬',
    title: 'Family Song & Video Clip',
    related: 'ריל לאינסטגרם, עריכה, הפקה',
    items: ['צילום 4K מקצועי', 'הקלטה באולפן כולל מיקס ומאסטרינג', 'עריכה קצבית ומרגשת', 'חוויה משפחתית בלתי נשכחת', 'קובץ מוכן לשיתוף ולשמירה לנצח'],
    upsells: [
      { emoji: '🎙️', title: 'הקלטה נוספת באולפן', desc: 'הוסף עוד שיר — ספקה תוך 48 שעות' },
      { emoji: '📱', title: 'Reels לאינסטגרם', desc: 'גזירת קטעי Reels מהקליפ לקידום' },
      { emoji: '✨', title: 'הפקת אירועים', desc: 'נסגור את כל ה-DJ ואטרקציות לאירוע' }
    ]
  },
  'פודקאסט': {
    emoji: '🎧',
    title: 'סטודיו פודקאסט מקצועי',
    related: 'הקלטה, עריכה, הפצה לספוטיפיי',
    items: ['אולפן פודקאסט מצולם מרובה מצלמות', 'סאונד ברמה בינלאומית', 'עריכה מלאה מוכנה להפצה', 'גזירת Reels לקידום ברשתות', 'הפצה לספוטיפיי, Apple Podcasts ועוד'],
    upsells: [
      { emoji: '🎙️', title: 'הקלטת שיר ג\'ינגל', desc: 'ג\'ינגל מותאם לפודקאסט שלך ומחזק את המותג' },
      { emoji: '📱', title: 'חבילת Reels', desc: 'עריכת קטעים קצרים לאינסטגרם ו-TikTok' },
      { emoji: '🎬', title: 'קליפ הצגה לפודקאסט', desc: 'סרטון מקצועי שיגרום לאנשים לעקוב' }
    ]
  },
  'podcast': {
    emoji: '🎧',
    title: 'Professional Podcast Studio',
    related: 'הקלטה, עריכה, הפצה לספוטיפיי',
    items: ['אולפן פודקאסט מצולם מרובה מצלמות', 'סאונד ברמה בינלאומית', 'עריכה מלאה מוכנה להפצה', 'גזירת Reels לקידום ברשתות', 'הפצה לספוטיפיי, Apple Podcasts ועוד'],
    upsells: [
      { emoji: '🎙️', title: 'ג\'ינגל לפודקאסט', desc: 'ג\'ינגל מקצועי שמחזק את המותג שלך' },
      { emoji: '📱', title: 'חבילת Reels', desc: 'עריכת קטעים קצרים לרשתות החברתיות' },
      { emoji: '🎬', title: 'קליפ הצגה', desc: 'סרטון שגורם לאנשים לרצות לעקוב' }
    ]
  },
  'אירועים': {
    emoji: '🎪',
    title: 'אטרקציות ואירועים',
    related: 'שידור חי, הקלטה, ווידאו',
    items: ['DJ מקצועיים ומנוסים', 'אטרקציות ייחודיות ומותאמות אישית', 'הפקת אירועים מלאה', 'ציוד סאונד ותאורה ברמה הגבוהה', 'ניסיון עם מאות אירועים ברחבי הארץ'],
    upsells: [
      { emoji: '🎬', title: 'צילום האירוע', desc: 'תיעוד מקצועי של כל רגע מהאירוע שלך' },
      { emoji: '🎙️', title: 'שיר מיוחד לאירוע', desc: 'הקלטת שיר ייחודי לאירוע — מתנה שתזכרו לנצח' },
      { emoji: '📡', title: 'שידור חי', desc: 'שדר את האירוע לרחוקים ומשפחה שלא יכולים להגיע' }
    ]
  },
  'events':  {
    emoji: '🎪',
    title: 'Events & Entertainment',
    related: 'שידור חי, הקלטה, ווידאו',
    items: ['DJ מקצועיים ומנוסים', 'אטרקציות ייחודיות ומותאמות אישית', 'הפקת אירועים מלאה', 'ציוד סאונד ותאורה ברמה הגבוהה', 'ניסיון עם מאות אירועים ברחבי הארץ'],
    upsells: [
      { emoji: '🎬', title: 'צילום האירוע', desc: 'תיעוד מקצועי לכל הרגעים שלכם' },
      { emoji: '🎙️', title: 'שיר מיוחד לאירוע', desc: 'הקלטת שיר ייחודי — מתנה לנצח' },
      { emoji: '📡', title: 'שידור חי', desc: 'שדר את האירוע לרחוקים שלא יכולים להגיע' }
    ]
  },
  'אקדמיה': {
    emoji: '🎓',
    title: 'האקדמיה של יקיר כהן',
    related: 'הקלטה, ווידאו, עריכה',
    items: ['קורס DJ מעשי מרמת מתחיל ועד מקצוען', 'הנדסת סאונד — מהבסיס ועד לעבוד מקצועית', 'AI למוזיקה — הטכנולוגיה שמשנה את התעשייה', 'טיפול בגמגום דרך מוזיקה', 'ליווי אישי מיקיר עצמו'],
    upsells: [
      { emoji: '🎙️', title: 'הקלטה מקצועית', desc: 'תרגל את מה שלמדת עם הקלטה אמיתית באולפן' },
      { emoji: '🎧', title: 'ערוץ פודקאסט', desc: 'הקם ערוץ פודקאסט לשיתוף הידע שצברת' },
      { emoji: '🎬', title: 'פרויקט סיום קליפ', desc: 'סיים את הקורס עם קליפ מקצועי שלך' }
    ]
  },
  'academy': {
    emoji: '🎓',
    title: 'Yakir Cohen Academy',
    related: 'הקלטה, ווידאו, עריכה',
    items: ['קורס DJ מעשי מרמת מתחיל ועד מקצוען', 'הנדסת סאונד — מהבסיס ועד לעבוד מקצועית', 'AI למוזיקה — הטכנולוגיה שמשנה את התעשייה', 'טיפול בגמגום דרך מוזיקה', 'ליווי אישי מיקיר עצמו'],
    upsells: [
      { emoji: '🎙️', title: 'הקלטה מקצועית', desc: 'תרגל את מה שלמדת עם הקלטה אמיתית' },
      { emoji: '🎧', title: 'ערוץ פודקאסט', desc: 'הקם ערוץ פודקאסט לשיתוף הידע שלך' },
      { emoji: '🎬', title: 'קליפ פרויקט סיום', desc: 'סיים את הקורס עם קליפ מקצועי' }
    ]
  }
};

function getServiceData(service) {
  if (!service) return { emoji: '📋', title: 'פנייה כללית', related: null, items: [], upsells: [] };
  const key = Object.keys(SERVICE_DATA).find(k =>
    service.toLowerCase().includes(k.toLowerCase())
  );
  return SERVICE_DATA[key] || { emoji: '📋', title: service, related: null, items: [], upsells: [] };
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

async function sendEmail(apiKey, toEmail, subject, htmlBody, replyTo) {
  const payload = {
    from: 'גל | יקיר כהן 🎵 <onboarding@resend.dev>',
    to: [toEmail],
    subject,
    html: htmlBody
  };
  if (replyTo) payload.reply_to = replyTo;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// ─── מייל ללקוח — HTML יפה עם upsells ───────────────────────────────────────
function buildCustomerEmail(name, service, svc) {
  const waText = encodeURIComponent('היי יקיר! קיבלתי את המייל ואשמח לדבר על ' + (service || 'השירותים שלכם'));

  const itemsHtml = svc.items.map(item =>
    '<div style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;font-size:14px;color:#334155">' +
    '<span style="color:#22c55e;font-weight:bold;flex-shrink:0">✓</span>' +
    '<span>' + item + '</span>' +
    '</div>'
  ).join('');

  const upsellsHtml = svc.upsells.map(u =>
    '<div style="flex:1;min-width:140px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center">' +
    '<div style="font-size:24px;margin-bottom:6px">' + u.emoji + '</div>' +
    '<div style="font-weight:700;font-size:13px;color:#1e293b;margin-bottom:4px">' + u.title + '</div>' +
    '<div style="font-size:12px;color:#64748b;line-height:1.4">' + u.desc + '</div>' +
    '</div>'
  ).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,Heebo,sans-serif">
<div style="max-width:580px;margin:0 auto">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);border-radius:16px 16px 0 0;padding:36px 28px;text-align:center">
    <div style="font-size:42px;margin-bottom:12px">🎵</div>
    <h1 style="color:#ffffff;margin:0 0 8px;font-size:24px;font-weight:800">היי ${name}! 🙌</h1>
    <p style="color:#94a3b8;margin:0;font-size:15px">קיבלנו את הפנייה שלך — יקיר יחזור אליך בהקדם</p>
  </div>

  <!-- Service confirmed -->
  <div style="background:#ffffff;padding:28px;border-bottom:1px solid #f1f5f9">
    <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #6ee7b7;border-radius:10px;padding:10px 18px;margin-bottom:20px">
      <span style="font-size:20px">${svc.emoji}</span>
      <div>
        <div style="font-size:12px;color:#059669;font-weight:600;text-transform:uppercase;letter-spacing:.5px">הפנייה שלך</div>
        <div style="font-size:16px;font-weight:800;color:#065f46">${svc.title}</div>
      </div>
    </div>
    <h3 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 12px">מה כלול בשירות:</h3>
    ${itemsHtml}
  </div>

  <!-- Upsells -->
  <div style="background:#ffffff;padding:24px;border-bottom:1px solid #f1f5f9">
    <h3 style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 6px">💡 אולי יעניין אותך גם:</h3>
    <p style="color:#64748b;font-size:13px;margin:0 0 16px">הלקוחות שלנו שמגיעים ל${svc.title.split(' ')[0]} לרוב מחפשים גם:</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">${upsellsHtml}</div>
  </div>

  <!-- Social proof -->
  <div style="background:#fffbeb;padding:16px 24px;border-bottom:1px solid #fde68a;text-align:center">
    <span style="font-size:14px;color:#92400e;font-weight:600">⭐ 280+ ביקורות חמש כוכבים | לקוחות מרוצים מכל הארץ 🇮🇱</span>
  </div>

  <!-- CTA -->
  <div style="background:#ffffff;padding:28px;text-align:center">
    <p style="color:#475569;margin:0 0 20px;font-size:14px;line-height:1.6">
      יקיר יחזור אליך בהקדם 📲<br>
      <strong>רוצה תשובה מיידית? מוזמן לפנות ישירות:</strong>
    </p>
    <a href="https://wa.me/972587555456?text=${waText}"
       style="display:inline-block;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;padding:15px 36px;border-radius:12px;text-decoration:none;font-weight:800;font-size:16px;margin-bottom:14px;letter-spacing:.3px">
      💬 WhatsApp — יקיר עונה תוך דקות
    </a>
    <br>
    <a href="tel:0587555456"
       style="display:inline-block;color:#64748b;font-size:13px;text-decoration:none;padding:6px 12px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc">
      📞 ${PHONE_DISPLAY}
    </a>
    <br><br>
    <a href="${INSTAGRAM}"
       style="color:#e1306c;font-size:13px;text-decoration:none">
      📸 עקוב ב-Instagram לתכנים מהאולפן
    </a>
  </div>

  <!-- Footer -->
  <div style="background:#0f172a;border-radius:0 0 16px 16px;padding:20px 28px;text-align:center">
    <p style="color:#94a3b8;font-size:12px;margin:0 0 4px">אולפני יקיר כהן | מודיעין | הפקה מוזיקלית ברמה בינלאומית</p>
    <p style="color:#475569;font-size:11px;margin:0">קיבלת מייל זה כי פנית אלינו דרך האתר</p>
  </div>

</div>
</body>
</html>`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: CORS });
  }

  const { name, phone, email, service, page, ts } = body;
  if (!name || !phone) {
    return new Response(JSON.stringify({ ok: false, error: 'missing fields' }), { status: 400, headers: CORS });
  }

  const timestamp = ts || new Date().toISOString();
  const key = 'lead:' + Date.now();
  const lead = { name, phone, email: email || '', service: service || 'כללי', page: page || '', ts: timestamp };

  // 1. שמור ב-KV (180 יום)
  await env.YKP_LEADS.put(key, JSON.stringify(lead), { expirationTtl: 60 * 60 * 24 * 180 });

  const svc = getServiceData(service);
  const timeStr = formatTime(timestamp);

  // 2. WhatsApp לקיר דרך CallMeBot
  const waPhone = await env.YKP_WIDGET_CONFIG.get('CALLMEBOT_PHONE');
  const waApiKey = await env.YKP_WIDGET_CONFIG.get('CALLMEBOT_APIKEY');
  if (waPhone && waApiKey) {
    const lines = [
      '🔔 *ליד חדש מגל!*', '',
      '👤 שם: ' + name,
      '📞 טלפון: ' + phone,
      email ? '📧 מייל: ' + email : '',
      svc.emoji + ' שירות: ' + (service || 'כללי'),
      svc.related ? '💡 פוטנציאל: ' + svc.related : '',
      page ? '📄 עמוד: ' + page : '',
      '⏰ ' + timeStr
    ].filter(Boolean).join('\n');
    try { await sendWhatsApp(waPhone, waApiKey, lines); } catch (_) {}
  }

  const resendKey = await env.YKP_WIDGET_CONFIG.get('RESEND_API_KEY');

  // 3. מייל ליקיר
  const notifyEmail = await env.YKP_WIDGET_CONFIG.get('NOTIFY_EMAIL');
  if (resendKey && notifyEmail) {
    const html = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:12px;">' +
      '<h2 style="color:#e63946;margin-top:0;">🔔 ליד חדש מגל!</h2>' +
      '<table style="width:100%;border-collapse:collapse;">' +
      '<tr><td style="padding:8px 0;color:#555;width:130px;">👤 שם</td><td style="font-weight:bold;">' + name + '</td></tr>' +
      '<tr><td style="padding:8px 0;color:#555;">📞 טלפון</td><td><a href="tel:' + phone + '" style="color:#e63946;">' + phone + '</a></td></tr>' +
      (email ? '<tr><td style="padding:8px 0;color:#555;">📧 מייל</td><td><a href="mailto:' + email + '" style="color:#e63946;">' + email + '</a></td></tr>' : '') +
      '<tr><td style="padding:8px 0;color:#555;">' + svc.emoji + ' שירות</td><td>' + (service || 'כללי') + '</td></tr>' +
      (svc.related ? '<tr><td style="padding:8px 0;color:#555;">💡 פוטנציאל</td><td style="color:#128C7E;">' + svc.related + '</td></tr>' : '') +
      (page ? '<tr><td style="padding:8px 0;color:#555;">📄 עמוד</td><td>' + page + '</td></tr>' : '') +
      '<tr><td style="padding:8px 0;color:#555;">⏰ זמן</td><td>' + timeStr + '</td></tr>' +
      '</table>' +
      '<a href="tel:' + phone + '" style="display:inline-block;margin-top:16px;background:#e63946;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">📞 התקשר עכשיו</a>' +
      (email ? ' <a href="mailto:' + email + '" style="display:inline-block;margin-top:16px;margin-right:8px;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">📧 שלח מייל</a>' : '') +
      '</div>';
    try { await sendEmail(resendKey, notifyEmail, '🔔 ליד חדש: ' + name + ' — ' + (service || 'כללי'), html); } catch (_) {}
  }

  // 4. מייל ללקוח עם upsells
  if (resendKey && email) {
    const customerHtml = buildCustomerEmail(name, service, svc);
    const subject = 'קיבלנו את הפנייה שלך ' + name + '! 🎵 אולפני יקיר כהן';
    try {
      await sendEmail(resendKey, email, subject, customerHtml, notifyEmail || undefined);
    } catch (_) {}
  }

  return new Response(JSON.stringify({ ok: true }), { headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
