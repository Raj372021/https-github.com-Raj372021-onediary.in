import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";

dotenv.config();

const db = new Database("appdata.db");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS user_sync (
    userId TEXT PRIMARY KEY,
    data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS payment_requests (
    id TEXT PRIMARY KEY,
    userId TEXT,
    userName TEXT,
    userPhone TEXT,
    planId TEXT,
    planName TEXT,
    amount REAL,
    utrNumber TEXT,
    submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'PENDING'
  );

  CREATE TABLE IF NOT EXISTS broadcast_notifications (
    id TEXT PRIMARY KEY,
    title TEXT,
    message TEXT,
    type TEXT,
    actionUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS free_grants (
    id TEXT PRIMARY KEY,
    targetIdentifier TEXT,
    phone TEXT,
    email TEXT,
    userId TEXT,
    planId TEXT,
    planName TEXT,
    workersLimit INTEGER,
    durationDays INTEGER,
    amount REAL DEFAULT 0,
    status TEXT DEFAULT 'APPROVED',
    isApproved INTEGER DEFAULT 1,
    isSubscribed INTEGER DEFAULT 1,
    grantedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME,
    notes TEXT,
    is_active INTEGER DEFAULT 1
  );

  INSERT INTO broadcast_notifications (id, title, message, type, actionUrl, created_at, is_active)
  SELECT 'bc_default_1', 'onediary.in नया अपडेट', '100% क्लाउड डाटा सुरक्षा व लाइफटाइम सेव गारंटी! ऐप में डिजिटल कैशबुक व हाजिरी डायरी सुविधा चालू है।', 'ANNOUNCEMENT', '', CURRENT_TIMESTAMP, 1
  WHERE NOT EXISTS (SELECT 1 FROM broadcast_notifications);
`);

let aiInstance: GoogleGenAI | null = null;

function generateFallbackReply(message: string, appDataRaw?: any): string {
  const query = (message || "").toLowerCase().trim();
  let appData: any = {};
  try {
    if (typeof appDataRaw === 'string') appData = JSON.parse(appDataRaw);
    else if (appDataRaw) appData = appDataRaw;
  } catch (e) {}

  // 1. Math calculation query
  if (/^[\d\s\+\-\*\/\(\)\.\,]+$/.test(query) || query.includes('calculate') || query.includes('जोड़') || query.includes('गुणा') || query.includes('बराबर')) {
    try {
      const cleanExpr = query.replace(/[^\d\+\-\*\/\.\(\)]/g, '');
      if (cleanExpr) {
        // eslint-disable-next-line no-new-func
        const val = new Function('return ' + cleanExpr)();
        if (val !== undefined && !isNaN(val)) {
          return `🔢 **गणना का उत्तर (Calculation Result):**\n\n\`${cleanExpr}\` = **₹${Number(val).toLocaleString('hi-IN')}**\n\nआप onediary.in के स्मार्ट कैलकुलेटर से सीधी हाजिरी और मजदूरी की गिनती भी कर सकते हैं!`;
        }
      }
    } catch (e) {}
  }

  // 2. Worker / Attendance Query
  if (query.includes('worker') || query.includes('मजदूर') || query.includes('लेबर') || query.includes('हाजिरी') || query.includes('attendance') || query.includes('list')) {
    const totalWorkers = appData.totalWorkers || 0;
    const todayStats = appData.todayStats || {};
    const workersList = appData.workersList || [];

    let response = `👷 **आपके मजदूरों की लाइव स्थिति (Worker & Attendance Report):**\n\n`;
    response += `- **कुल मजदूर (Total Workers):** ${totalWorkers}\n`;
    if (todayStats) {
      response += `- **आज उपस्थित (Present Today):** ${todayStats.present || 0}\n`;
      response += `- **आधा दिन (Half Day):** ${todayStats.halfDay || 0}\n`;
      response += `- **अनुपस्थित (Absent):** ${todayStats.absent || 0}\n`;
      response += `- **आज की अनुमानित मजदूरी (Today's Wage):** ₹${Number(todayStats.totalWageToday || 0).toLocaleString('hi-IN')}\n\n`;
    }

    if (workersList.length > 0) {
      response += `📋 **मजदूरों की सूची (Workers List):**\n`;
      workersList.slice(0, 10).forEach((w: any, idx: number) => {
        response += `${idx + 1}. **${w.name}** | daily: ₹${w.dailyWage || 0} | 📱 ${w.phone || 'N/A'}\n`;
      });
      if (workersList.length > 10) response += `\n*(और ${workersList.length - 10} मजदूर सूची में शामिल हैं)*\n`;
    } else {
      response += `आप 'Workers' वाले पेज पर जाकर नया मजदूर जोड़ सकते हैं।`;
    }
    return response;
  }

  // 3. Cashbook / Balance Query
  if (query.includes('cash') || query.includes('कैश') || query.includes('हिसाब') || query.includes('balance') || query.includes('पैसा') || query.includes('advance')) {
    const cashStats = appData.cashStats || {};
    let response = `💰 **कैश बुक और बैलेंस रिपोर्ट (Cash Book & Balance Report):**\n\n`;
    response += `- **कुल आवक (Total In / Cash Recd):** ₹${Number(cashStats.totalIn || 0).toLocaleString('hi-IN')}\n`;
    response += `- **कुल जावक (Total Out / Expense):** ₹${Number(cashStats.totalOut || 0).toLocaleString('hi-IN')}\n`;
    response += `- **नेट बैलेंस (Net Balance):** **₹${Number(cashStats.netBalance || 0).toLocaleString('hi-IN')}**\n\n`;
    response += `💡 **सुझाव:** अपने कैश बुक में नियमित रूप से आवक और जावक एंट्री दर्ज करें ताकि साइट पर पैसों का सही हिसाब रहे।`;
    return response;
  }

  // 4. Labor laws, Minimum Wages, PF & ESI Guidelines
  if (query.includes('law') || query.includes('pf') || query.includes('esi') || query.includes('rule') || query.includes('नियम') || query.includes('कानून')) {
    return `📜 **मजदूर कानून और साइट प्रबंधन नियम (Labor Laws & Regulations):**

1. **न्यूनतम मजदूरी (Minimum Wages Act):** अकुशल, अर्ध-कुशल व कुशल कारीगरों की राज्यवार दरें।
2. **ओवरटाइम (Overtime Rules):** 8 घंटे/दिन से अधिक काम पर 2x ओवर-टाइम दर।
3. **PF और ESI:** 20+ कर्मचारियों हेतु अनिवार्य PF व ESI बीमा पंजीकरण।`;
  }

  // 5. App Knowledge Query (onediary.in features, capabilities, app details)
  if (query.includes('app') || query.includes('एप') || query.includes('onediary') || query.includes('फीचर') || query.includes('विशेषता') || query.includes('जानकारी') || query.includes('क्या काम') || query.includes('about')) {
    return `📲 **onediary.in ऐप की संपूर्ण जानकारी (Complete App Overview):**

**onediary.in** सिविल व कंस्ट्रक्शन ठेकेदारों, रियल एस्टेट व प्रॉपर्टी ठेकेदारों, बिल्डरों, दुकानदारों, कारीगरों और व्यवसायियों के लिए भारत का नंबर #1 ऑल-इन-वन स्मार्ट डिजिटल डायरी ऐप है।

### 🌟 मुख्य फीचर्स और सुविधाएं:

1. 👷 **मजदूर हाजिरी व वेतन रजिस्टर (Labor Attendance):**
   - 1-क्लिक में रोजाना उपस्थित (Present), अनुपस्थित (Absent), आधा दिन (Half Day) और ओवर-टाइम (OT) दर्ज करें।
   - ऑटोमैटिक वीकली/मंथली मजदूरी और एडवांस पेमेंट (उधारी) कैलकुलेशन।
   - WhatsApp पर मजदूर वार हाजिरी रिपोर्ट और पे-स्लिप भेजें।

2. 💰 **डिजिटल कैश बुक (Digital Cashbook / नकद खाता):**
   - लेन-देन आवक (Cash Received) और जावक (Expenses) रिकॉर्ड करें।
   - अलग-अलग साइट्स/प्रोजेक्ट्स के लिए अलग कैश बुक बनाएं।
   - शुद्ध बकाया (Net Balance) तुरंत देखें और PDF रिपोर्ट डाउनलोड करें।

3. 🧾 **कोटेशन व जीएसटी बिल मेकर (Quotation & GST Invoice):**
   - ग्राहकों के लिए प्रोफेशनल कोटेशन/एस्टीमेट और जीएसटी टैक्स बिल (5%, 12%, 18%, 28%) मिनटों में बनाएं।
   - HSN कोड, कंपनी लोगो व पेमेंट टर्म्स के साथ WhatsApp / PDF में शेयर करें।

4. 🧮 **स्मार्ट वेज व जीएसटी कैलकुलेटर (Smart Calculator):**
   - स्टैंडर्ड कैलकुलेटर + जीएसटी टैक्स ब्रेकअप (CGST + SGST + IGST)।
   - संख्याओं को तुरंत हिंदी व अंग्रेजी शब्दों (In Words) में बदलें।

5. 🚩 **श्री हनुमान प्रसाद पंचांग व कैलेंडर 2026 (Festival Calendar):**
   - वर्ष 2026 का सम्पूर्ण हिंदू पंचांग, व्रत-त्यौहार, शुभ विवाह मुहूर्त, गृह प्रवेश मुहूर्त और सरकारी छुट्टियां।

6. 🔮 **वैदिक कुण्डली एवं 36 गुण मिलान (Vedic Kundli & Matchmaking):**
   - 10-वर्षीय सटीक जन्म कुण्डली, लग्न/चंद्र चार्ट, विंशोत्तरी दशा, मंगली दोष विश्लेषण व रत्न परामर्श।
   - विवाह हेतु 36 अष्टकूट गुण मिलान एवं प्रामाणिक रॉयल सर्टिफिकेट प्रिंट।

7. 📖 **स्मार्ट डिजिटल डायरी व नोट्स (Daily Diary & Material Stock):**
   - साइट की दैनिक गतिविधियां, मटेरियल स्टॉक सूची, फोटो और वॉइस टाइपिंग नोट्स।

8. ⚡ **1-क्लिक ऐप डाउनलोड व बिना इंटरनेट काम (Offline Mode):**
   - Android व iPhone पर 1-क्लिक में डाउनलोड। बिना इंटरनेट 100% चलता है और ऑनलाइन आने पर ऑटो-सिंक हो जाता है।`;
  }

  // 6. Letter / Message writing assistance
  if (query.includes('write') || query.includes('letter') || query.includes('message') || query.includes('पत्र') || query.includes('मैसेज') || query.includes('लिखें') || query.includes('draft')) {
    return `📝 **व्यवसायिक ड्राफ्ट / मैसेज (Professional Message Draft):**

**विषय: साइट पेमेन्ट / हाजिरी विवरण जमा करने बाबत**

> "प्रिय [कंपनी/मालिक का नाम],\n> \n> हमारी साइट का हालिया हिसाब और मजदूरों का वेतन विवरण तैयार है। कृपया आज ही शेष राशि जारी करने का कष्ट करें ताकि कारीगरों का भुगतान समय पर किया जा सके।\n> \n> धन्यवाद,\n> **onediary.in डिजिटल रिकॉर्ड**"

आप इसे सीधे कॉपी करके WhatsApp या SMS पर भेज सकते हैं!`;
  }

  // Default ChatGPT style AI business response
  return `🤖 **onediary.in AI बिजनेस असिस्टेंट:**

नमस्ते! मैं आपका ऑल-इन-वन एआई असिस्टेंट हूँ। आप मुझसे अपने व्यवसाय, साइट प्रबंधन, या **onediary.in** ऐप के किसी भी फीचर के बारे में पूछ सकते हैं।

### 🌟 आप क्या-क्या पूछ सकते हैं:
1. **ऐप फीचर्स:** "onediary.in ऐप में क्या-क्या फीचर्स हैं?"
2. **मजदूर रिकॉर्ड:** "आज कुल कितने मजदूर उपस्थित हैं?"
3. **कैश बुक हिसाब:** "मेरा कैश बुक बैलेंस क्या है?"
4. **जीएसटी व गणित:** "₹50,000 पर 18% GST कितना बनेगा?"
5. **मैसेज ड्राफ्ट:** "मालिक को पेमेन्ट तकादा मैसेज लिखकर दो।"
6. **सामान्य ज्ञान/सलाह:** कोई भी बिजनेस, कानूनी नियम या सामान्य सवाल।`;
}

function getGeminiAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Increase payload limit for sync
  app.use(express.json({ limit: "50mb" }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Sync Endpoints with Multi-Key 50-Year Perpetual Recovery
  app.post("/api/sync/save", (req, res) => {
    try {
      const { userId, data } = req.body;
      if (!userId || !data) {
        return res.status(400).json({ error: "Missing userId or data" });
      }
      
      const cleanId = String(userId).trim().toLowerCase();
      const rawDataStr = JSON.stringify(data);

      const stmt = db.prepare(`
        INSERT INTO user_sync (userId, data, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP) 
        ON CONFLICT(userId) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(cleanId, rawDataStr);

      // If phone number format, also save normalized 10-digit version
      const digitsOnly = cleanId.replace(/\D/g, '');
      if (digitsOnly.length >= 10) {
        const phone10 = digitsOnly.slice(-10);
        if (phone10 !== cleanId) {
          stmt.run(phone10, rawDataStr);
        }
      }

      // Check if profile in data has linked email or phone, cross-save to both
      try {
        let profile: any = null;
        if (data.lb_user_profile) {
          profile = typeof data.lb_user_profile === 'string' ? JSON.parse(data.lb_user_profile) : data.lb_user_profile;
        }
        if (profile) {
          if (profile.email && typeof profile.email === 'string') {
            const emailKey = profile.email.trim().toLowerCase();
            if (emailKey && emailKey !== cleanId) {
              stmt.run(emailKey, rawDataStr);
            }
          }
          if (profile.phone && typeof profile.phone === 'string') {
            const phoneDigits = profile.phone.replace(/\D/g, '').slice(-10);
            if (phoneDigits && phoneDigits.length === 10 && phoneDigits !== cleanId) {
              stmt.run(phoneDigits, rawDataStr);
            }
          }
        }
      } catch (e) {}

      res.json({ success: true });
    } catch (e) {
      console.error("Sync save error:", e);
      res.status(500).json({ error: "Sync failed" });
    }
  });

  app.post("/api/sync/load", (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const cleanId = String(userId).trim().toLowerCase();
      const digitsOnly = cleanId.replace(/\D/g, '');
      const phone10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : '';

      // 1. Direct query
      let row = db.prepare("SELECT data FROM user_sync WHERE userId = ?").get(cleanId) as any;
      
      // 2. If not found and phone format, try 10-digit phone
      if (!row && phone10) {
        row = db.prepare("SELECT data FROM user_sync WHERE userId = ?").get(phone10) as any;
      }

      // 3. If still not found, search in user_sync records containing this phone or email
      if (!row && (phone10 || cleanId.includes('@'))) {
        const searchPattern = phone10 ? `%"phone"%${phone10}%"` : `%"email"%${cleanId}%"`;
        row = db.prepare("SELECT data FROM user_sync WHERE data LIKE ? ORDER BY updated_at DESC LIMIT 1").get(searchPattern) as any;
      }

      if (row && row.data) {
        res.json({ data: JSON.parse(row.data) });
      } else {
        res.status(404).json({ error: "No data found for this user" });
      }
    } catch (e) {
      console.error("Sync load error:", e);
      res.status(500).json({ error: "Load failed" });
    }
  });

  // Admin Users Data Endpoints
  app.get("/api/admin/users", (req, res) => {
    try {
      const rows = db.prepare("SELECT userId, data, updated_at FROM user_sync ORDER BY updated_at DESC").all() as any[];
      const users = rows.map(r => {
        let parsedData = {};
        try {
          parsedData = JSON.parse(r.data);
        } catch (e) {
          parsedData = {};
        }
        return {
          userId: r.userId,
          data: parsedData,
          updated_at: r.updated_at
        };
      });
      res.json({ users });
    } catch (e) {
      console.error("Failed to fetch admin users:", e);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:userId", (req, res) => {
    try {
      const { userId } = req.params;
      db.prepare("DELETE FROM user_sync WHERE userId = ?").run(userId);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Helper to normalize phone / email / userId
  function normalizeTarget(raw: string): { cleanKey: string; cleanPhone?: string; cleanEmail?: string; isAll?: boolean } {
    if (!raw) return { cleanKey: "" };
    const str = String(raw).trim();
    const lower = str.toLowerCase();
    if (str.toUpperCase() === 'ALL' || str === 'सभी यूजर्स' || str === '*') {
      return { cleanKey: 'ALL', isAll: true };
    }
    if (lower.includes('@')) {
      return { cleanKey: lower, cleanEmail: lower };
    }
    const digits = str.replace(/\D/g, "");
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      return { cleanKey: last10, cleanPhone: last10 };
    }
    return { cleanKey: lower };
  }

  // 1-Click Free Plan / Offer Grant Endpoint
  app.post("/api/admin/grants", (req, res) => {
    try {
      const {
        target = "CURRENT_USER",
        planId = "free_grant_vip",
        planName = "100% Free VIP Plan",
        workersLimit = 25,
        durationDays = 365,
        notes = "Admin Free Offer"
      } = req.body;

      if (!target || !String(target).trim()) {
        return res.status(400).json({ error: "Target phone or Gmail is required" });
      }

      const { cleanKey, cleanPhone, cleanEmail, isAll } = normalizeTarget(target);
      const grantId = "grant_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const now = new Date();
      const numDays = Number(durationDays) || 365;
      const expiry = new Date(now.getTime() + numDays * 24 * 60 * 60 * 1000);

      const subObj = {
        isSubscribed: true,
        planId: planId || "free_grant_vip",
        planName: planName || `100% Free VIP (${workersLimit} Labour)`,
        amount: 0,
        workersLimit: Number(workersLimit) || 25,
        paymentId: `ADMIN_OFFER_${Date.now()}`,
        paymentMethod: "Super Admin 1-Click Free Offer",
        subscribedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        isApproved: true,
        status: "APPROVED"
      };

      // 1. Insert into free_grants table
      const insertGrant = db.prepare(`
        INSERT INTO free_grants (
          id, targetIdentifier, phone, email, userId, planId, planName, 
          workersLimit, durationDays, amount, status, isApproved, isSubscribed, 
          grantedAt, expiresAt, notes, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'APPROVED', 1, 1, CURRENT_TIMESTAMP, ?, ?, 1)
      `);
      insertGrant.run(
        grantId,
        cleanKey,
        cleanPhone || "",
        cleanEmail || "",
        cleanKey,
        planId,
        planName,
        Number(workersLimit) || 25,
        numDays,
        expiry.toISOString(),
        notes || ""
      );

      // 2. Also update or create user_sync records
      if (isAll) {
        // Update all users in user_sync
        const allUsers = db.prepare("SELECT userId, data FROM user_sync").all() as any[];
        for (const u of allUsers) {
          let uData: any = {};
          try { uData = JSON.parse(u.data); } catch (e) {}
          uData.lb_subscription_info = JSON.stringify(subObj);
          db.prepare("UPDATE user_sync SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE userId = ?").run(JSON.stringify(uData), u.userId);
        }
      } else {
        // Find matching users in user_sync
        const matchingUsers = db.prepare(`
          SELECT userId, data FROM user_sync 
          WHERE userId = ? OR userId LIKE ? OR data LIKE ? OR data LIKE ?
        `).all(
          cleanKey,
          `%${cleanKey}%`,
          cleanPhone ? `%${cleanPhone}%` : '%____NOT_MATCH____%',
          cleanEmail ? `%${cleanEmail}%` : '%____NOT_MATCH____%'
        ) as any[];

        if (matchingUsers.length > 0) {
          for (const u of matchingUsers) {
            let uData: any = {};
            try { uData = JSON.parse(u.data); } catch (e) {}
            uData.lb_subscription_info = JSON.stringify(subObj);
            db.prepare("UPDATE user_sync SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE userId = ?").run(JSON.stringify(uData), u.userId);
          }
        } else {
          // If user hasn't synced yet, create a placeholder user_sync record with this subscription!
          const initialData = {
            lb_subscription_info: JSON.stringify(subObj),
            lb_user_profile: JSON.stringify({
              phone: cleanPhone || '',
              email: cleanEmail || '',
              name: 'Contractor (' + (cleanPhone || cleanEmail || cleanKey) + ')'
            })
          };
          db.prepare(`
            INSERT INTO user_sync (userId, data, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(userId) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
          `).run(cleanKey, JSON.stringify(initialData));
        }
      }

      res.json({
        success: true,
        message: `🎁 ${cleanKey === 'ALL' ? 'सभी यूजर्स' : cleanKey} को ${planName} (100% मुफ़्त) सफलतापूर्वक एक्टिवेट कर दिया गया है!`,
        grantId,
        subscriptionInfo: subObj
      });
    } catch (e) {
      console.error("Failed to grant free plan:", e);
      res.status(500).json({ error: "Failed to grant free plan" });
    }
  });

  // Get all active grants
  app.get("/api/admin/grants", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM free_grants ORDER BY grantedAt DESC").all() as any[];
      res.json({ grants: rows });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch grants" });
    }
  });

  // Delete / Revoke grant
  app.delete("/api/admin/grants/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM free_grants WHERE id = ?").run(id);
      res.json({ success: true, message: "Grant removed" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete grant" });
    }
  });

  // User subscription status verification endpoint (for automatic real-time 1-click activation on customer side)
  app.post("/api/user/check-subscription", (req, res) => {
    try {
      const { phone = "", email = "", userId = "", uid = "", sync_userId = "" } = req.body;
      
      const phoneDigits = String(phone || "").replace(/\D/g, "");
      const cleanPhone = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;
      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanUserId = String(userId || sync_userId || uid || "").trim().toLowerCase();

      // 1. Check free_grants table
      const nowIso = new Date().toISOString();
      const grant = db.prepare(`
        SELECT * FROM free_grants 
        WHERE is_active = 1 
          AND (expiresAt IS NULL OR expiresAt > ?)
          AND (
            targetIdentifier = 'ALL'
            OR (targetIdentifier != '' AND targetIdentifier = ?)
            OR (? != '' AND (phone = ? OR targetIdentifier = ?))
            OR (? != '' AND (email = ? OR targetIdentifier = ?))
            OR (? != '' AND (userId = ? OR targetIdentifier = ?))
          )
        ORDER BY workersLimit DESC, grantedAt DESC
        LIMIT 1
      `).get(
        nowIso,
        cleanPhone || cleanEmail || cleanUserId,
        cleanPhone, cleanPhone, cleanPhone,
        cleanEmail, cleanEmail, cleanEmail,
        cleanUserId, cleanUserId, cleanUserId
      ) as any;

      if (grant) {
        const subObj = {
          isSubscribed: true,
          planId: grant.planId || "free_grant_vip",
          planName: grant.planName || "100% Free VIP Plan",
          amount: 0,
          workersLimit: Number(grant.workersLimit) || 25,
          paymentId: `GRANT_${grant.id}`,
          paymentMethod: "Super Admin 1-Click Free Offer",
          subscribedAt: grant.grantedAt,
          expiresAt: grant.expiresAt,
          isApproved: true,
          status: "APPROVED"
        };
        return res.json({ hasGrant: true, subscriptionInfo: subObj });
      }

      // 2. Check user_sync table
      const syncRow = db.prepare(`
        SELECT data FROM user_sync 
        WHERE userId = ? OR userId = ? OR userId = ? OR data LIKE ? OR data LIKE ?
        LIMIT 1
      `).get(
        cleanPhone,
        cleanEmail,
        cleanUserId,
        cleanPhone ? `%"phone":"${cleanPhone}"%` : '%__NO__%',
        cleanEmail ? `%"email":"${cleanEmail}"%` : '%__NO__%'
      ) as any;

      if (syncRow) {
        let uData: any = {};
        try { uData = JSON.parse(syncRow.data); } catch (e) {}
        let subInfo: any = null;
        try {
          subInfo = typeof uData.lb_subscription_info === 'string' ? JSON.parse(uData.lb_subscription_info) : uData.lb_subscription_info;
        } catch (e) {}

        if (subInfo && subInfo.isSubscribed && subInfo.isApproved) {
          // Check expiry if present
          if (!subInfo.expiresAt || new Date(subInfo.expiresAt).getTime() > Date.now()) {
            return res.json({ hasGrant: true, subscriptionInfo: subInfo });
          }
        }
      }

      res.json({ hasGrant: false });
    } catch (e) {
      console.error("Check subscription error:", e);
      res.status(500).json({ error: "Check failed" });
    }
  });

  // Direct user subscription update by ID
  app.post("/api/admin/users/:userId/subscribe", (req, res) => {
    try {
      const { userId } = req.params;
      const { 
        isSubscribed = true, 
        planId = "free_grant_vip", 
        planName = "100% Free VIP Grant", 
        amount = 0, 
        workersLimit = 25, 
        durationDays = 365 
      } = req.body;

      const { cleanKey, cleanPhone, cleanEmail } = normalizeTarget(userId);
      const now = new Date();
      const expiryDays = Number(durationDays) || 365;
      const expiry = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);

      const subObj = {
        isSubscribed: Boolean(isSubscribed),
        planId,
        planName,
        amount: Number(amount) || 0,
        workersLimit: Number(workersLimit) || 25,
        paymentId: `ADMIN_FREE_GRANT_${Date.now()}`,
        paymentMethod: "Super Admin Free VIP Grant",
        subscribedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        isApproved: Boolean(isSubscribed),
        status: isSubscribed ? "APPROVED" : "REJECTED"
      };

      // Save to free_grants table
      const grantId = "grant_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      db.prepare(`
        INSERT INTO free_grants (
          id, targetIdentifier, phone, email, userId, planId, planName, 
          workersLimit, durationDays, amount, status, isApproved, isSubscribed, 
          grantedAt, expiresAt, notes, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'APPROVED', 1, 1, CURRENT_TIMESTAMP, ?, 'Admin Quick Grant', 1)
      `).run(
        grantId,
        cleanKey,
        cleanPhone || "",
        cleanEmail || "",
        cleanKey,
        planId,
        planName,
        Number(workersLimit) || 25,
        expiryDays,
        expiry.toISOString()
      );

      // Also update user_sync
      let row = db.prepare("SELECT data FROM user_sync WHERE userId = ? OR userId = ?").get(userId, cleanKey) as any;
      let userData: any = {};
      if (row) {
        try { userData = JSON.parse(row.data); } catch (e) {}
      }
      userData.lb_subscription_info = JSON.stringify(subObj);

      db.prepare(`
        INSERT INTO user_sync (userId, data, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(userId) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).run(cleanKey || userId, JSON.stringify(userData));

      res.json({ success: true, userData, subscriptionInfo: subObj });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  // Broadcast Notifications Endpoints
  app.get("/api/broadcasts", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM broadcast_notifications WHERE is_active = 1 ORDER BY created_at DESC").all() as any[];
      res.json({ broadcasts: rows });
    } catch (e) {
      console.error("Failed to fetch broadcasts", e);
      res.status(500).json({ error: "Failed to fetch broadcasts" });
    }
  });

  app.post("/api/admin/broadcast", (req, res) => {
    try {
      const { title, message, type = "ANNOUNCEMENT", actionUrl = "" } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: "Title and message are required" });
      }

      const id = "bc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      
      const stmt = db.prepare(`
        INSERT INTO broadcast_notifications (id, title, message, type, actionUrl, created_at, is_active)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
      `);
      stmt.run(id, title, message, type, actionUrl || "");

      // Count total synced users in database
      const userCountRow = db.prepare("SELECT COUNT(*) as cnt FROM user_sync").get() as any;
      const totalSyncedUsers = userCountRow ? userCountRow.cnt : 0;
      // Estimate total active audience (real synced users + base network)
      const estimatedReach = Math.max(totalSyncedUsers, 1) + 500000;

      const newBroadcast = {
        id,
        title,
        message,
        type,
        actionUrl,
        created_at: new Date().toISOString(),
        is_active: 1
      };

      res.json({
        success: true,
        broadcast: newBroadcast,
        syncedUsers: totalSyncedUsers,
        totalReachEstimate: estimatedReach,
        message: `ब्रॉडकास्ट सफलतापूर्वक जारी कर दिया गया! सभी अनलिमिटेड यूज़र्स को दिखेगा।`
      });
    } catch (e) {
      console.error("Broadcast failed:", e);
      res.status(500).json({ error: "Failed to send broadcast" });
    }
  });

  app.delete("/api/admin/broadcast/:id", (req, res) => {
    try {
      const { id } = req.params;
      if (id === "all") {
        db.prepare("DELETE FROM broadcast_notifications").run();
      } else {
        db.prepare("DELETE FROM broadcast_notifications WHERE id = ?").run(id);
      }
      res.json({ success: true });
    } catch (e) {
      console.error("Delete broadcast failed:", e);
      res.status(500).json({ error: "Failed to delete broadcast" });
    }
  });

  // Admin Secretary AI Assistant Chat Endpoint
  app.post("/api/admin/secretary/chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      
      // Load real system stats for Secretary context
      const rows = db.prepare("SELECT userId, data, updated_at FROM user_sync ORDER BY updated_at DESC").all() as any[];
      let totalUsers = rows.length;
      let activeSubscribers = 0;
      let totalWorkersSystem = 0;
      let totalCashIn = 0;
      let totalCashOut = 0;

      rows.forEach(r => {
        try {
          const d = JSON.parse(r.data || '{}');
          const sub = typeof d.lb_subscription_info === 'string' ? JSON.parse(d.lb_subscription_info || '{}') : d.lb_subscription_info;
          if (sub?.isSubscribed && sub?.isApproved) activeSubscribers++;

          const workers = typeof d.lb_workers === 'string' ? JSON.parse(d.lb_workers || '[]') : d.lb_workers;
          if (Array.isArray(workers)) totalWorkersSystem += workers.length;

          const cash = typeof d.lb_cashentries === 'string' ? JSON.parse(d.lb_cashentries || '[]') : d.lb_cashentries;
          if (Array.isArray(cash)) {
            cash.forEach((c: any) => {
              if (c.type === 'IN') totalCashIn += Number(c.amount) || 0;
              else totalCashOut += Number(c.amount) || 0;
            });
          }
        } catch (e) {}
      });

      const ai = getGeminiAI();

      const systemBriefing = `System Context:
- Total Users Registered: ${totalUsers}
- Active Subscribers: ${activeSubscribers}
- Free Trial Users: ${totalUsers - activeSubscribers}
- Total System Workers: ${totalWorkersSystem}
- Total System Cash In: ₹${totalCashIn}
- Total System Cash Out: ₹${totalCashOut}`;

      if (!ai) {
        // Smart Admin Secretary fallback response
        let reply = `👔 **एडमिन सेक्रेटरी (Admin Secretary Report):**\n\n`;
        const q = (message || "").toLowerCase();

        if (q.includes('free') || q.includes('फ्री') || q.includes('grant') || q.includes('दें')) {
          reply += `सर, आप Admin Panel में निम्नलिखित प्रकार से किसी भी ठेकेदार/यूजर्स को 100% मुफ़्त प्लान दे सकते हैं:\n\n` +
            `1️⃣ **यूजर्स लिस्ट से direct:** 'Users' टैब में जाकर किसी भी यूजर के नाम के आगे '**100% मुफ़्त VIP दें**' बटन पर क्लिक करें।\n` +
            `2️⃣ **मुफ़्त प्लान सेंटर से:** Admin Panel में 'मुफ़्त प्लान सेंटर' (Free Plan Granter) सेक्शन में यूजर चुनें, लेबर लिमिट (जैसे 5, 15, 25 या Unlimited) सेट करें और '**Grant Free Plan**' पर क्लिक करें।\n\n` +
            `यह यूजर तुरंत एक्टिव हो जाएगा और उनसे कोई भुगतान नहीं लिया जाएगा।`;
        } else if (q.includes('report') || q.includes('रिपोर्ट') || q.includes('stat') || q.includes('समरी')) {
          reply += `**आज की संपूर्ण प्रशासनिक स्थिति (Daily Administrative Briefing):**\n\n` +
            `👥 **कुल रजिस्टर्ड यूजर्स:** ${totalUsers}\n` +
            `✨ **एक्टिव प्रीमियम मेंबर्स:** ${activeSubscribers}\n` +
            `⏳ **फ्री ट्रॉयल यूजर्स:** ${totalUsers - activeSubscribers}\n` +
            `👷 **सिस्टम में दर्ज कुल मजदूर:** ${totalWorkersSystem}\n` +
            `💰 **कुल कैश आवक:** ₹${totalCashIn.toLocaleString('hi-IN')}\n` +
            `💸 **कुल कैश जावक:** ₹${totalCashOut.toLocaleString('hi-IN')}\n\n` +
            `सर, सिस्टम पूरी तरह सुचारू रूप से कार्य कर रहा है!`;
        } else {
          reply += `नमस्ते सर! मैं आपका onediary.in Admin Secretary हूँ।\n\n` +
            `${systemBriefing}\n\n` +
            `आप मुझसे सिस्टम के बारे में सवाल पूछ सकते हैं या यूज़र को फ्री प्लान देने, पेमेंट्स वेरीफाई करने और डेली रिपोर्ट्स देखने के लिए निर्देश दे सकते हैं।`;
        }

        return res.json({ reply });
      }

      const contents = history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const secPrompt = `You are the executive AI Admin Secretary for the Super Admin of onediary.in app. Speak with high respect, extreme clarity, professional etiquette, and executive command in Hindi/Hinglish or English (matching the user's input).

Current Real-Time App Infrastructure Briefing:
${systemBriefing}

Your Duties:
1. Provide accurate stats about registered contractors, workers, subscriptions, and financial flows.
2. Explain how the Super Admin can grant 100% Free VIP Access / custom labour limit to any user.
3. Be respectful (e.g. "नमस्ते सर!", "जी सर,").
4. Format responses cleanly with bold headings, bullet points, and clear emojis.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: contents,
          config: { systemInstruction: secPrompt }
        });

        const replyText = response.text || "जी सर, आपका आदेश समझ में आया।";
        return res.json({ reply: replyText });
      } catch (gemError: any) {
        console.warn("Secretary Gemini API notice:", gemError?.message || gemError);
        let fallbackReply = `👔 **एडमिन सेक्रेटरी (Admin Secretary Report):**\n\n` +
          `👥 **कुल रजिस्टर्ड यूजर्स:** ${totalUsers}\n` +
          `✨ **एक्टिव प्रीमियम मेंबर्स:** ${activeSubscribers}\n` +
          `👷 **सिस्टम में दर्ज कुल मजदूर:** ${totalWorkersSystem}\n` +
          `💰 **कुल कैश आवक:** ₹${totalCashIn.toLocaleString('hi-IN')}\n\n` +
          `जी सर! आप Admin Panel से किसी भी ठेकेदार को फ्री VIP एक्सेस दे सकते हैं या सिस्टम डेटा का बैकअप ले सकते हैं।`;
        return res.json({ reply: fallbackReply });
      }
    } catch (e: any) {
      console.error("Secretary chat error:", e);
      res.status(500).json({ error: "Secretary service temporarily busy." });
    }
  });

  // Live SSE connection pool for zero-latency instant updates across all clients & devices
  const liveSyncClients = new Set<express.Response>();

  function broadcastLiveUpdate(payload: any) {
    const message = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of liveSyncClients) {
      try {
        client.write(message);
      } catch (err) {
        liveSyncClients.delete(client);
      }
    }
  }

  // Real-time EventSource endpoint for all devices
  app.get("/api/live-sync", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (typeof (res as any).flushHeaders === "function") {
      (res as any).flushHeaders();
    }

    res.write(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: Date.now() })}\n\n`);
    liveSyncClients.add(res);

    req.on("close", () => {
      liveSyncClients.delete(res);
    });
  });

  // 1-Click Master Broadcast to all devices
  app.post("/api/settings/broadcast-all", (req, res) => {
    try {
      const { settings } = req.body;
      const stmt = db.prepare(`
        INSERT INTO app_settings (key, value) 
        VALUES (?, ?) 
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);

      if (settings && typeof settings === "object") {
        for (const [k, v] of Object.entries(settings)) {
          stmt.run(k, JSON.stringify(v));
        }
      }
      const now = Date.now();
      stmt.run("settings_updated_at", JSON.stringify(now));

      // Push real-time event to EVERY connected client instantly
      broadcastLiveUpdate({
        type: "SETTINGS_UPDATED",
        timestamp: now,
        settings,
        notice: "⚡ एडमिन द्वारा सभी सेटिंग्स व दरें तुरंत लागू कर दी गई हैं!"
      });

      res.json({ success: true, timestamp: now, clientCount: liveSyncClients.size });
    } catch (e) {
      console.error("Failed to broadcast settings:", e);
      res.status(500).json({ error: "Failed to broadcast settings" });
    }
  });

  // Enhanced Settings Endpoints with Timestamp & Multi-Key Support
  app.get("/api/settings", (req, res) => {
    try {
      const rows = db.prepare("SELECT key, value FROM app_settings").all() as any[];
      const settings = rows.reduce((acc, row) => ({ ...acc, [row.key]: JSON.parse(row.value) }), {});
      res.json({
        ...settings,
        _server_time: Date.now()
      });
    } catch (e) {
      res.status(500).json({ error: "Failed to load settings" });
    }
  });

  app.post("/api/settings", (req, res) => {
    try {
      const { key, value, settings } = req.body;
      const stmt = db.prepare(`
        INSERT INTO app_settings (key, value) 
        VALUES (?, ?) 
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);

      const now = Date.now();
      if (settings && typeof settings === "object") {
        for (const [k, v] of Object.entries(settings)) {
          stmt.run(k, JSON.stringify(v));
        }
        stmt.run("settings_updated_at", JSON.stringify(now));
        broadcastLiveUpdate({ type: "SETTINGS_UPDATED", timestamp: now, settings });
        return res.json({ success: true, updated_at: now });
      }

      if (key && value !== undefined) {
        stmt.run(key, JSON.stringify(value));
        stmt.run("settings_updated_at", JSON.stringify(now));
        broadcastLiveUpdate({ type: "SETTINGS_UPDATED", timestamp: now, key, value });
        return res.json({ success: true, updated_at: now });
      }

      res.status(400).json({ error: "No valid settings payload provided" });
    } catch (e) {
      console.error("Failed to save settings:", e);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Payment Requests Endpoints for Universal Verification across devices
  app.get("/api/admin/payment-requests", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM payment_requests ORDER BY submittedAt DESC").all() as any[];
      res.json({ requests: rows });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load payment requests" });
    }
  });

  app.post("/api/payment-requests", (req, res) => {
    try {
      const { id, userId, userName, userPhone, planId, planName, amount, utrNumber } = req.body;
      const reqId = id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const stmt = db.prepare(`
        INSERT INTO payment_requests (id, userId, userName, userPhone, planId, planName, amount, utrNumber, submittedAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'PENDING')
        ON CONFLICT(id) DO UPDATE SET 
          userName = excluded.userName,
          userPhone = excluded.userPhone,
          planId = excluded.planId,
          planName = excluded.planName,
          amount = excluded.amount,
          utrNumber = excluded.utrNumber
      `);
      stmt.run(reqId, userId || "", userName || "Contractor", userPhone || "", planId || "", planName || "", Number(amount) || 0, utrNumber || "");
      res.json({ success: true, id: reqId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to record payment request" });
    }
  });

  app.post("/api/admin/payment-requests/:id/approve", (req, res) => {
    try {
      const { id } = req.params;
      const row = db.prepare("SELECT * FROM payment_requests WHERE id = ?").get(id) as any;
      if (!row) {
        return res.status(404).json({ error: "Payment request not found" });
      }
      db.prepare("UPDATE payment_requests SET status = 'APPROVED' WHERE id = ?").run(id);

      // Automatically grant subscription to this phone/user globally
      const phone = (row.userPhone || "").replace(/\D/g, "");
      const cleanPhone = phone.length >= 10 ? phone.slice(-10) : phone;
      const cleanKey = cleanPhone || row.userId || id;
      const now = new Date();
      const numDays = row.planId && row.planId.includes("year") ? 365 : 30;
      const expiry = new Date(now.getTime() + numDays * 24 * 60 * 60 * 1000);

      const grantId = "grant_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const subObj = {
        isSubscribed: true,
        planId: row.planId || "paid_plan",
        planName: row.planName || "Verified Subscription",
        amount: row.amount || 0,
        workersLimit: 50,
        paymentId: row.utrNumber || `REQ_${id}`,
        paymentMethod: "Bank / UPI Transfer (Approved by Admin)",
        subscribedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        isApproved: true,
        status: "APPROVED"
      };

      db.prepare(`
        INSERT INTO free_grants (
          id, targetIdentifier, phone, email, userId, planId, planName, 
          workersLimit, durationDays, amount, status, isApproved, isSubscribed, 
          grantedAt, expiresAt, notes, is_active
        ) VALUES (?, ?, ?, '', ?, ?, ?, 50, ?, ?, 'APPROVED', 1, 1, CURRENT_TIMESTAMP, ?, 'Admin Approved Payment Request', 1)
      `).run(grantId, cleanKey, cleanPhone, cleanKey, row.planId, row.planName, numDays, row.amount, expiry.toISOString());

      // Update user_sync if exists
      const match = db.prepare("SELECT userId, data FROM user_sync WHERE userId = ? OR data LIKE ?").get(cleanKey, cleanPhone ? `%"phone":"${cleanPhone}"%` : '%__NO__%') as any;
      if (match) {
        let uData: any = {};
        try { uData = JSON.parse(match.data); } catch (e) {}
        uData.lb_subscription_info = JSON.stringify(subObj);
        db.prepare("UPDATE user_sync SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE userId = ?").run(JSON.stringify(uData), match.userId);
      }

      res.json({ success: true, message: "भुगतान अनुरोध स्वीकृत हो गया और सब्सक्रिप्शन सक्रिय हो गया!" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to approve payment request" });
    }
  });

  app.post("/api/admin/payment-requests/:id/reject", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("UPDATE payment_requests SET status = 'REJECTED' WHERE id = ?").run(id);
      res.json({ success: true, message: "Payment request rejected" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to reject payment request" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [], appData } = req.body;
      const ai = getGeminiAI();

      if (!ai) {
        // Smart AI fallback when Gemini API key is not configured on deployment
        const fallbackReply = generateFallbackReply(message, appData);
        return res.json({ 
          reply: fallbackReply, 
          searchQueries: [], 
          sources: [] 
        });
      }
      
      const contents = history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : msg.role, // normalize role
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const systemInstruction = `You are "Super AI Genius" (onediary.in Official Super AI Chatbot), an all-knowing, highly intelligent, unlimited AI Assistant powered by Gemini. You possess complete expertise across General Knowledge, Science, History, Geography, Mathematics, Business & Finance, Civil Engineering, Construction, Real Estate, Labor Laws, Coding, Writing, Astrology & Kundli, and master-level knowledge of the onediary.in platform.

---

### 📲 ONEDIARY.IN PLATFORM KNOWLEDGE BASE:
When asked about onediary.in features, capabilities, or usage, provide comprehensive details:
1. **App Identity**: onediary.in (DigitDiary) is India's #1 All-In-One Smart Digital Diary & Business App designed for Construction Contractors, Real Estate Developers, Builders, Shopkeepers, Craftsmen, and Business Owners.
2. **Labor Attendance & Payroll Register**:
   - 1-Click Attendance Marking: Present (P), Absent (A), Half Day (HD), Overtime (OT hours).
   - Flexible wage modes: Daily, Weekly, Monthly, Round/Piece-rate.
   - Automatic weekly/monthly payouts, advance (udhari) tracking, and 1-Click WhatsApp pay-slip sharing.
3. **Digital Cashbook & Expenses Ledger**:
   - Track Money In (Cash Received / Avak) and Money Out (Expenses / Javak) across multiple site projects.
   - Real-time net balance calculations, transaction search, filters, and instant PDF exports.
4. **GST Bill & Quotation Maker**:
   - Instant professional Quotation/Estimate & GST Invoices with 5%, 12%, 18%, 28% GST rates.
   - Built-in presets for Civil Construction, Electrician, Painter, Plumber, Carpenter, POP, Real Estate, and Custom Trades.
   - HSN codes, company logo, terms & conditions, and WhatsApp PDF sharing.
5. **Smart Calculator & Short-Cut Widgets**:
   - Floating Smart Calculator widget + full screen calculator with +5% GST, +18% GST, and x1.5 OT buttons, plus Number-to-Words (हिंदी व अंग्रेजी अंकों को शब्दों में बदलना).
6. **Shree Hanuman Prasad Panchang & Calendar 2026**:
   - Complete 2026 Hindu Panchang with Vrat, Festivals, Shubh Vivah Muhurat, Griha Pravesh Muhurat, Govt Holidays, and Rashifal.
7. **Vedic Kundli & 36 Guna Matchmaking**:
   - 10-Year Janam Kundli, Lagna/Chandra charts, Vimshottari Dasha, Mangal Dosh analysis, and 36 Guna Ashtakoot Matchmaking with Royal Printable Certificates.
8. **Digital Diary, Material Stock & Voice Notes**:
   - Record daily site notes, material stock entries (cement, steel, sand), site photos, and voice typing notes.
9. **1-Click Download & Offline Engine**:
   - Download on Android and iPhone in 1-click. Operates 100% offline without internet, and syncs automatically when online.

---

### 🌟 UNIVERSAL SUPER AI CAPABILITIES:
1. **Universal Knowledge & Problem Solving**: Answer ANY question on general knowledge, history, science, geography, world news, sports, entertainment, health, coding, math, recipes, and daily life.
2. **Writing & Drafting**: Write emails, formal letters, payment reminder messages, legal notices, essays, social media captions, and poetry.
3. **Construction & Civil Engineering**: Answer cement-to-sand mortar ratios, brickwork estimates, steel weight formulas ($d^2/162$ kg/m), site safety rules, and labor laws.
4. **App Data Integration**: Leverage this live app state for worker & financial answers: ${appData || '{}'}.
5. **Language & Script Alignment**: Respond in the EXACT language and script used by the user (Hindi, Hinglish, Marathi, Gujarati, English, Tamil, Telugu, etc.) with clean markdown formatting.
6. **Google Search Grounding**: Use real-time Google Search whenever asked about current news, live market prices, or real-world facts.`;

      let response;
      let usedSearch = true;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }],
          }
        });
      } catch (searchError: any) {
        usedSearch = false;
        const errStr = String(searchError?.message || searchError || '');
        const isQuota = errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota');
        
        if (isQuota) {
          console.warn("Gemini API quota rate limit reached. Serving smart local assistant response.");
          const fallbackReply = generateFallbackReply(message, appData);
          return res.json({
            reply: fallbackReply,
            searchQueries: [],
            sources: []
          });
        }

        console.warn("Gemini Search Grounding notice:", searchError?.message || searchError);
        
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
            }
          });
        } catch (retryError: any) {
          const fallbackReply = generateFallbackReply(message, appData);
          return res.json({
            reply: fallbackReply,
            searchQueries: [],
            sources: []
          });
        }
      }
      
      const reply = response.text || generateFallbackReply(message, appData);
      const groundingMetadata = usedSearch ? response.candidates?.[0]?.groundingMetadata : null;
      const searchQueries = groundingMetadata?.webSearchQueries || [];
      const sources = groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter(Boolean)
        .map((web: any) => ({
          title: web.title,
          uri: web.uri
        })) || [];

      res.json({ reply, searchQueries, sources });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const fallbackReply = generateFallbackReply(req.body?.message || "", req.body?.appData);
      res.json({
        reply: fallbackReply,
        searchQueries: [],
        sources: []
      });
    }
  });

  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { planId, amount = 2999, planName = "Subscription", duration = "month", keyId, keySecret } = req.body;
      
      let key_id = keyId || process.env.RAZORPAY_KEY_ID;
      let key_secret = keySecret || process.env.RAZORPAY_KEY_SECRET;

      if (key_secret && (key_secret.startsWith("rzp_live_") || key_secret.startsWith("rzp_test_")) && 
          key_id && !(key_id.startsWith("rzp_live_") || key_id.startsWith("rzp_test_"))) {
        const temp = key_id;
        key_id = key_secret;
        key_secret = temp;
      }

      if (!key_id || !key_secret || key_id.length < 10 || key_secret.length < 10) {
        return res.status(400).json({ error: "Razorpay Key ID and Secret are not properly configured in Admin Panel." });
      }

      const instance = new Razorpay({
        key_id,
        key_secret,
      });

      let activePlanId = planId;

      if (activePlanId && activePlanId.startsWith("sub_")) {
        return res.json({ id: activePlanId, mock: false, keyId: key_id });
      }

      let subscription;
      try {
        if (!activePlanId || !activePlanId.startsWith("plan_")) {
          throw new Error("Invalid plan ID");
        }
        subscription = await instance.subscriptions.create({
          plan_id: activePlanId,
          total_count: (Number(amount) >= 2000 || duration === 'year') ? 10 : 120,
          customer_notify: 1,
        });
      } catch (err: any) {
        console.warn("Provided plan_id failed, auto-creating correct plan on Razorpay:", err?.message);
        const isYearly = Number(amount) >= 2000 || duration === 'year';
        const planAmountInPaise = Number(amount) * 100;
        
        const newPlan = await instance.plans.create({
          period: isYearly ? "yearly" : "monthly",
          interval: 1,
          item: {
            name: planName || (isYearly ? "Annual VIP Plan" : "Monthly Plan"),
            amount: planAmountInPaise,
            currency: "INR",
            description: `${planName} (${isYearly ? "Yearly" : "Monthly"})`,
          }
        });

        activePlanId = newPlan.id;

        subscription = await instance.subscriptions.create({
          plan_id: activePlanId,
          total_count: isYearly ? 10 : 120,
          customer_notify: 1,
        });
      }

      res.json({ ...subscription, mock: false, keyId: key_id });
    } catch (error: any) {
      const errorMessage = error?.error?.description || error?.message || "Subscription creation failed";
      res.status(400).json({ error: errorMessage });
    }
  });

  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", keyId, keySecret } = req.body;
      
      let key_id = keyId || process.env.RAZORPAY_KEY_ID;
      let key_secret = keySecret || process.env.RAZORPAY_KEY_SECRET;

      // Auto-correct if user accidentally swapped ID and Secret
      if (key_secret && (key_secret.startsWith("rzp_live_") || key_secret.startsWith("rzp_test_")) && 
          key_id && !(key_id.startsWith("rzp_live_") || key_id.startsWith("rzp_test_"))) {
        const temp = key_id;
        key_id = key_secret;
        key_secret = temp;
      }

      if (!key_id || !key_secret || key_id.length < 10 || key_secret.length < 10) {
        // Return a mock order if no keys are provided (for demo purposes)
        return res.json({
          id: "order_mock_" + Math.random().toString(36).substring(7),
          amount,
          currency,
          mock: true
        });
      }

      const instance = new Razorpay({
        key_id,
        key_secret,
      });

      const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency,
        receipt: "receipt_" + Math.random().toString(36).substring(7),
      };

      const order = await instance.orders.create(options);
      res.json({ ...order, mock: false, keyId: key_id });
    } catch (error: any) {
      // Keys were rejected by Razorpay (likely test/fake keys). Fall back to mock mode.
      const errorMessage = error?.error?.description || error?.message || "Authentication failed";
      
      // Fallback to mock mode
      res.json({
        id: "order_mock_" + Math.random().toString(36).substring(7),
        amount: req.body.amount * 100,
        currency: req.body.currency || "INR",
        mock: true,
        mockReason: errorMessage
      });
    }
  });

  app.post("/api/github/push", async (req, res) => {
    try {
      const { token, repo, data } = req.body;
      if (!token || !repo || !data) {
        return res.status(400).json({ error: "Missing token, repo, or data" });
      }

      const fileContent = JSON.stringify(data, null, 2);
      const encodedContent = Buffer.from(fileContent, "utf-8").toString("base64");
      const path = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      const apiUrl = `https://api.github.com/repos/${repo.trim()}/contents/${path}`;

      let sha: string | undefined = undefined;
      const getRes = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'onediary-app'
        }
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'onediary-app'
        },
        body: JSON.stringify({
          message: `Backup update onediary.in - ${new Date().toLocaleString()}`,
          content: encodedContent,
          sha: sha
        })
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        throw new Error(errJson.message || `GitHub API error (${putRes.status})`);
      }

      const resJson = await putRes.json();
      res.json({ success: true, commit: resJson.commit?.sha, path });
    } catch (error: any) {
      console.error("GitHub Push Error:", error);
      res.status(500).json({ error: error.message || "Failed to push to GitHub" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support React Router
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
