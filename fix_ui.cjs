const fs = require('fs');
let content = fs.readFileSync('src/pages/ChatbotPage.tsx', 'utf8');

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
              setTimeout(() => handleSelectLanguageAndTest(speechLang), 100);
            }}
            className="px-2 py-1 bg-slate-800 text-orange-300 border border-slate-700/60 rounded-lg text-[11px] font-bold outline-none cursor-pointer w-[120px] truncate"
            title="अपनी पसंद की आवाज़ चुनें"
          >
            <option value="">ऑटोमैटिक (Auto)</option>
            {availableVoices
              .filter(v => v.lang.toLowerCase().startsWith(getBcp47Lang(speechLang).short.toLowerCase()) || v.lang.toLowerCase().includes('en'))
              .map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name.includes('Male') || v.name.includes('Standard-B') || v.name.includes('Standard-D') || v.name.includes('-x-hid-') || v.name.includes('guy') || v.name.includes('david') || v.name.includes('mark') ? '👨 ' : '👩 '} 
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
