const fs = require('fs');
let content = fs.readFileSync('src/components/DraggableWidgets.tsx', 'utf8');

const oldBlock = `      const voices = window.speechSynthesis.getVoices();
      
      const isMaleVoice = (v) => {
        const lowerName = v.name.toLowerCase();
        return lowerName.includes('male') || lowerName.includes('-x-hie-') || lowerName.includes('-x-hid-') || lowerName.includes('पुरुष');
      };
      
      const matchVoice = voices.find(v => v.lang.includes('hi') && isMaleVoice(v)) || voices.find(v => v.lang.includes('hi')) || voices.find(v => v.lang.includes('en') && isMaleVoice(v)) || voices.find(v => v.lang.includes('en'));
      
      if (matchVoice) {
        utterance.voice = matchVoice;
        if (!isMaleVoice(matchVoice)) {
          utterance.pitch = 0.6;
        } else {
          utterance.pitch = 0.9;
        }
      }`;

const newBlock = `      const voices = window.speechSynthesis.getVoices();
      
      const isMaleVoice = (v) => {
        const lowerName = v.name.toLowerCase();
        return lowerName.includes('male') || lowerName.includes('standard-b') || lowerName.includes('standard-d') || lowerName.includes('-x-hie-') || lowerName.includes('-x-hid-') || lowerName.includes('पुरुष');
      };
      
      let matchVoice = voices.find(v => v.lang.includes('hi') && isMaleVoice(v));
      if (!matchVoice) matchVoice = voices.find(v => isMaleVoice(v));
      if (!matchVoice) matchVoice = voices.find(v => v.lang.includes('hi'));
      
      if (matchVoice) {
        utterance.voice = matchVoice;
        if (!isMaleVoice(matchVoice)) {
          utterance.pitch = 0.2;
          utterance.rate = 0.85;
        } else {
          utterance.pitch = 0.9;
        }
      }`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/DraggableWidgets.tsx', content);
