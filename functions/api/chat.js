/**
 * Cloudflare Pages Function — /api/chat
 * פרוקסי ל-Claude API עם rate limit בסיסי
 * KV binding: YKP_WIDGET_CONFIG (לקריאת CLAUDE_API_KEY)
 */

const SYSTEM_PROMPT = `אתה גל — העוזר הדיגיטלי של אולפני יקיר כהן במודיעין.
אתה עונה בעברית בלבד, בסגנון חם, ידידותי ומקצועי.
אתה מכיר את כל שירותי האולפן:
- הקלטות שיר, ברכות, ג'ינגלים (כשעה, אספקה 24-48 שעות, כולל מיקס מאסטרינג תיקון זיופים)
- קליפים משפחתיים (4K, עריכה, צילום ועוד)
- סטודיו פודקאסט (רב-מצלמתי, גזירת Reels)
- אטרקציות ואירועים (DJ, מפורסמים)
- האקדמיה: קורסי DJ, הנדסת סאונד, AI למוזיקה, טיפול בגמגום דרך מוזיקה
הטלפון: 058-7555456 | וואטסאפ זמין
המיקום: מודיעין (גם אולפן נייד לכל הארץ)
280+ ביקורות חיוביות בגוגל.
ענה בקצרה (עד 3 משפטים), ובסוף הצע תמיד לתאם דרך וואטסאפ.`;

const RATE_LIMIT_WINDOW = 3600; // שניות
const RATE_LIMIT_MAX    = 5;    // שאלות לשעה לכל IP

export async function onRequestPost(context) {
  const { request, env } = context;

  /* CORS */
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  /* Rate limit לפי IP */
  const ip      = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey   = `rl:${ip}`;
  const count   = parseInt(await env.YKP_WIDGET_CONFIG.get(rlKey) || '0');
  if (count >= RATE_LIMIT_MAX) {
    return new Response(JSON.stringify({
      reply: 'הגעת למגבלת השאלות לשעה זו. נסה שוב מאוחר יותר, או פנה ישירות ב-058-7555456 😊'
    }), { status: 429, headers });
  }

  /* קריאת הודעה */
  let message;
  try {
    const body = await request.json();
    message = body.message?.slice(0, 400);
  } catch {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers });
  }

  if (!message) {
    return new Response(JSON.stringify({ reply: 'לא הבנתי את השאלה. נסה שוב 🙂' }), { headers });
  }

  /* קריאת Claude API key מ-KV */
  const apiKey = await env.YKP_WIDGET_CONFIG.get('CLAUDE_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({
      reply: 'יקיר, API key לא הוגדר עדיין. פנה ישירות ב-058-7555456 😊'
    }), { headers });
  }

  /* קריאה א-Claude */
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await res.json();
    const reply = data.content?.[0]?.text || 'מצטער, לא הצלחתי לענות. פנה ב-058-7555456';

    /* עדכון rate limit */
    await env.YKP_WIDGET_CONFIG.put(rlKey, String(count + 1), {
      expirationTtl: RATE_LIMIT_WINDOW
    });

    return new Response(JSON.stringify({ reply }), { headers });

  } catch (err) {
    return new Response(JSON.stringify({
      reply: 'אוי, הייתה בעיה טכנית. התקשר אלינו ב-058-7555456 😊'
    }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
