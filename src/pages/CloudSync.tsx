import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  GitBranch, 
  Github, 
  FileDown, 
  FileUp, 
  CheckCircle, 
  Lock, 
  Sparkles, 
  Database,
  KeyRound,
  ExternalLink,
  Code
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function CloudSync() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('github_token') || '');
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem('github_repo') || '');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubMessage, setGithubMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normalizeId = (raw: string) => {
    if (!raw) return '';
    const clean = raw.trim().toLowerCase();
    if (/^[\d\s+\-()]+$/.test(clean)) {
      const digits = clean.replace(/\D/g, '');
      if (digits.length >= 10) return digits.slice(-10);
      return digits;
    }
    return clean;
  };

  useEffect(() => {
    const savedId = localStorage.getItem('sync_userId') || localStorage.getItem('lb_user_profile');
    if (savedId) {
      if (savedId.startsWith('{')) {
        try {
          const parsed = JSON.parse(savedId);
          if (parsed.email) setIdentifier(parsed.email);
          else if (parsed.phone) setIdentifier(parsed.phone);
        } catch (e) {}
      } else {
        setIdentifier(savedId);
      }
    }
  }, []);

  const handleBackup = async () => {
    const cleanId = normalizeId(identifier);
    if (!cleanId || cleanId.length < 3) {
      setMessage({
        text: language === 'hi' ? 'कृपया सही मोबाइल नंबर या ईमेल दर्ज करें' : 'Please enter a valid Phone Number or Email',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    setMessage({
      text: language === 'hi' ? '50 साल के लिए सुरक्षित डेटा क्लाउड पर बैकअप हो रहा है...' : 'Backing up data to 50-Year Cloud Vault...',
      type: 'info'
    });

    try {
      const dataToSync: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== 'sync_userId') {
          dataToSync[key] = localStorage.getItem(key) || '';
        }
      }

      const res = await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cleanId, data: dataToSync })
      });

      if (!res.ok) throw new Error('Backup failed');

      localStorage.setItem('sync_userId', cleanId);
      setMessage({
        text: language === 'hi' ? '✓ आपका सारा डेटा 50 साल के लिए क्लाउड सर्वर पर 100% सुरक्षित सहेज दिया गया है!' : '✓ Data permanently secured in 50-Year Cloud Vault!',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: language === 'hi' ? 'डेटा बैकअप में समस्या आई। पुनः प्रयास करें।' : 'Failed to backup data. Try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const cleanId = normalizeId(identifier);
    if (!cleanId || cleanId.length < 3) {
      setMessage({
        text: language === 'hi' ? 'कृपया सही मोबाइल नंबर या ईमेल दर्ज करें' : 'Please enter a valid Phone Number or Email',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    setMessage({
      text: language === 'hi' ? 'क्लाउड वॉल्ट से डेटा ढूंढा जा रहा है...' : 'Searching in Cloud Vault...',
      type: 'info'
    });

    try {
      const res = await fetch('/api/sync/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cleanId })
      });

      if (!res.ok) {
        throw new Error(language === 'hi' ? 'इस मोबाइल/ईमेल पर कोई बैकअप नहीं मिला।' : 'No backup found for this ID.');
      }

      const json = await res.json();
      if (!json.data || Object.keys(json.data).length === 0) {
        throw new Error(language === 'hi' ? 'इस खाते पर कोई सुरक्षित बैकअप नहीं मिला।' : 'No data found in backup.');
      }

      Object.keys(json.data).forEach((key) => {
        if (key && key !== 'sync_userId') {
          const val = json.data[key];
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        }
      });

      localStorage.setItem('sync_userId', cleanId);
      setMessage({
        text: language === 'hi' ? '✓ सारा डेटा सफलतापूर्वक रिस्टोर हो गया! ऐप रीलोड हो रहा है...' : '✓ Data restored successfully! Reloading...',
        type: 'success'
      });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error: any) {
      setMessage({
        text: error.message || (language === 'hi' ? 'डेटा रिस्टोर करने में समस्या आई।' : 'Failed to restore data. Try again.'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Export Local 50-Year Offline Backup (.json)
  const handleExportJsonFile = () => {
    try {
      const allData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allData[key] = localStorage.getItem(key);
      }
      const exportObject = {
        app: 'onediary.in',
        version: '50-Year-Perpetual-Vault-v2',
        exportedAt: new Date().toISOString(),
        identifier: identifier || 'user_data',
        records: allData
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `onediary_50yr_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setMessage({
        text: language === 'hi' ? '✓ 50-वर्षीय ऑफ़लाइन बैकअप फ़ाइल डाउनलोड हो गई है!' : '✓ 50-Year Offline Backup file downloaded successfully!',
        type: 'success'
      });
    } catch (e) {
      setMessage({
        text: language === 'hi' ? 'फ़ाइल डाउनलोड करने में त्रुटि।' : 'Failed to download file.',
        type: 'error'
      });
    }
  };

  // 1-Click Import Local Backup File
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const records = json.records || json;
        if (typeof records === 'object') {
          Object.keys(records).forEach((k) => {
            if (k) localStorage.setItem(k, typeof records[k] === 'string' ? records[k] : JSON.stringify(records[k]));
          });
          setMessage({
            text: language === 'hi' ? '✓ बैकअप फ़ाइल से सारा डेटा रिस्टोर हो गया! ऐप रीफ्रेश हो रहा है...' : '✓ Backup file imported successfully! Refreshing...',
            type: 'success'
          });
          setTimeout(() => window.location.href = '/', 1000);
        }
      } catch (err) {
        setMessage({
          text: language === 'hi' ? 'अमान्य बैकअप फ़ाइल!' : 'Invalid backup file format.',
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  // GitHub 1-Click Auto Push
  const handleGithubPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setGithubMessage(null);

    const cleanToken = githubToken.trim();
    const cleanRepo = githubRepo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');

    if (!cleanToken) {
      setGithubMessage({ text: 'कृपया GitHub Personal Access Token दर्ज करें।', type: 'error' });
      return;
    }
    if (!cleanRepo || !cleanRepo.includes('/')) {
      setGithubMessage({ text: 'कृपया सही Repository नाम दर्ज करें (उदा. username/repo-name)', type: 'error' });
      return;
    }

    setGithubLoading(true);
    localStorage.setItem('github_token', cleanToken);
    localStorage.setItem('github_repo', cleanRepo);

    try {
      const allData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allData[key] = localStorage.getItem(key);
      }

      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cleanToken,
          repo: cleanRepo,
          data: {
            app: 'onediary.in',
            pushedAt: new Date().toISOString(),
            identifier: identifier || 'user',
            records: allData
          }
        })
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'GitHub push failed');
      }

      setGithubMessage({
        text: `✓ सफलता! डेटा GitHub Repository (${cleanRepo}) में फ़ाइल "${resJson.path}" के रूप में सुरक्षित पुश हो गया है!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setGithubMessage({
        text: `त्रुटि: ${err.message || 'GitHub पर पुश नहीं हो पाया। कृपया टोकन और रिपॉजिटरी नाम चेक करें।'}`,
        type: 'error'
      });
    } finally {
      setGithubLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/more')} className="mr-3 text-gray-700 dark:text-gray-300 cursor-pointer">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">50-Year Cloud Data Vault</h1>
      </div>

      {/* 50-Year Guarantee Banner */}
      <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 text-center relative overflow-hidden shadow-xl mb-6">
        <div className="w-16 h-16 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
          <ShieldCheck size={36} />
        </div>
        
        <span className="text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full uppercase tracking-wider">
          🔒 50-Year Lifetime Guarantee
        </span>

        <h2 className="text-xl font-black text-white mt-3 mb-2">
          {language === 'hi' 
            ? '50 साल तक डेटा 100% सुरक्षित (Zero Data Loss)' 
            : '50-Year Zero Data Loss Guarantee'}
        </h2>
        
        <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">
          {language === 'hi'
            ? 'आपका डेटा कभी डिलीट या लॉस नहीं होगा। आप 50 साल बाद भी अपना Google ईमेल या मोबाइल नंबर डालकर अपना पूरा हिसाब-किताब, हाजिरी, लेबर रिकॉर्ड और कैशबुक 1-क्लिक में रिकवर कर सकते हैं!'
            : 'Your records will never be lost. Even after 50 years, simply sign in with your Google Email or Phone to instantly restore your entire attendance, wages, and cashbook records!'}
        </p>

        {/* Status Messages */}
        {message && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold mb-4 flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : message.type === 'error'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
          }`}>
            <CheckCircle size={16} className="shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="text-left mb-4">
          <label className="block text-xs font-black text-amber-300 mb-1.5 uppercase tracking-wider">
            Google Email or Mobile Number *
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. rajsahani.RgcS@gmail.com or 9876543210"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 font-bold text-sm text-white focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleBackup}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            <span>{language === 'hi' ? 'क्लाउड पर सेव करें' : 'Backup to Cloud'}</span>
          </button>

          <button
            type="button"
            onClick={handleRestore}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-black py-3.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
            <span>{language === 'hi' ? 'डेटा रिस्टोर करें' : 'Restore from Cloud'}</span>
          </button>
        </div>
      </div>

      {/* GitHub Auto-Push Vault Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center border border-slate-700">
              <Github size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">GitHub 1-Click Sync</h3>
              <p className="text-[11px] text-slate-400">Push data & records directly to GitHub</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Git API
          </span>
        </div>

        {githubMessage && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            githubMessage.type === 'success' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            <CheckCircle size={15} className="shrink-0" />
            <span className="leading-snug">{githubMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleGithubPush} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              GitHub Repository (उदा. your-username/onediary-backup):
            </label>
            <input
              type="text"
              required
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="username/my-repo-name"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Personal Access Token (PAT):
            </label>
            <input
              type="password"
              required
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              GitHub Settings → Developer Settings → Personal Access Tokens → Generate new token (repo scope required).
            </p>
          </div>

          <button
            type="submit"
            disabled={githubLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer disabled:opacity-60 shadow-md active:scale-95"
          >
            {githubLoading ? <Loader2 size={14} className="animate-spin" /> : <GitBranch size={14} className="text-blue-400" />}
            <span>{githubLoading ? 'GitHub पर पुश हो रहा है...' : 'Push Backup to GitHub'}</span>
          </button>
        </form>
      </div>

      {/* Offline 50-Year Local Backup File Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-amber-400" />
          <h3 className="text-sm font-black text-white">
            {language === 'hi' ? 'ऑफ़लाइन फ़ाइल बैकअप (Personal Backup File)' : 'Personal Offline Backup File'}
          </h3>
        </div>
        
        <p className="text-xs text-slate-400">
          {language === 'hi' 
            ? 'अपने फ़ोन या कंप्यूटर में बैकअप फ़ाइल डाउनलोड करें और कभी भी 1-क्लिक में वापस लाएं।'
            : 'Download a complete offline copy to your phone or Google Drive.'}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportJsonFile}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 cursor-pointer"
          >
            <FileDown size={15} className="text-emerald-400" />
            <span>{language === 'hi' ? 'फ़ाइल डाउनलोड करें' : 'Download File'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 cursor-pointer"
          >
            <FileUp size={15} className="text-blue-400" />
            <span>{language === 'hi' ? 'फ़ाइल से रिस्टोर' : 'Import File'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJsonFile}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
