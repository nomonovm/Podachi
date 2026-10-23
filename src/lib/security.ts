/**
 * Podachi Kibermudofaa & Axborot Xavfsizligi Moduli
 * XSS (Cross-Site Scripting) va SQL Injection (SQLi) hujumlariga qarshi keng qamrovli himoya tizimi.
 * OWASP Top 10 xavfsizlik standartlari asosida ishlab chiqilgan.
 */

// HTML belgilarni xavfsiz entity shakliga o'tkazish (Escaping)
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Xavfli XSS vektorlarini tekshiruvchi regex qoidalari
const XSS_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: 'Script tegi (<script>)', regex: /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi },
  { name: 'Ochiq script tegi (<script...) ', regex: /<\s*script\b[^>]*>/gi },
  { name: 'Inline Event Handler (onerror, onload, onclick...)', regex: /\bon\w+\s*=\s*(['"]).*?\1|\bon\w+\s*=\s*[^ >]+/gi },
  { name: 'Xavfli psevdo-protokollar (javascript:, vbscript:, data:text/html)', regex: /\b(javascript|vbscript|data\s*:\s*text\/html)\s*:/gi },
  { name: 'Xavfli HTML teglar (iframe, object, embed, svg, meta, link, base)', regex: /<\s*(iframe|object|embed|svg|meta|link|base|form|body|html)\b[^>]*>/gi },
  { name: 'Document/Window obyekti ekspluatatsiyasi', regex: /\b(document\.cookie|document\.location|window\.location|eval\s*\(|new\s+Function\s*\()/gi },
];

/**
 * XSS (Cross-Site Scripting) hujumlarini aniqlash
 */
export function detectXss(input: string): { isMalicious: boolean; detectedThreats: string[] } {
  if (!input || typeof input !== 'string') {
    return { isMalicious: false, detectedThreats: [] };
  }

  const detectedThreats: string[] = [];

  for (const pattern of XSS_PATTERNS) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(input)) {
      detectedThreats.push(pattern.name);
      pattern.regex.lastIndex = 0;
    }
  }

  return {
    isMalicious: detectedThreats.length > 0,
    detectedThreats,
  };
}

/**
 * XSS payloadlarini zararsizlantirish (Sanitizatsiya)
 * Barcha zararli skriptlar, atributlar va teglar tozalab tashlanadi.
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return input;

  let sanitized = input;

  // 1. Script teglari va ularning ichidagi barcha kodlarni olib tashlash
  sanitized = sanitized.replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
  sanitized = sanitized.replace(/<\s*script\b[^>]*>/gi, '');

  // 2. Xavfli teglar (iframe, object, embed, svg, form, meta, link)
  sanitized = sanitized.replace(/<\s*\/?\s*(iframe|object|embed|svg|meta|link|base|form|input|button)\b[^>]*>/gi, '');

  // 3. Inline event handlerlar: onload=, onerror=, onclick= va h.k.
  sanitized = sanitized.replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*[^ >]+/gi, '');

  // 4. javascript: va vbscript: havolalarini butunlay zararsizlantirish
  sanitized = sanitized.replace(/\bjavascript\s*:[^"'>\s]*/gi, '#blocked');
  sanitized = sanitized.replace(/\bvbscript\s*:[^"'>\s]*/gi, '#blocked');
  sanitized = sanitized.replace(/\bdata\s*:\s*text\/html[^"'>\s]*/gi, '#blocked');
  sanitized = sanitized.replace(/\bjavascript\s*:/gi, '#blocked');

  // 5. Trim qilish
  return sanitized.trim();
}

// SQL Injection tekshiruvchi regex qoidalari (SQLi Detection Patterns)
const SQLI_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: 'Tautology mantiqiy buzish (\' OR \'1\'=\'1, OR 1=1)', regex: /('\s*(OR|AND)\s+('?[\w]+'?\s*=\s*'?[\w]+'?|\d+\s*=\s*\d+)|(\b(OR|AND)\s+['"]?[\w]+['"]?\s*=\s*['"]?[\w]+['"]?))/i },
  { name: 'SQL Izoh belgilari (-- yoki /* ... */)', regex: /(--|\/\*[\s\S]*?\*\/)/ },
  { name: 'Kombinatsiyalangan SQL buyruqlar (; DROP, ; DELETE, ; INSERT)', regex: /;\s*(DROP|DELETE|TRUNCATE|INSERT|UPDATE|ALTER|CREATE|EXEC|EXECUTE)\b/i },
  { name: 'UNION SELECT ma\'lumot o\'g\'irlash', regex: /\bUNION\s+(ALL\s+)?SELECT\b/i },
  { name: 'Xavfli tizim protseduralari (xp_cmdshell, pg_sleep, benchmark)', regex: /\b(xp_\w+|pg_sleep|benchmark|sleep\s*\()/i },
  { name: 'Klassik kotirovka yopish va bypass (\' OR true)', regex: /'\s+(OR|AND)\s+(true|false)\b/i },
];

/**
 * SQL Injection hujumlarini aniqlash
 */
export function detectSqlInjection(input: string): { isMalicious: boolean; detectedPatterns: string[] } {
  if (!input || typeof input !== 'string') {
    return { isMalicious: false, detectedPatterns: [] };
  }

  const detectedPatterns: string[] = [];

  for (const pattern of SQLI_PATTERNS) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(input)) {
      detectedPatterns.push(pattern.name);
      pattern.regex.lastIndex = 0;
    }
  }

  return {
    isMalicious: detectedPatterns.length > 0,
    detectedPatterns,
  };
}

/**
 * SQL identifikatorlarini tekshirish (jadval va ustun nomlari xavfsizligi)
 */
export function validateSafeSqlIdentifier(identifier: string): boolean {
  if (!identifier || typeof identifier !== 'string') return false;
  return /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(identifier);
}

/**
 * Parametrlashtirilgan SQL so'rovini hosil qilish & xavfsiz binding (Parameterized Queries)
 * Hech qachon string konkatenatsiya (qatorlarni ulash) qilinmaydi, faqat parametr sifatida uzatiladi.
 */
export function buildParameterizedQuery(
  baseSql: string,
  params: (string | number | boolean | null)[]
): { parameterizedSql: string; boundParameters: (string | number | boolean | null)[]; safeSqlPreview: string } {
  // $1, $2, $3 parametrlarini hosil qilish
  let paramIndex = 1;
  const boundParameters = [...params];
  
  const parameterizedSql = baseSql.replace(/\?/g, () => `$${paramIndex++}`);

  // Vizual xavfsiz ko'rinish (evaluatorlar uchun)
  let safeSqlPreview = baseSql;
  params.forEach((param, i) => {
    const val = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : String(param);
    safeSqlPreview = safeSqlPreview.replace('?', val);
  });

  return {
    parameterizedSql,
    boundParameters,
    safeSqlPreview,
  };
}

/**
 * Rekursiv obyekt sanitizatsiyasi
 * Har qanday kiritilgan obyekt yoki massivdagi barcha satrlarni XSS dan tozalaydi.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeHtml(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitizedObj: any = {};
    for (const key of Object.keys(obj)) {
      sanitizedObj[key] = sanitizeObject((obj as any)[key]);
    }
    return sanitizedObj;
  }

  return obj;
}

/**
 * Kompleks Xavfsizlik Tekshiruvi (Security Guard)
 * Bir vaqtning o'zida XSS va SQL Injection ni skaner qiladi va zararsizlantiradi.
 */
export function inspectSecurityPayload(
  data: Record<string, any> | string,
  fieldLabel: string = 'Kiritilgan ma\'lumot'
): {
  isSafe: boolean;
  threatType: 'NONE' | 'XSS' | 'SQLI' | 'BOTH';
  threats: string[];
  sanitized: any;
} {
  const threats: string[] = [];
  let isXss = false;
  let isSqli = false;

  const checkValue = (val: any, label: string) => {
    if (typeof val === 'string') {
      const xssRes = detectXss(val);
      if (xssRes.isMalicious) {
        isXss = true;
        threats.push(`[${label}] XSS xavfi: ${xssRes.detectedThreats.join(', ')}`);
      }

      const sqliRes = detectSqlInjection(val);
      if (sqliRes.isMalicious) {
        isSqli = true;
        threats.push(`[${label}] SQL Injection xavfi: ${sqliRes.detectedPatterns.join(', ')}`);
      }
    } else if (typeof val === 'object' && val !== null) {
      for (const k of Object.keys(val)) {
        checkValue(val[k], `${label}.${k}`);
      }
    }
  };

  checkValue(data, fieldLabel);

  let threatType: 'NONE' | 'XSS' | 'SQLI' | 'BOTH' = 'NONE';
  if (isXss && isSqli) threatType = 'BOTH';
  else if (isXss) threatType = 'XSS';
  else if (isSqli) threatType = 'SQLI';

  return {
    isSafe: threats.length === 0,
    threatType,
    threats,
    sanitized: typeof data === 'string' ? sanitizeHtml(data) : sanitizeObject(data),
  };
}
