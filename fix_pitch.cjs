const fs = require('fs');

// Fix ChatbotPage
let chatbot = fs.readFileSync('src/pages/ChatbotPage.tsx', 'utf8');
const cbOld = `        if (matchVoice) {
          utterance.voice = matchVoice;
          
          if (!isMaleVoice(matchVoice)) {
             utterance.pitch = 0.2;
             utterance.rate = 0.85;
          } else {
             utterance.pitch = 0.9;
             utterance.rate = 0.95;
          }
        }`;
const cbNew = `        if (matchVoice) {
          utterance.voice = matchVoice;
          utterance.pitch = 1.0;
          utterance.rate = 1.0;
        }`;
chatbot = chatbot.replace(cbOld, cbNew);
fs.writeFileSync('src/pages/ChatbotPage.tsx', chatbot);

// Fix DraggableWidgets
let widget = fs.readFileSync('src/components/DraggableWidgets.tsx', 'utf8');
const wOld = `      if (matchVoice) {
        utterance.voice = matchVoice;
        if (!isMaleVoice(matchVoice)) {
          utterance.pitch = 0.2;
          utterance.rate = 0.85;
        } else {
          utterance.pitch = 0.9;
        }
      }`;
const wNew = `      if (matchVoice) {
        utterance.voice = matchVoice;
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      }`;
widget = widget.replace(wOld, wNew);
fs.writeFileSync('src/components/DraggableWidgets.tsx', widget);
