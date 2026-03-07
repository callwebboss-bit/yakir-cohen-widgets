/*!
 * גל — עוזר אישי | אולפני יקיר כהן
 * v5.0 — Admin-Controlled Features Edition
 * Auto-open · Exit Intent · Pricing · Social Proof · Reviews · WA Context
 */
(function () {
  'use strict';

  /* ── ברירות מחדל ── */
  const DEF = {
    name: 'גל',
    subtitle: 'אולפני יקיר כהן',
    phone: '0587555456',
    phoneIntl: '972587555456',
    waMessage: 'היי יקיר, הגעתי דרך גל ואשמח לדבר',
    mapQuery: 'יקיר+כהן+אולפן+הקלטות',
    logoUrl: 'https://lh3.googleusercontent.com/sitesv/APaQ0ST_dXtnLvuBIktrxaInk_ISfIzGvQ47AGt6Qn68LwF3TGlznAdiSqGojC09FM8xTY-yGBtWy7C6Ck_srXIiSycY2g7lDO_4H410AmDAySOgeJFyNUigjDcdpFYKIlqDHLGoATgc2JhrpIQwSY1sLXfWLh1nrW-96A81n91SKQDw-cch1E7TNUqssE4=w16383',
    instagramUrl: 'https://www.instagram.com/yakir.cohen.official/',
    giftUrl: 'https://www.instagram.com/yakir.cohen.official/',
    youtubeRec: 'https://www.youtube.com/watch?v=fWah7wrv3Ls',
    youtubeVid: 'https://www.youtube.com/watch?v=AeocfbXnZRY',
    youtubePod: 'https://www.youtube.com/watch?v=8rgg7DaUNFU',
    youtubeEv:  'https://www.youtube.com/watch?v=XUr2e5S4JSA',
    youtubeAc:  'https://www.youtube.com/watch?v=Dx9OZIAYyY8',
    appsScriptUrl: '',
    ga4Id: '', pixelId: '',
    apiBase: 'https://yakir-cohen-widgets.pages.dev',
    aiEnabled: false,
    pageGreetings: {},
    /* ── Feature flags (overridden by admin via GAL_CONFIG) ── */
    services: { recording: true, video: true, podcast: true, events: true, academy: true },
    autoOpen:    { enabled: false, delay: 30 },
    exitIntent:  { enabled: false, message: 'רגע לפני שאתה עוזב... 🎯 יש לנו הצעה מיוחדת עבורך!' },
    pricing:     { enabled: false, recording: '', video: '', podcast: '', events: '', academy: '' },
    socialProof: { enabled: false, text: '3 לקוחות הזמינו השבוע 🔥' },
    reviews:     { enabled: false, items: [] },
    whatsappContext: true
  };

  const C = Object.assign({}, DEF, window.GAL_CONFIG || {});

  /* deep-merge nested objects from config */
  ['services','autoOpen','exitIntent','pricing','socialProof','reviews'].forEach(k => {
    if (window.GAL_CONFIG && window.GAL_CONFIG[k]) {
      C[k] = Object.assign({}, DEF[k], window.GAL_CONFIG[k]);
    }
  });

  /* ── WhatsApp context tracking ── */
  let _lastService = '';
  function waURL() {
    let msg = C.waMessage;
    if (C.whatsappContext && _lastService) {
      msg = `${C.waMessage} — מעניין אותי ${_lastService}`;
    }
    return `https://wa.me/${C.phoneIntl}?text=${encodeURIComponent(msg)}`;
  }

  const mapURL = () => `https://www.google.com/maps/search/?api=1&query=${C.mapQuery}`;

  function track(name, params) {
    try { if (C.ga4Id && typeof gtag === 'function') gtag('event', name, Object.assign({ event_category: 'gal_widget' }, params)); } catch (_) {}
    try {
      if (C.pixelId && typeof fbq === 'function') {
        if (['whatsapp_clicked','phone_clicked','lead_submitted'].includes(name)) fbq('track','Lead');
        else if (name === 'service_viewed') fbq('track','ViewContent',{ content_name: params?.service });
      }
    } catch (_) {}
  }

  /* ── Schema.org ── */
  function injectSchema() {
    if (document.getElementById('gal-schema')) return;
    const s = document.createElement('script');
    s.id = 'gal-schema'; s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "MusicRecordingStudio",
      "name": "אולפני יקיר כהן", "alternateName": "Yakir Cohen Studios",
      "url": window.location.origin, "telephone": C.phone,
      "sameAs": [C.instagramUrl],
      "address": { "@type": "PostalAddress", "addressLocality": "מודיעין", "addressCountry": "IL" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5", "reviewCount": "280" },
      "priceRange": "₪₪"
    });
    document.head.appendChild(s);
  }

  /* ── HTML ── */
  const logoHtml = C.logoUrl
    ? `<img id="gal-logo" src="${C.logoUrl}" alt="אולפני יקיר כהן" onerror="this.style.display='none';document.getElementById('gal-logo-fb').style.display='flex'">`
    : '';

  document.body.insertAdjacentHTML('beforeend', `
    <div id="gal-widget" role="complementary" aria-label="עוזר אישי">
      <button id="gal-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="gal-chat" aria-label="פתח עוזר אישי">
        <span aria-hidden="true" id="gal-btn-icon">💬</span>
        <span>שאל את ${C.name}</span>
      </button>
      <div id="gal-chat" role="dialog" aria-modal="true" aria-labelledby="gal-dialog-title" hidden>
        <div id="gal-header">
          ${logoHtml}
          <div id="gal-logo-fb" style="display:${C.logoUrl ? 'none' : 'flex'}">😙</div>
          <div id="gal-header-text">
            <strong id="gal-dialog-title">אולפני יקיר כהן</strong>
            <span id="gal-header-sub"><span class="gal-online-dot"></span>זמינים עכשיו</span>
          </div>
          <button id="gal-close" aria-label="סגור">×</button>
        </div>
        <div id="gal-msgs" role="log" aria-live="polite" aria-atomic="false" aria-label="שיחה עם ${C.name}"></div>
        ${C.aiEnabled ? `
        <div id="gal-input-bar">
          <input id="gal-input" type="text" placeholder="שאל שאלה חופשית..." aria-label="שאלה חופשית" autocomplete="off" dir="rtl">
          <button id="gal-send" aria-label="שלח שאלה">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>` : ''}
        <div id="gal-footer">
          <span id="gal-footer-brand">אולפני יקיר כהן ✦ מודיעין</span>
          <button id="gal-new-chat" aria-label="התחל שיחה חדשה">🔄 שיחה חדשה</button>
        </div>
      </div>
    </div>`);

  /* ── References ── */
  const btn     = document.getElementById('gal-btn');
  const chat    = document.getElementById('gal-chat');
  const msgs    = document.getElementById('gal-msgs');
  const closeB  = document.getElementById('gal-close');
  const newChatBtn = document.getElementById('gal-new-chat');
  const inputEl = document.getElementById('gal-input');
  const sendBtn = document.getElementById('gal-send');

  /* ── Focus trap ── */
  let _trap = null;
  function trapFocus(el) {
    releaseFocus();
    const sel = 'a,button,input,details,[tabindex]:not([tabindex="-1"])';
    const get = () => [...el.querySelectorAll(sel)].filter(x => !x.disabled && !x.closest('[hidden]'));
    _trap = e => {
      if (e.key !== 'Tab') return;
      const els = get(); if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    el.addEventListener('keydown', _trap);
  }
  function releaseFocus() { if (_trap) { chat.removeEventListener('keydown', _trap); _trap = null; } }

  /* ── Open / Close ── */
  function galOpen() {
    chat.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    trapFocus(chat);
    closeB.focus();
    if (!msgs.children.length) galStart();
    track('widget_opened');
  }
  function galClose() {
    chat.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    releaseFocus();
    btn.focus();
  }
  btn.addEventListener('click', () => chat.hidden ? galOpen() : galClose());
  closeB.addEventListener('click', galClose);
  newChatBtn.addEventListener('click', galReset);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !chat.hidden) galClose(); });

  /* ── Add message ── */
  function galAdd(html, noFocus) {
    const d = document.createElement('div');
    d.className = 'gal-msg';
    d.innerHTML = html;
    if (!noFocus) d.setAttribute('tabindex', '-1');
    msgs.appendChild(d);
    requestAnimationFrame(() => {
      msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });
      if (!noFocus) setTimeout(() => d.focus(), 80);
    });
  }

  /* ── Typing indicator ── */
  function galTyping(ms = 600) {
    return new Promise(res => {
      const d = document.createElement('div');
      d.className = 'gal-typing';
      d.setAttribute('aria-label', 'גל מכין תשובה...');
      d.innerHTML = `<div class="gal-typing-dots"><span></span><span></span><span></span></div><span class="gal-typing-label">גל מכין תשובה...</span>`;
      msgs.appendChild(d);
      msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });
      setTimeout(() => { d.remove(); res(); }, ms);
    });
  }

  /* ── Context greeting ── */
  function contextGreeting() {
    const path = window.location.pathname;
    for (const [key, msg] of Object.entries(C.pageGreetings || {})) {
      if (path.includes(key)) return msg;
    }
    return `שלום! אני ${C.name} 👋<br>
<small style="color:#64748b">העוזר הדיגיטלי של אולפני יקיר כהן</small><br><br>
אנחנו כאן כדי לתת לך <strong>שירות מקצועי ברמה בינלאומית</strong>.<br>
במה נוכל לעזור לך היום?`;
  }

  /* ── Gift block ── */
  function giftBlock(service) {
    return `<div class="gal-gift">
<div class="gal-gift-title">🎁 מתנה מקצועית ששווה 120 ₪</div>
<strong>צ׳ק ליסט של 7 נקודות שמבטיחות ${service === 'הקלטה' ? 'הקלטה' : 'הפקה'} מושלמת</strong><br>
הכן את עצמך מראש ותקבל תוצאות מקסימליות מהסשן שלך 🎯<br><br>
<a href="${C.giftUrl}" target="_blank" rel="noopener noreferrer" style="color:#92400e;font-weight:800;text-decoration:underline">✅ לחץ כאן לצפייה והורדה ←</a>
</div>`;
  }

  /* ── Payments bar ── */
  const paymentsBar = `
<div class="gal-payments">
  <span class="gal-payments-label">אנחנו מקבלים</span>
  <span class="gal-pay-badge gpb-visa">VISA</span>
  <span class="gal-pay-badge gpb-mc">MC</span>
  <span class="gal-pay-badge gpb-paypal">PayPal</span>
  <span class="gal-pay-badge gpb-bit">bit</span>
  <span class="gal-pay-badge gpb-apple">⌘ Pay</span>
  <span class="gal-pay-badge gpb-transfer">העברה</span>
</div>`;

  /* ── Save lead ── */
  async function saveLead(data) {
    if (C.apiBase) {
      try { await fetch(`${C.apiBase}/api/lead`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch (_) {}
    }
    if (C.appsScriptUrl) {
      try { await fetch(C.appsScriptUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch (_) {}
    }
  }

  /* ── AI chat ── */
  async function sendAI(question) {
    if (!C.apiBase) return;
    await galTyping(900);
    try {
      const r = await fetch(`${C.apiBase}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question }) });
      const data = await r.json();
      galAdd(data.reply || 'מצטערים, נסה שוב 🙏');
    } catch { galAdd('אוי, משהו השתבש. פנה אלינו ישירות 💬'); }
  }

  /* ── Lead form ── */
  async function galLeadForm(service) {
    await galTyping(500);
    const id = 'lf' + Date.now();
    galAdd(`
<strong>אנחנו ניצור איתך קשר תוך שעות 📲</strong><br>
<small style="color:#64748b">השאר פרטים וצוות האולפן יחזור אליך בקרוב</small>
<div id="${id}" style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
  <input id="${id}-n" type="text" placeholder="שם מלא" dir="rtl" style="padding:10px 13px;border:1.5px solid #dde4e8;border-radius:9px;font-size:13.5px;font-family:inherit;background:#fafafa;outline:none">
  <input id="${id}-p" type="tel" placeholder="מספר טלפון" dir="ltr" style="padding:10px 13px;border:1.5px solid #dde4e8;border-radius:9px;font-size:13.5px;font-family:inherit;background:#fafafa;outline:none">
  <button onclick="window._galSubmitLead('${id}','${service}')" style="padding:11px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 3px 10px rgba(18,140,126,.28)">
    📤 שלח פרטים ואנחנו ניצור קשר
  </button>
  <button class="gal-action gal-action--ghost" onclick="window._galReset()">ביטול</button>
</div>`);
  }

  window._galSubmitLead = async function (id, service) {
    const name  = document.getElementById(`${id}-n`)?.value?.trim();
    const phone = document.getElementById(`${id}-p`)?.value?.trim();
    if (!name || !phone) { alert('נא למלא שם וטלפון 🙏'); return; }
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div style="text-align:center;color:#64748b;padding:8px">שולח... ⏳</div>';
    const leadData = { name, phone, service: service || 'כללי', page: window.location.href, ts: new Date().toISOString(), source: 'גל' };
    await saveLead(leadData);
    track('lead_submitted', { service });
    await galTyping(400);
    galAdd(`✅ <strong>תודה ${name}!</strong><br>צוות האולפן יחזור אליך בקרוב — לרוב תוך שעות ספורות 🙏<br><br><small style="color:#64748b">רוצה תשובה מידית?</small>`);
    galAdd(`<div class="gal-btns"><a href="${waURL()}" target="_blank" rel="noopener noreferrer" class="gal-action gal-action--whatsapp" onclick="track('whatsapp_clicked')">💬 וואטסאפ עכשיו עם יקיר</a></div>`);
  };

  /* ══════════ מסכים ══════════ */
  function galReset() { msgs.innerHTML = ''; galStart(); }

  async function galStart() {
    await galTyping(350);
    galAdd(contextGreeting(), true);

    /* Social Proof */
    if (C.socialProof && C.socialProof.enabled && C.socialProof.text) {
      galAdd(`<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:8px 12px;font-size:13px;color:#c2410c;font-weight:600;display:inline-block">
        📊 ${C.socialProof.text}
      </div>`, true);
    }

    /* Reviews */
    if (C.reviews && C.reviews.enabled && C.reviews.items && C.reviews.items.length) {
      const rvHtml = C.reviews.items.map(r => `
        <div style="background:#f8fafc;border-radius:8px;padding:8px 10px;margin-bottom:6px;font-size:12.5px">
          <div style="color:#f59e0b;margin-bottom:2px">⭐⭐⭐⭐⭐</div>
          <div style="color:#374151">"${r.text}"</div>
          <div style="color:#94a3b8;font-size:11px;margin-top:2px">— ${r.author}</div>
        </div>`).join('');
      galAdd(`<div style="margin-top:2px">${rvHtml}</div>`, true);
    }

    /* Main menu */
    const svc = C.services || {};
    galAdd(`<nav class="gal-btns" aria-label="תפריט ראשי">
      ${svc.recording !== false ? `<button class="gal-action" onclick="window._galServices()">🎤 השירותים שלנו</button>` : ''}
      <button class="gal-action" onclick="window._galLocation()">📍 הגעה לאולפן</button>
      <button class="gal-action" onclick="window._galFAQ()">❓ שאלות נפוצות</button>
      <button class="gal-action gal-action--whatsapp" onclick="window._galContact()">💬 דבר ישירות עם יקיר</button>
    </nav>`);
  }

  async function galServices() {
    await galTyping(350);
    galAdd(`<strong>השירותים שלנו 🎵</strong><br><small style="color:#64748b">בחר את השירות שמעניין אותך</small>`);
    const svc = C.services || {};
    const pr  = C.pricing  || {};
    function priceTag(key) {
      return (pr.enabled && pr[key]) ? ` <small style="color:#64748b;font-weight:400">החל מ-${pr[key]}₪</small>` : '';
    }
    galAdd(`<nav class="gal-btns">
      ${svc.recording !== false ? `<button class="gal-action" onclick="window._galRec()">🎙️ הקלטת שיר / ברכה / ג׳ינגל${priceTag('recording')}</button>` : ''}
      ${svc.video     !== false ? `<button class="gal-action" onclick="window._galVid()">🎬 שיר וקליפ משפחתי${priceTag('video')}</button>` : ''}
      ${svc.podcast   !== false ? `<button class="gal-action" onclick="window._galPod()">🎙️ סטודיו פודקאסט${priceTag('podcast')}</button>` : ''}
      ${svc.events    !== false ? `<button class="gal-action" onclick="window._galEv()">✨ אטרקציות ואירועים${priceTag('events')}</button>` : ''}
      ${svc.academy   !== false ? `<button class="gal-action" onclick="window._galAc()">🎓 האקדמיה של יקיר כהן${priceTag('academy')}</button>` : ''}
      <button class="gal-action gal-action--ghost" onclick="window._galReset()">← חזרה</button>
    </nav>`);
  }

  function serviceScreen(title, infoLines, svcKey, ytUrl) {
    return async function () {
      _lastService = svcKey; /* track for WhatsApp context */
      await galTyping(550);
      track('service_viewed', { service: svcKey });
      galAdd(`<strong>תודה שבחרת ב${svcKey}! 🙏</strong><br>כדי להתחיל בצורה הטובה ביותר, הנה מתנה מקצועית ששווה 120 ₪: ${giftBlock(svcKey)}`);
      await galTyping(600);
      galAdd(`<strong>פרטי השירות:</strong>
<div class="gal-info">${infoLines}</div>
<small style="color:#64748b">האם תרצה שנשלח לך גם דוגמה של ${svcKey === 'פודקאסט' ? 'הסטודיו' : 'מיקס'} שביצענו לאחרונה?</small>`);
      galAdd(`<div class="gal-btns">
        <button class="gal-action gal-action--primary" onclick="window._galLeadForm('${svcKey}')">📲 כן! שלחו לי פרטים + דוגמה</button>
        <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="gal-action">📺 צפה בדוגמאות ביוטיוב</a>
        <a href="${C.instagramUrl}" target="_blank" rel="noopener noreferrer" class="gal-action">📸 עקוב ב-Instagram</a>
        <button class="gal-action gal-action--ghost" onclick="window._galServices()">← חזרה</button>
      </div>`);
    };
  }

  const galRec = serviceScreen('הקלטות מקצועיות 🎙️',
    '📍 אולפן מקצועי במודיעין<br>⏱️ סשן הקלטה: כשעה<br>📦 אספקה: 24–48 שעות<br>✅ מיקס · מאסטרינג · תיקון זיופים עם Melodyne<br>🎁 ליווי מקצועי צמוד לאורך כל התהליך',
    'הקלטה', C.youtubeRec);

  const galVid = serviceScreen('שיר וקליפ משפחתי 🎬',
    '🎥 צילום 4K מקצועי<br>🎤 הקלטה באולפן כולל מיקס<br>✂️ עריכה קצבית מרגשת<br>👨‍👩‍👧‍👦 חוויה משפחתית בלתי נשכחת',
    'קליפ', C.youtubeVid);

  const galPod = serviceScreen('סטודיו פודקאסט 🎙️',
    '🎬 צילום רב-מצלמתי מקצועי<br>🎧 סאונד ברמה בינלאומית<br>💻 עריכה והכנה להפצה<br>📱 גזירת Reels לקידום ברשתות',
    'פודקאסט', C.youtubePod);

  const galEv = serviceScreen('אטרקציות ואירועים ✨',
    '🎧 DJ מקצועיים ומנוסים<br>🎤 אטרקציות ייחודיות לאירוע שלך<br>🎉 הפקת אירועים מלאה<br>⭐ מפורסמים ומובילי דעה',
    'אירועים', C.youtubeEv);

  const galAc = serviceScreen('האקדמיה של יקיר כהן 🎓',
    '🎧 קורס DJ מעשי<br>🎚️ הנדסת סאונד<br>🤖 AI למוזיקה — הטכנולוגיה החדשה<br>🗣️ טיפול בגמגום דרך מוזיקה',
    'אקדמיה', C.youtubeAc);

  async function galLocation() {
    await galTyping(400);
    galAdd(`<strong>הגעה לאולפן 📍</strong>
<div class="gal-info"><strong>האולפן הראשי:</strong><br>מודיעין — מתחם מקצועי ומעוצב<br>עם כל הציוד המתקדם בעולם</div>
<div class="gal-info"><strong>גם אצלכם! 🚐</strong><br>האולפן הנייד שלנו מגיע לכל מקום בארץ<br><em>פתרון VIP מושלם לאירועים וצילומים</em></div>`);
    galAdd(`<div class="gal-btns">
      <a href="${mapURL()}" target="_blank" rel="noopener noreferrer" class="gal-action gal-action--primary">📍 נווט לאולפן</a>
      <button class="gal-action" onclick="window._galContact()">📲 תאם הגעה</button>
      <button class="gal-action gal-action--ghost" onclick="window._galReset()">← חזרה</button>
    </div>`);
  }

  async function galFAQ() {
    await galTyping(400);
    galAdd(`<strong>שאלות שהלקוחות שלנו שואלים ❓</strong>
<details class="gal-faq-item"><summary>⏱️ כמה זמן לוקחת הקלטה?</summary><div class="gal-faq-body">סשן הקלטה אצלנו אורך כשעה. ואנחנו מספקים את הקובץ המוכן תוך 24–48 שעות בלבד.</div></details>
<details class="gal-faq-item"><summary>🎵 צריך להביא פלייבק מוכן?</summary><div class="gal-faq-body">ממש לא חובה — הצוות שלנו יכול לספק פלייבק איכותי שמתאים בדיוק לך.</div></details>
<details class="gal-faq-item"><summary>💰 מה כלול במחיר?</summary><div class="gal-faq-body">הכל: ליווי מקצועי צמוד, מיקס, מאסטרינג, תיקון זיופים וחומרי גלם. אין הפתעות.</div></details>
<details class="gal-faq-item"><summary>🎤 מה זה תיקון זיופים?</summary><div class="gal-faq-body">אנחנו עובדים עם Melodyne — הטכנולוגיה המתקדמת בעולם לתיקון צלילים בצורה טבעית ומקצועית לחלוטין.</div></details>
<details class="gal-faq-item"><summary>💳 אילו אמצעי תשלום מתקבלים?</summary><div class="gal-faq-body">Visa, Mastercard, PayPal, bit, Apple Pay, העברה בנקאית — אנחנו עושים לך את זה קל.</div></details>`);
    galAdd(`<div class="gal-btns">
      <button class="gal-action gal-action--primary" onclick="window._galContact()">💬 יש לי שאלה נוספת</button>
      <button class="gal-action gal-action--ghost" onclick="window._galReset()">← חזרה</button>
    </div>`);
  }

  async function galContact() {
    track('contact_viewed');
    await galTyping(350);
    galAdd(`<strong>בואו נדבר — אנחנו כאן בשבילך! 💬</strong><br>יקיר והצוות מחכים לשמוע ממך`);
    galAdd(`<div class="gal-btns">
      <a href="${waURL()}" target="_blank" rel="noopener noreferrer" class="gal-action gal-action--whatsapp" onclick="track('whatsapp_clicked')">💬 וואטסאפ — תשובה תוך דקות</a>
      <a href="tel:${C.phone}" class="gal-action gal-action--primary" onclick="track('phone_clicked')">📞 שיחה עם יקיר ישירות</a>
      <a href="${C.instagramUrl}" target="_blank" rel="noopener noreferrer" class="gal-action">📸 Instagram — ראה עבודות</a>
      <a href="${mapURL()}" target="_blank" rel="noopener noreferrer" class="gal-action">⭐ 280+ המלצות בגוגל — ראה בעצמך</a>
      <button class="gal-action gal-action--ghost" onclick="window._galReset()">← חזרה</button>
    </div>
    ${paymentsBar}`);
  }

  /* ── Global exposure ── */
  window._galReset    = galReset;
  window._galServices = galServices;
  window._galRec      = galRec;
  window._galVid      = galVid;
  window._galPod      = galPod;
  window._galEv       = galEv;
  window._galAc       = galAc;
  window._galLocation = galLocation;
  window._galFAQ      = galFAQ;
  window._galContact  = galContact;
  window._galLeadForm = galLeadForm;
  window._galOpen     = galOpen;
  window._galClose    = galClose;

  /* ── AI input ── */
  if (C.aiEnabled && inputEl && sendBtn) {
    const doSend = () => {
      const q = inputEl.value.trim(); if (!q) return;
      galAdd(`<span style="color:var(--g-green);font-weight:700">אתה:</span> ${q}`, true);
      inputEl.value = ''; sendAI(q); track('ai_question_asked');
    };
    sendBtn.addEventListener('click', doSend);
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
  }

  /* ══════════════════════════════════════════
     פיצ׳רים מתקדמים — נשלטים מהאדמין
  ══════════════════════════════════════════ */

  /* ── Auto-open ── */
  if (C.autoOpen && C.autoOpen.enabled) {
    const alreadyOpened = sessionStorage.getItem('gal-auto-opened');
    if (!alreadyOpened) {
      const delay = Math.max(5, parseInt(C.autoOpen.delay) || 30) * 1000;
      setTimeout(() => {
        if (chat.hidden) {
          galOpen();
          sessionStorage.setItem('gal-auto-opened', '1');
          track('auto_opened');
        }
      }, delay);
    }
  }

  /* ── Exit Intent (desktop) ── */
  if (C.exitIntent && C.exitIntent.enabled) {
    let exitTriggered = false;
    document.addEventListener('mouseleave', e => {
      if (e.clientY <= 0 && !exitTriggered && chat.hidden) {
        exitTriggered = true;
        galOpen();
        track('exit_intent_triggered');
        /* עדכן הודעת פתיחה עם הטקסט המיוחד */
        if (C.exitIntent.message && msgs.children.length === 0) {
          setTimeout(() => {
            const existingMsgs = msgs.querySelectorAll('.gal-msg');
            if (existingMsgs.length > 0 && C.exitIntent.message) {
              const firstMsg = existingMsgs[0];
              if (firstMsg) {
                const extra = document.createElement('div');
                extra.className = 'gal-msg';
                extra.innerHTML = `<strong style="color:#e63946">${C.exitIntent.message}</strong>`;
                msgs.insertBefore(extra, firstMsg.nextSibling);
              }
            }
          }, 500);
        }
      }
    });
  }

  /* ── Lazy init ── */
  function init() { injectSchema(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      'requestIdleCallback' in window ? requestIdleCallback(init, { timeout: 2000 }) : setTimeout(init, 100);
    });
  } else {
    'requestIdleCallback' in window ? requestIdleCallback(init, { timeout: 2000 }) : setTimeout(init, 100);
  }

})();
