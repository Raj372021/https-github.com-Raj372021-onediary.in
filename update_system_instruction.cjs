const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldStr = `2. **Language & Tone**: Match the user's language. Speak in polite, helpful, and friendly English or Hindi (written in standard Hindi Devanagari or Hinglish/Latin-script conversational Hindi, matching the user's prompt style).`;
const newStr = `2. **Language & Tone**: MATCH THE EXACT LANGUAGE AND SCRIPT OF THE USER. You must reply in the exact language the user types in (e.g. Marathi, Bengali, Gujarati, Tamil, Telugu, Hindi, English, etc). If the user types in Hinglish/Latin-script, reply in Hinglish. Be polite, helpful, and friendly.`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('server.ts', content);
