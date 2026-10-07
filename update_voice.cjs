const fs = require('fs');
let content = fs.readFileSync('src/pages/ChatbotPage.tsx', 'utf8');

const oldBlock = `      utterance.pitch = 0.9; // Lower pitch for more masculine sound

      // Pick best matching voice from browser's available voices
      const allVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      if (allVoices && allVoices.length > 0) {
        const langCode = bcp.toLowerCase();
        const shortCode = short.toLowerCase();

        // Prefer Male voices (Normal Admi voice)
        const isMaleVoice = (v) => {
          const lowerName = v.name.toLowerCase();
          return lowerName.includes('male') || lowerName.includes('standard-b') || lowerName.includes('standard-d') || lowerName.includes('standard-c');
        };

        const matchVoice = allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-') === langCode && isMaleVoice(v) && v.name.includes('Google')
        ) || allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-') === langCode && isMaleVoice(v)
        ) || allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-') === langCode && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural'))
        ) || allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-') === langCode
        ) || allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-').startsWith(shortCode) && isMaleVoice(v)
        ) || allVoices.find(v => v.lang.toLowerCase().includes('hi') || v.lang.toLowerCase().includes('en'));

        if (matchVoice) {
          utterance.voice = matchVoice;
        }
      }`;

const newBlock = `      utterance.pitch = 0.75; // Lower pitch for more masculine (Aadmi) sound
      utterance.rate = 0.95; // Clear reading speed

      // Pick best matching voice from browser's available voices
      const allVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      if (allVoices && allVoices.length > 0) {
        const langCode = bcp.toLowerCase();
        const shortCode = short.toLowerCase();

        // Prefer Male voices (Normal Admi voice)
        const isMaleVoice = (v) => {
          const lowerName = v.name.toLowerCase();
          return lowerName.includes('male') || 
                 lowerName.includes('standard-b') || 
                 lowerName.includes('standard-d') || 
                 lowerName.includes('-x-hie-') || 
                 lowerName.includes('-x-hid-') || 
                 lowerName.includes('पुरुष') || 
                 lowerName.includes('guy') || 
                 lowerName.includes('david') || 
                 lowerName.includes('mark') || 
                 lowerName.includes('george') || 
                 lowerName.includes('ravi');
        };

        // Strictly prioritize male voices
        const matchVoice = allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-') === langCode && isMaleVoice(v) && v.name.includes('Google')
        ) || allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-') === langCode && isMaleVoice(v)
        ) || allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-').startsWith(shortCode) && isMaleVoice(v)
        ) || allVoices.find(v => 
          (v.lang.toLowerCase().includes('hi') || v.lang.toLowerCase().includes('en')) && isMaleVoice(v)
        ) || allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-') === langCode && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural'))
        ) || allVoices.find(v => 
          v.lang.toLowerCase().replace('_', '-') === langCode
        ) || allVoices.find(v => v.lang.toLowerCase().includes('hi') || v.lang.toLowerCase().includes('en'));

        if (matchVoice) {
          utterance.voice = matchVoice;
          
          // Apply extra pitch adjustment if fallback to female
          if (!isMaleVoice(matchVoice)) {
             utterance.pitch = 0.6; // Deepen voice artificially if it's female
          } else {
             utterance.pitch = 0.9; // Keep normal pitch for real male voices
          }
        }
      }`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/ChatbotPage.tsx', content);
