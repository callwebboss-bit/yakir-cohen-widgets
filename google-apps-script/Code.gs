/**
 * ══════════════════════════════════════════════════════════
 *  Google Apps Script — גל לידים | אולפני יקיר כהן
 *  v2.0
 *
 *  מה הסקריפט עושה:
 *  1. מקבל POST מגל (כשמבקר ממלא שם + טלפון)
 *  2. כותב שורה לגיליון Google Sheets
 *  3. שולח הודעת וואטסאפ מסודרת ליקיר (דרך wa.me)
 *     — בפרקטיקה: שולח מייל עם לינק לוואטסאפ, או
 *       מפעיל Webhook ל-Make/Zapier שישלח וואטסאפ
 *
 *  הוראות הגדרה (5 דקות):
 *  1. פתח Google Sheet חדש
 *  2. Extensions → Apps Script
 *  3. מחק הכל, הדבק את הקוד הזה
 *  4. שנה את YAKIR_EMAIL ו-YAKIR_PHONE למטה
 *  5. Deploy → New deployment → Web App
 *     Execute as: Me | Who has access: Anyone
 *  6. העתק את ה-URL שמתקבל → הדבק ב-GAL_CONFIG.appsScriptUrl
 * ══════════════════════════════════════════════════════════
 */

/* ── הגדרות — שנה כאן בלבד ── */
const YAKIR_EMAIL   = 'callwebboss@gmail.com';
const YAKIR_PHONE   = '972587555456';
const SHEET_NAME    = 'לידים מגל';
const SEND_EMAIL    = true;   // true = שלח מייל על כל ליד
const USE_WEBHOOK   = false;  // true = שלח ל-Make/Zapier (מלא WEBHOOK_URL)
const WEBHOOK_URL   = '';     // URL של Make / Zapier webhook

/* ═══════════════════════════════ */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { name, phone, service, page, ts, source } = data;

    /* 1. שמור ב-Sheets */
    saveToSheet({ name, phone, service, page, ts, source });

    /* 2. שלח מייל עם לינק וואטסאפ */
    if (SEND_EMAIL) {
      sendLeadEmail({ name, phone, service, page, ts });
    }

    /* 3. Webhook ל-Make/Zapier */
    if (USE_WEBHOOK && WEBHOOK_URL) {
      sendWebhook({ name, phone, service, page, ts });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error('GAL LEAD ERROR:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* מענה ל-GET (בדיקת זמינות) */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, status: 'גל לידים פעיל' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── שמירה ב-Sheet ── */
function saveToSheet(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_NAME);

  /* צור גיליון אם לא קיים + הוסף כותרות */
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      '🗓️ תאריך', '👤 שם', '📱 טלפון', '🎵 שירות',
      '🌐 עמוד', '📌 מקור', '💬 וואטסאפ מהיר'
    ]);
    /* עיצוב כותרת */
    sheet.getRange(1, 1, 1, 7).setBackground('#128C7E').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 140);
    sheet.setColumnWidth(2, 140);
    sheet.setColumnWidth(3, 130);
    sheet.setColumnWidth(4, 120);
    sheet.setColumnWidth(5, 220);
    sheet.setColumnWidth(6, 90);
    sheet.setColumnWidth(7, 200);
  }

  const dateStr = data.ts
    ? new Date(data.ts).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
    : new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });

  const waLink = `https://wa.me/${data.phone?.replace(/\D/g, '').replace(/^0/, '972')}?text=${encodeURIComponent(`היי ${data.name}, ראיתי שהתעניינת ב${data.service || 'השירותים שלנו'} 😊`)}`;

  sheet.appendRow([
    dateStr,
    data.name    || '',
    data.phone   || '',
    data.service || 'כללי',
    data.page    || '',
    data.source  || 'גל',
    waLink
  ]);

  /* צבע שורה חדשה */
  const lastRow = sheet.getLastRow();
  const rowColor = lastRow % 2 === 0 ? '#f0faf8' : '#ffffff';
  sheet.getRange(lastRow, 1, 1, 7).setBackground(rowColor);
}

/* ── מייל ליקיר ── */
function sendLeadEmail(data) {
  const waLink = `https://wa.me/${data.phone?.replace(/\D/g, '').replace(/^0/, '972')}?text=${encodeURIComponent(`היי ${data.name}, ראיתי שהתעניינת ב${data.service || 'השירותים שלנו'} 😊`)}`;

  const subject = `🔔 ליד חדש מגל: ${data.name} — ${data.service || 'כללי'}`;

  const body = `
<div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#0d2b27,#128C7E);padding:20px;border-radius:10px 10px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">🔔 ליד חדש מגל!</h1>
    <p style="color:rgba(255,255,255,.8);margin:5px 0 0;font-size:13px">אולפני יקיר כהן</p>
  </div>
  <div style="background:#f8fafc;padding:20px;border:1px solid #e0e7ef;border-top:none">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#64748b;width:90px">👤 שם</td><td style="padding:8px 0;font-weight:700">${data.name}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">📱 טלפון</td><td style="padding:8px 0;font-weight:700"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">🎵 שירות</td><td style="padding:8px 0">${data.service || 'כללי'}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">🌐 עמוד</td><td style="padding:8px 0;font-size:12px;color:#94a3b8">${data.page || '—'}</td></tr>
    </table>
    <div style="margin-top:16px;text-align:center">
      <a href="${waLink}" style="display:inline-block;background:linear-gradient(135deg,#25D366,#128C7E);
         color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;
         font-weight:800;font-size:15px;letter-spacing:.02em">
        💬 שלח וואטסאפ ל${data.name} עכשיו
      </a>
    </div>
  </div>
  <div style="padding:12px 20px;background:#fff;border:1px solid #e0e7ef;border-top:none;
              border-radius:0 0 10px 10px;font-size:11px;color:#94a3b8;text-align:center">
    נשלח אוטומטית מגל — אולפני יקיר כהן
  </div>
</div>`;

  GmailApp.sendEmail(YAKIR_EMAIL, subject, '', { htmlBody: body, name: 'גל — אולפני יקיר כהן' });
}

/* ── Webhook למ-Make/Zapier ── */
function sendWebhook(data) {
  try {
    UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        name:    data.name,
        phone:   data.phone,
        service: data.service,
        page:    data.page,
        ts:      data.ts,
        waText:  `היי ${data.name}, ראיתי שהתעניינת ב${data.service || 'השירותים שלנו'} 😊`
      })
    });
  } catch (err) {
    console.error('Webhook error:', err);
  }
}
