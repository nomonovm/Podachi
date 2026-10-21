import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Hash,
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  Server,
  Layers,
  Code,
  ShieldAlert,
  Terminal,
  Bug,
} from 'lucide-react';
import {
  sha256Hash,
  encryptAesGcm,
  decryptAesGcm,
  generateAesKey,
  exportKeyToBase64,
} from '../lib/crypto';
import {
  detectXss,
  sanitizeHtml,
  escapeHtml,
  detectSqlInjection,
  buildParameterizedQuery,
} from '../lib/security';
import { Badge } from '../components/ui/Badge';

export const SecurityCenter: React.FC = () => {
  // SHA-256 State
  const [hashInput, setHashInput] = useState('Podachi_Secure_Password_2026');
  const [saltInput, setSaltInput] = useState('random_salt_9843');
  const [generatedHash, setGeneratedHash] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  // AES-256-GCM State
  const [plainText, setPlainText] = useState('Chorvachilik fermasi hisob raqami: 20208000900012345678');
  const [aesKeyBase64, setAesKeyBase64] = useState('');
  const [cipherTextHex, setCipherTextHex] = useState('');
  const [ivHex, setIvHex] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [decryptError, setDecryptError] = useState<string | null>(null);

  // XSS Defense Interactive Lab State
  const [xssInput, setXssInput] = useState("<script>alert('XSS xavfi!')</script><p>Hisori zotli qo'chqor <img src=x onerror=alert('o\\'g\\'irlandi')></p>");
  const xssDetection = React.useMemo(() => detectXss(xssInput), [xssInput]);
  const sanitizedXssOutput = React.useMemo(() => sanitizeHtml(xssInput), [xssInput]);
  const escapedHtmlOutput = React.useMemo(() => escapeHtml(xssInput), [xssInput]);

  // SQL Injection Interactive Lab State
  const [sqliInput, setSqliInput] = useState("' OR '1'='1");
  const sqliDetection = React.useMemo(() => detectSqlInjection(sqliInput), [sqliInput]);
  const parameterizedSqlResult = React.useMemo(
    () => buildParameterizedQuery('SELECT * FROM animal_groups WHERE farm_id = ? AND species = ?', ['farm-101', sqliInput]),
    [sqliInput]
  );

  // Compute live SHA-256
  const handleComputeHash = async () => {
    const hash = await sha256Hash(hashInput, saltInput);
    setGeneratedHash(hash);
  };

  // Run initial hash calculation
  React.useEffect(() => {
    handleComputeHash();
  }, [hashInput, saltInput]);

  // Handle AES Encrypt
  const handleEncrypt = async () => {
    try {
      setDecryptError(null);
      const res = await encryptAesGcm(plainText, aesKeyBase64 || undefined);
      setCipherTextHex(res.cipherTextHex);
      setIvHex(res.ivHex);
      setAesKeyBase64(res.keyBase64);
      setDecryptedText('');
    } catch (e: any) {
      setDecryptError(e.message);
    }
  };

  // Handle AES Decrypt
  const handleDecrypt = async () => {
    try {
      setDecryptError(null);
      if (!cipherTextHex || !ivHex || !aesKeyBase64) {
        setDecryptError('Deshifrlash uchun shifrlangan matn, IV va maxfiy kalit kiritilishi shart.');
        return;
      }
      const plain = await decryptAesGcm(cipherTextHex, ivHex, aesKeyBase64);
      setDecryptedText(plain);
    } catch (e: any) {
      setDecryptError(e.message);
    }
  };

  // Generate new AES Key
  const handleGenerateNewKey = async () => {
    const key = await generateAesKey();
    const b64 = await exportKeyToBase64(key);
    setAesKeyBase64(b64);
    setCipherTextHex('');
    setIvHex('');
    setDecryptedText('');
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 border border-forest-600/40 text-forest-200 text-xs font-semibold mb-3">
            <KeyRound className="w-3.5 h-3.5 text-forest-300" />
            <span>Kriptografik Himoya & Tarmoq Xavfsizligi Moduli</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Axborot Xavfsizligi & Kriptografiya Markazi
          </h1>
          <p className="text-sm text-forest-200 mt-2 font-normal leading-relaxed">
            Podachi platformasida amalga oshirilgan bir tomonlama xeshlash (SHA-256), autentifikatsiyalangan simmetrik shifrlash (AES-256-GCM) va tarmoq darajasidagi himoya standartlari namoyishi.
          </p>
        </div>
      </div>

      {/* SECTION 1: ONE-WAY HASHING (SHA-256) */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-forest-300 flex items-center justify-center">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">1. Bir Tomonlama Xeshlash (SHA-256 Demo)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parollarni saqlash va ma'lumotlar yaxlitligini (integrity) tekshirish uchun ishlatiladi
              </p>
            </div>
          </div>
          <Badge variant="forest">FIPS 180-4 Standarti</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kiruvchi matn (Masalan: parol yoki muhim hujjat)
            </label>
            <input
              type="text"
              value={hashInput}
              onChange={e => setHashInput(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm font-mono bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kriptografik Tuz (Salt — Rainbow Table hujumlaridan himoya)
            </label>
            <input
              type="text"
              value={saltInput}
              onChange={e => setSaltInput(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm font-mono bg-white dark:bg-[#14231E] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>
        </div>

        {/* Hash Output */}
        <div className="p-4 bg-slate-900 dark:bg-black/60 text-slate-100 rounded-2xl border border-slate-800 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Hosil bo'lgan SHA-256 Xesh (256-bit / 64 belgi):</span>
            <button
              onClick={() => copyToClipboard(generatedHash, setCopiedHash)}
              className="flex items-center gap-1 text-forest-300 hover:text-white transition"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHash ? 'Nusxalandi' : 'Nusxa olish'}</span>
            </button>
          </div>
          <p className="font-mono text-xs sm:text-sm text-emerald-400 break-all select-all">
            {generatedHash}
          </p>
        </div>

        <div className="p-3.5 bg-forest-50/60 dark:bg-forest-950/40 rounded-xl border border-forest-200 dark:border-forest-800/40 text-xs text-forest-950 dark:text-forest-200 space-y-1">
          <p className="font-bold">Akademik xulosa:</p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Xeshlash jarayoni <strong>qaytarilmasdir</strong> — xesh qiymatidan boshlang'ich matnni matematik jihatdan tiklab bo'lmaydi. Parollar ma'lumotlar bazasida ochiq matn (plain text) ko'rinishida hech qachon saqlanmaydi, faqat kuchli xesh (bcrypt/argon2) ko'rinishida yoziladi.
          </p>
        </div>
      </div>

      {/* SECTION 2: SYMMETRIC ENCRYPTION (AES-256-GCM) */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-forest-300 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                2. Simmetrik Shifrlash & Deshifrlash (AES-256-GCM)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maxfiy ma'lumotlarni shifrlash va autentifikatsiya tegi orqali yaxlitligini ta'minlash
              </p>
            </div>
          </div>
          <Badge variant="emerald">NIST SP 800-38D</Badge>
        </div>

        {/* AES Key Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              256-bit Simmetrik Kalit (Base64)
            </label>
            <button
              onClick={handleGenerateNewKey}
              className="text-xs font-semibold text-forest-700 dark:text-forest-400 hover:text-forest-800 dark:hover:text-forest-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Yangi kalit yaratish
            </button>
          </div>
          <input
            type="text"
            placeholder="Yangi kalit yaratish tugmasini bosing yoki o'zingiz kiriting"
            value={aesKeyBase64}
            onChange={e => setAesKeyBase64(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest-600 bg-slate-50 dark:bg-[#14231E] text-slate-900 dark:text-white"
          />
        </div>

        {/* Plain text input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Shifrlanadigan ochiq matn (Plaintext)
          </label>
          <textarea
            rows={2}
            value={plainText}
            onChange={e => setPlainText(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white dark:bg-[#14231E] text-slate-900 dark:text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEncrypt}
            className="px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Lock className="w-4 h-4" />
            AES-256-GCM bilan shifrlash
          </button>
          <button
            onClick={handleDecrypt}
            disabled={!cipherTextHex}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Unlock className="w-4 h-4" />
            Deshifrlash (Tiklash)
          </button>
        </div>

        {/* Ciphertext and IV Output */}
        {cipherTextHex && (
          <div className="space-y-3 p-4 bg-slate-900 dark:bg-black/60 text-slate-100 rounded-2xl text-xs font-mono border border-slate-800 dark:border-white/10">
            <div>
              <span className="text-slate-400 block mb-1">
                Shifrlangan matn (Ciphertext Hex + GCM Auth Tag):
              </span>
              <p className="text-amber-400 break-all select-all">{cipherTextHex}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">
                Initialization Vector (IV / Nonce — 96-bit Hex):
              </span>
              <p className="text-sky-400 break-all select-all">{ivHex}</p>
            </div>
          </div>
        )}

        {/* Decrypted Output */}
        {decryptedText && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
              Muvaffaqiyatli deshifrlangan matn (GCM Autentifikatsiyasi tasdiqlandi):
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{decryptedText}</p>
          </div>
        )}

        {decryptError && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{decryptError}</span>
          </div>
        )}
      </div>

      {/* SECTION 2.5: INTERACTIVE XSS & SQL INJECTION DEFENSE LAB */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Kiberxavfsizlik Laboratoriyasi: XSS & SQL Injection Mudofaasi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                OWASP Top 10 standartlari: Kiberhujum vektorlarini jonli sinash va zararsizlantirish
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
            WAF & Sanitizatsiya Faol
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* XSS Defense Sandbox */}
          <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-[#14231E]/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">XSS (Cross-Site Scripting) Testi</h3>
              </div>
              <Badge variant={xssDetection.isMalicious ? 'rose' : 'emerald'} size="sm">
                {xssDetection.isMalicious ? 'XAVFLI SCRIPT' : 'XAVFSIZ MATN'}
              </Badge>
            </div>

            {/* Quick Test Vectors */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                Tayyor hujum namunalari (Payloads):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setXssInput("<script>alert('XSS_Hujumi!')</script>")}
                  className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-white/10 hover:bg-slate-100 border border-slate-200 dark:border-white/10 rounded-lg transition"
                >
                  &lt;script&gt;
                </button>
                <button
                  type="button"
                  onClick={() => setXssInput("<img src=x onerror=\"alert('Cookie stolen!')\" />")}
                  className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-white/10 hover:bg-slate-100 border border-slate-200 dark:border-white/10 rounded-lg transition"
                >
                  onerror=
                </button>
                <button
                  type="button"
                  onClick={() => setXssInput("<a href=\"javascript:evil()\">Xavfli Havola</a>")}
                  className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-white/10 hover:bg-slate-100 border border-slate-200 dark:border-white/10 rounded-lg transition"
                >
                  javascript:
                </button>
                <button
                  type="button"
                  onClick={() => setXssInput("Hisori zotli qo'chqor, yoshi 2 da, vazni 85 kg.")}
                  className="px-2.5 py-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 rounded-lg transition"
                >
                  Toza matn
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Kiritilayotgan satr (Kirish maydoni):
              </label>
              <textarea
                rows={3}
                value={xssInput}
                onChange={e => setXssInput(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#0E1A16] border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-forest-600 transition"
                placeholder="XSS kodini kiriting..."
              />
            </div>

            {/* Live Detection Alert */}
            {xssDetection.isMalicious ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>XSS xavfi aniqlandi!</span>
                </div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {xssDetection.detectedThreats.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zararli skript teglari topilmadi. Matn xavfsiz.</span>
              </div>
            )}

            {/* Sanitized Clean Output */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Sanitizatsiya qilingan (Zararsizlantirilgan) toza natija:
              </span>
              <div className="p-2.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono min-h-[40px] break-all border border-slate-800">
                {sanitizedXssOutput ? sanitizedXssOutput : <span className="text-slate-500 italic">(Bo'sh — barcha zararli kod tozalandi)</span>}
              </div>
            </div>

            {/* Escaped HTML */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Xavfsiz HTML Entity (Escaped Code):
              </span>
              <div className="p-2.5 bg-slate-100 dark:bg-black/40 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-mono break-all border border-slate-200 dark:border-white/5">
                {escapedHtmlOutput}
              </div>
            </div>
          </div>

          {/* SQL Injection Defense Sandbox */}
          <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-[#14231E]/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">SQL Injection (SQLi) Testi</h3>
              </div>
              <Badge variant={sqliDetection.isMalicious ? 'rose' : 'emerald'} size="sm">
                {sqliDetection.isMalicious ? 'SQL INJECTION' : 'PARAMETRLI XAVFSIZ'}
              </Badge>
            </div>

            {/* Quick Test Vectors */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                Tayyor SQLi namunalari (Payloads):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSqliInput("' OR '1'='1")}
                  className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-white/10 hover:bg-slate-100 border border-slate-200 dark:border-white/10 rounded-lg transition"
                >
                  ' OR '1'='1
                </button>
                <button
                  type="button"
                  onClick={() => setSqliInput("1; DROP TABLE users; --")}
                  className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-white/10 hover:bg-slate-100 border border-slate-200 dark:border-white/10 rounded-lg transition"
                >
                  ; DROP TABLE
                </button>
                <button
                  type="button"
                  onClick={() => setSqliInput("admin' UNION SELECT id, email, password FROM users --")}
                  className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-white/10 hover:bg-slate-100 border border-slate-200 dark:border-white/10 rounded-lg transition"
                >
                  UNION SELECT
                </button>
                <button
                  type="button"
                  onClick={() => setSqliInput("Qo'y")}
                  className="px-2.5 py-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 rounded-lg transition"
                >
                  Toza parametr
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Kiritilayotgan parametr (Masalan, qidiruv satri):
              </label>
              <textarea
                rows={3}
                value={sqliInput}
                onChange={e => setSqliInput(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#0E1A16] border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-forest-600 transition"
                placeholder="SQLi payload kiriting..."
              />
            </div>

            {/* Live Detection Alert */}
            {sqliDetection.isMalicious ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>SQL Injection xavfi aniqlandi!</span>
                </div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {sqliDetection.detectedPatterns.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>SQL sintaksisi buzuvchi xavfli belgilar topilmadi.</span>
              </div>
            )}

            {/* Parameterized Query Output */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                PostgreSQL Parametrlashtirilgan So'rov (Prepared Statement):
              </span>
              <div className="p-2.5 bg-slate-900 text-amber-300 rounded-xl text-xs font-mono break-all border border-slate-800">
                {parameterizedSqlResult.parameterizedSql}
              </div>
            </div>

            {/* Bound Parameters Display */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Bog'langan Parametrlar (Bound Values):
              </span>
              <div className="p-2.5 bg-slate-100 dark:bg-black/40 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-mono break-all border border-slate-200 dark:border-white/5 space-y-0.5">
                <p><span className="text-forest-700 dark:text-forest-400 font-bold">$1:</span> 'farm-101'</p>
                <p><span className="text-forest-700 dark:text-forest-400 font-bold">$2:</span> '{sqliInput}' <span className="text-slate-500 italic">(Oddiy satr sifatida uzatildi, SQL buyrug'i sifatida bajarilmaydi)</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Defense Mechanisms Information */}
        <div className="p-4 rounded-2xl bg-forest-50/60 dark:bg-forest-950/30 border border-forest-200 dark:border-forest-800/40 space-y-2">
          <h4 className="text-xs font-bold text-forest-900 dark:text-forest-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest-700 dark:text-forest-400" />
            Podachi Platformasining 4 Bosqichli Kiberhimoya Zanjiri:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">1. Kiruvchi Ma'lumot Sanitizatsiyasi:</strong>
              Har bir maydon (matn, tavsif, zot, ism) `sanitizeHtml` va qat'iy regex filtrlari orqali xavfli teglardan tozalanadi.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">2. Parameterized Queries (SQLi Himoyasi):</strong>
              Dinamik SQL string ulash taqiqlangan. Barcha so'rovlar PostgreSQL `$1, $2` prepared statementlari orqali yuboriladi.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">3. Kiberxavfsizlik Sarlavhalari (CSP & HTTP):</strong>
              `Content-Security-Policy`, `X-XSS-Protection: 1; mode=block` va `X-Content-Type-Options: nosniff` brauzerda inline hujumlarni bloklaydi.
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-0.5">4. Audit Log Kiberxabarnomasi:</strong>
              Har qanday XSS yoki SQLi urinishi avtomatik ravishda `SECURITY_XSS_DETECTED` / `SECURITY_SQLI_DETECTED` sifatida audit jurnaliga yoziladi.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: THEORETICAL COMPARISON (HASH VS ENCRYPTION) */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-forest-700 dark:text-forest-400" />
          Kriptografik Taqqoslash: Xeshlash va Shifrlash Farqlari
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Kriptografik usullarning taqqoslama tahlil jadvali
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 dark:bg-[#14231E] border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Xususiyat</th>
                <th className="py-3 px-4">Xeshlash (Hashing)</th>
                <th className="py-3 px-4">Simmetrik Shifrlash (Encryption)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Asosiy maqsad</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">Yaxlitlik (Integrity) va bir tomonlama autentifikatsiya</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">Maxfiylik (Confidentiality) va xavfsiz uzatish</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Qaytariluvchanlik</td>
                <td className="py-3 px-4 text-rose-700 dark:text-rose-400 font-semibold">Qaytarilmas (Bir tomonlama)</td>
                <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-semibold">Qaytariluvchan (Kalit yordamida)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Chiqish hajmi</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">Qat'iy belgilangan hajm (SHA-256 = 256 bit)</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">Matn hajmiga mutanosib bloklar</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Podachi tizimidagi qo'llanilishi</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">Foydalanuvchi parollari va audit xeshlari</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">Bank rekvizitlari va maxfiy shartnoma matnlari</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: NETWORK & ARCHITECTURE SECURITY */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-forest-700 dark:text-forest-400" />
          Tarmoq va Dasturiy Xavfsizlik Arxitekturasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#14231E]/60 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white">HTTPS / TLS 1.3</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Klient va server o'rtasidagi barcha aloqa zamonaviy shifrlangan TLS kanali orqali amalga oshiriladi, bu esa "Man-in-the-Middle" (MitM) paket tutib olish xavfini butunlay bartaraf etadi.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#14231E]/60 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white">Xavfsiz HTTP Headerlari & CORS</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              X-Content-Type-Options: nosniff, Strict-Transport-Security (HSTS) va qat'iy Content Security Policy (CSP) sozlamalari orqali XSS va Clickjacking hujumlari oldi olinadi.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#14231E]/60 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white">Secret Management & Env Variables</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Supabase Service Role kaliti, ma'lumotlar bazasi parollari va shifrlash kalitlari hech qachon brauzer bundle ichiga yoki git repozitoriysiga kiritilmaydi.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#14231E]/60 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white">Server-Side Input Sanitization</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Barcha kiruvchi ma'lumotlar frontendda ham, server funksiyalarida ham tiplarga keltiriladi va SQL Injection / XSS inyeksiyalaridan tozalab o'tkaziladi.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
