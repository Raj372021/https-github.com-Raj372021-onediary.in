const fs = require('fs');
let content = fs.readFileSync('src/pages/ChatbotPage.tsx', 'utf8');

// 1. Add state
const stateOld = `  const [speechLang, setSpeechLang] = useState<string>(() => {
    return getBcp47Lang(language).bcp;
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);`;
const stateNew = `  const [speechLang, setSpeechLang] = useState<string>(() => {
    return getBcp47Lang(language).bcp;
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');`;
content = content.replace(stateOld, stateNew);

// 2. Modify speakMessage
const speakOld = `      // Pick best matching voice from browser's available voices
      let allVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      
      // Attempting to force male voice across all languages
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
                 lowerName.includes('ravi') ||
                 lowerName.includes('rishabh');
      };

      if (allVoices && allVoices.length > 0) {
        const langCode = bcp.toLowerCase();
        const shortCode = short.toLowerCase();

        // 1. Strict Male Native
        let matchVoice = allVoices.find(v => v.lang.toLowerCase().replace('_', '-') === langCode && isMaleVoice(v));
        
        // 2. Male General Language
        if (!matchVoice) matchVoice = allVoices.find(v => v.lang.toLowerCase().startsWith(shortCode) && isMaleVoice(v));
        
        // 3. ANY Male Voice (Even English) for Hindi text, sometimes browsers read it ok if we drop pitch
        if (!matchVoice) matchVoice = allVoices.find(v => isMaleVoice(v));

        // 4. Fallback to any correct language voice
        if (!matchVoice) matchVoice = allVoices.find(v => v.lang.toLowerCase().replace('_', '-') === langCode);
        
        // 5. Fallback to general short language
        if (!matchVoice) matchVoice = allVoices.find(v => v.lang.toLowerCase().startsWith(shortCode));

        if (matchVoice) {
          utterance.voice = matchVoice;
          
          // Apply extreme pitch adjustment to sound like a man if it's still a female voice
          if (!isMaleVoice(matchVoice)) {
             utterance.pitch = 0.2; // Severely deepen voice artificially if it's female
             utterance.rate = 0.85; // Slow down slightly for deeper effect
          } else {
             utterance.pitch = 0.9; // Keep normal pitch for real male voices
             utterance.rate = 0.95;
          }
        }
      }`;
      
const speakNew = `      // Pick best matching voice from browser's available voices
      let allVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      
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
                 lowerName.includes('ravi') ||
                 lowerName.includes('rishabh');
      };

      if (allVoices && allVoices.length > 0) {
        const langCode = bcp.toLowerCase();
        const shortCode = short.toLowerCase();
        
        let matchVoice;
        
        if (selectedVoiceURI) {
           matchVoice = allVoices.find(v => v.voiceURI === selectedVoiceURI);
        }
        
        if (!matchVoice) {
          // 1. Strict Male Native
          matchVoice = allVoices.find(v => v.lang.toLowerCase().replace('_', '-') === langCode && isMaleVoice(v));
          // 2. Male General Language
          if (!matchVoice) matchVoice = allVoices.find(v => v.lang.toLowerCase().startsWith(shortCode) && isMaleVoice(v));
          // 3. ANY Male Voice (Even English) for Hindi text, sometimes browsers read it ok if we drop pitch
          if (!matchVoice) matchVoice = allVoices.find(v => isMaleVoice(v));
          // 4. Fallback to any correct language voice
          if (!matchVoice) matchVoice = allVoices.find(v => v.lang.toLowerCase().replace('_', '-') === langCode);
          // 5. Fallback to general short language
          if (!matchVoice) matchVoice = allVoices.find(v => v.lang.toLowerCase().startsWith(shortCode));
        }

        if (matchVoice) {
          utterance.voice = matchVoice;
          
          if (!isMaleVoice(matchVoice)) {
             utterance.pitch = 0.2;
             utterance.rate = 0.85;
          } else {
             utterance.pitch = 0.9;
             utterance.rate = 0.95;
          }
        }
      }`;
content = content.replace(speakOld, speakNew);

// 3. Add Voice Selector UI
const uiOld = `          <button
            type="button"
            onClick={() => handleSelectLanguageAndTest(speechLang)}
            className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition active:scale-95 whitespace-nowrap"
            title="क्लिक करके चुनें भाषा की आवाज़ टेस्ट करें"
          >
            <Radio size={12} className="animate-spin" />
            <span>🔊 टेस्ट आवाज़</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
          {[`;
const uiNew = `          <select 
            value={selectedVoiceURI} 
            onChange={(e) => {
              setSelectedVoiceURI(e.target.value);
              handleSelectLanguageAndTest(speechLang);
            }}
            className="px-2 py-1 bg-slate-800 text-orange-300 border border-slate-700/60 rounded-lg text-[11px] font-bold outline-none cursor-pointer w-[120px] truncate"
            title="अपनी पसंद की आवाज़ चुनें"
          >
            <option value="">ऑटोमैटिक (Auto)</option>
            {availableVoices
              .filter(v => v.lang.toLowerCase().startsWith(getBcp47Lang(speechLang).short.toLowerCase()) || v.lang.toLowerCase().includes('en'))
              .map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name.includes('Male') || v.name.includes('Standard-B') || v.name.includes('Standard-D') ? '👨 ' : '👩 '} 
                  {v.name} ({v.lang})
                </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleSelectLanguageAndTest(speechLang)}
            className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition active:scale-95 whitespace-nowrap"
            title="क्लिक करके चुनें भाषा की आवाज़ टेस्ट करें"
          >
            <Radio size={12} className="animate-spin" />
            <span>🔊 टेस्ट</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
          {[`;
content = content.replace(uiOld, uiNew);

fs.writeFileSync('src/pages/ChatbotPage.tsx', content);
