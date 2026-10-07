const fs = require('fs');

let chatbot = fs.readFileSync('src/pages/ChatbotPage.tsx', 'utf8');
const cbOld2 = `      utterance.lang = bcp;
      utterance.rate = 0.95; // Natural clear reading speed
      utterance.pitch = 0.75; // Lower pitch for more masculine (Aadmi) sound
      utterance.rate = 0.95; // Clear reading speed`;
const cbNew2 = `      utterance.lang = bcp;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;`;
chatbot = chatbot.replace(cbOld2, cbNew2);
fs.writeFileSync('src/pages/ChatbotPage.tsx', chatbot);
