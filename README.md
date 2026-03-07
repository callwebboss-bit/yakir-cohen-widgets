# 🎙️ יקיר כהן — Widgets CDN
**גל + נגישות + לוח ניהול** | Cloudflare Pages + Functions + KV

---

## 📁 מבנה קבצים

```
yakir-cohen-widgets/
├── functions/api/
│   ├── chat.js          ← Claude AI proxy
│   ├── config.js        ← קרא/כתוב config ל-KV
│   ├── lead.js          ← שמור ליד ב-KV
│   └── leads-list.js    ← רשימת לידים לדאשבורד
├── public/
│   ├── gal.js / gal.css
│   ├── accessibility.js / accessibility.css
│   ├── _headers         ← cache + security
│   └── admin/index.html ← לוח ניהול (URL פרטי)
└── wrangler.toml        ← KV bindings
```

---

## 🚀 פריסה — שלב אחרי שלב

### 1. העלה ל-GitHub
1. github.com ► **New Repository** ► שם: `yakir-cohen-widgets`
2. העלה את **כל** הקבצים (כולל `functions/` ו-`wrangler.toml`)

### 2. חבר ל-Cloudflare Pages
1. [dash.cloudflare.com](https://dash.cloudflare.com) ► **Workers & Pages** ► **Create** ► **Pages** ► **Connect to Git**
2. בחר ריפו `yakir-cohen-widgets`
3. **Build settings:**
   - Framework: `None`
   - Build command: *(ריק)*
   - Output directory: `public`
4. **לחץ Save and Deploy**

### 3. חבר KV Namespaces (קריטי!)
לאחר יצירת Pages — בדאשבורד Cloudflare:
1. הכנס ל-Workers & Pages ► `yakir-cohen-widgets` ► **Settings** ► **Functions**
2. תחת **KV namespace bindings** הוסף:

   | Variable name        | KV Namespace         |
   |---------------------|----------------------|
   | `YKP_WIDGET_CONFIG` | `YKP_WIDGET_CONFIG`  |
   | `YKP_LEADS`         | `YKP_LEADS`          |

3. לחץ **Save**
4. Redeploy (עשה commit קטן ב-GitHub)

### 4. הגדר Admin Token + Claude API Key

פתח Terminal והרץ:
```bash
# התקן wrangler אם עוד אין
npm install -g wrangler
wrangler login

# הגדר את ה-Admin Token (בחר מחרוזת ארוכה)
npx wrangler kv key put --namespace-id=359eba198bbd4add8dbcca0dc4991832 "ADMIN_TOKEN" "הטוקן-שלך"

# הגדר Claude API Key
npx wrangler kv key put --namespace-id=359eba198bbd4add8dbcca0dc4991832 "CLAUDE_API_KEY" "sk-ant-api03-..."
```

> **אין Terminal?** ניתן להגדיר ישירות ב:
> Cloudflare Dashboard ► KV ► `YKP_WIDGET_CONFIG` ► Add entry

---

## 🌐 כתובות לאחר פריסה

```
https://yakir-cohen-widgets.pages.dev/         ← (404 זה בסדר)
https://yakir-cohen-widgets.pages.dev/gal.js
https://yakir-cohen-widgets.pages.dev/gal.css
https://yakir-cohen-widgets.pages.dev/accessibility.js
https://yakir-cohen-widgets.pages.dev/accessibility.css
https://yakir-cohen-widgets.pages.dev/admin/   ← לוח ניהול
https://yakir-cohen-widgets.pages.dev/api/chat
https://yakir-cohen-widgets.pages.dev/api/lead
https://yakir-cohen-widgets.pages.dev/api/config
```

**סיסמת ניהול ברירת מחדל:** `yakir2024`
← שנה בקובץ `public/admin/index.html` ב-שורה: `const LOCAL_PIN = 'yakir2024';`

---

## 📋 הטמעה באתר

הדבק לפני `</body>`:

```html
<script>
window.GAL_CONFIG = {
  name:       "גל",
  subtitle:   "אולפני יקיר כהן",
  phone:      "0587555456",
  phoneIntl:  "972587555456",
  waMessage:  "היי יקיר, הגעתי דרך גל ואשמח לדבר",
  apiBase:    "https://yakir-cohen-widgets.pages.dev",
  aiEnabled:  true
};
</script>

<link rel="preconnect" href="https://yakir-cohen-widgets.pages.dev">
<link rel="stylesheet" href="https://yakir-cohen-widgets.pages.dev/gal.css"
      media="print" onload="this.media='all'">
<link rel="stylesheet" href="https://yakir-cohen-widgets.pages.dev/accessibility.css"
      media="print" onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="https://yakir-cohen-widgets.pages.dev/gal.css">
  <link rel="stylesheet" href="https://yakir-cohen-widgets.pages.dev/accessibility.css">
</noscript>

<script defer src="https://yakir-cohen-widgets.pages.dev/gal.js"></script>
<script defer src="https://yakir-cohen-widgets.pages.dev/accessibility.js"></script>
```

> 💡 ניתן לקבל את הקוד המותאם מלוח הניהול ► טאב "הטמעה"

---

## ⚡ מה מוגש מהיכן

| קובץ | cache | טוען |
|------|-------|------|
| `gal.js` | שנה אחת (CDN) | `defer` — לא חוסם |
| `gal.css` | שנה אחת (CDN) | `media=print` — לא חוסם |
| `accessibility.*` | שנה אחת (CDN) | `defer` / `media=print` |
| `/api/chat` | ללא cache | Cloudflare Worker |
| `/api/lead` | ללא cache | Cloudflare Worker → KV |
| `/api/config` | ללא cache | KV read/write |

*Built with ❤️ for יקיר כהן הפקות*
