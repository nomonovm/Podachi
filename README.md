# 🌾 PODACHI — Zamonaviy Chorvachilik Boshqaruv & Raqamli Bozor Platformasi

> **Universitet yakuniy startup loyihasi** uchun ishlab chiqilgan to‘liq funksional, xavfsiz va yuqori unumdorlikka ega web-platforma.
> 
> **Yo‘nalishlar:** Farm Management & Analytics, B2B/P2P Livestock Marketplace, Cybersecurity & Cryptography Architecture.

---

## 📌 1. Loyiha Haqida

**Podachi** — O‘zbekiston chorvachilik xo‘jaliklari uchun maxsus ishlab chiqilgan, zamonaviy axborot texnologiyalari va kiberxavfsizlik tamoyillarini o‘zida mujassam etgan boshqaruv ekotizimi. 

Platforma uchta asosiy ustunni birlashtiradi:
1. **Ferma boshqaruvi va tahliliy statistika:** Hayvonlar guruhi hisobi, harakatlar jurnali (kirim/chiqim/tug‘ilish), ozuqa zaxiralari, veterinariya profilaktikasi va real moliyaviy hisob-kitoblar.
2. **Chorva bozori (Marketplace):** Fermalar o‘rtasida zotdor chorva sotuv e’lonlari, sotib olish so‘rovlari, takliflar hamda mavjud chorva sonidan ortiq miqdorni sotuvga chiqarishni taqiqlovchi atomar bandlik nazorati.
3. **Kiberxavfsizlik va Kriptografiya:** RBAC (Role-Based Access Control) ruxsatlar modeli, bir tomonlama xeshlash (SHA-256), autentifikatsiyalangan simmetrik shifrlash (AES-256-GCM), tamper-evident audit jurnali va avtomatlashtirilgan xavfsizlik testlari.

---

## 🎨 2. Original Vizual Identifikatsiya & Dizayn Tizimi

- **Ranglar palitrasi:** Chuqur o‘rmon-yashil (`#1F523F`, `#0C201B`), toza iliq oq (`#FAFAF7`), grafit (`#0F172A`, `#1E293B`) va och yashil / yumshoq sariq aksentlar.
- **Brend belgisi:** Qadimgi chorvachilik ramzi (qo‘chqor shoxi) va zamonaviy raqamli o‘sish tugunlari uyg‘unlashgan original SVG logo.
- **Tipografika:** O‘zbek tilidagi lotin yozuviga to‘liq moslashtirilgan professional *Inter* va *Plus Jakarta Sans* shriftlari.
- **Interaktivlik:** Recharts yordamida interaktiv tahliliy grafiklar, silliq modal oynalar, toast bildirishnomalari va har bir operatsiyadan keyingi tasdiqlar.

---

## 🔐 3. Axborot Xavfsizligi & RBAC (Ruxsatlar Nazorati)

Universitetdagi **"Foydalanishlarni boshqarish"** va **"Kriptografiya usullari"** fanlari talablariga mos ravishda qat'iy xavfsizlik arxitekturasi joriy etilgan:

### 3.1. RBAC Rollar Matritsasi
| Modul / Huquq | Administrator | Menejer | Veterinar | Kuzatuvchi (Viewer) |
| :--- | :---: | :---: | :---: | :---: |
| **Ferma sozlamalari va a'zolar** | ✅ To‘liq boshqaruv | ❌ Taqiqlangan | ❌ Taqiqlangan | ❌ Taqiqlangan |
| **A'zolik so'rovlarini ko'rib chiqish** | ✅ Qabul/Rad | ❌ Taqiqlangan | ❌ Taqiqlangan | ❌ Taqiqlangan |
| **Chorva guruhlari va harakatlar** | ✅ Kirim/Chiqim | ✅ Kirim/Chiqim | 👁️ Faqat o‘qish | 👁️ Faqat o‘qish |
| **Veterinariya va sog'liq qaydlari** | ✅ Boshqarish | ✅ Boshqarish | ✅ To‘liq boshqaruv | 👁️ Faqat o‘qish |
| **Yem-xashak ombori va sarfi** | ✅ Boshqarish | ✅ Boshqarish | ❌ Taqiqlangan | 👁️ Faqat o‘qish |
| **Moliya (Daromad & Xarajatlar)** | ✅ To‘liq ko‘rish/tahrir | ✅ To‘liq ko‘rish/tahrir | ⛔ Ruxsat yo‘q | ⛔ Ruxsat yo‘q |
| **Bozorga e'lon berish & sotuv** | ✅ Boshqarish | ✅ Boshqarish | ❌ Taqiqlangan | 👁️ Faqat o‘qish |
| **Xavfsizlik Audit Jurnali** | ✅ To‘liq o‘qish | ❌ Taqiqlangan | ❌ Taqiqlangan | ❌ Taqiqlangan |

> **Muhim:** Ruxsatlar shunchaki tugmalarni yashirish orqali emas, balki server / PostgreSQL RLS siyosatlari hamda backend logikasida qat'iy tekshiriladi. Kuzatuvchi yoki veterinar ruxsatsiz amalga urinsa, tizim rad etadi va hodisani audit jurnaliga yozadi.

---

## ⚡ 4. Amaliy Kriptografiya Moduli (Web Crypto API)

Xavfsizlik markazida talabalar va o‘qituvchilar uchun jonli kriptografik laboratoriya yaratilgan:
1. **SHA-256 One-Way Hash (FIPS 180-4):**
   - Parollarni ma'lumotlar bazasida ochiq saqlamaslik tamoyili.
   - Salt (kriptografik tuz) yordamida Rainbow Table hujumlaridan himoyalanish.
2. **AES-256-GCM Simmetrik Shifrlash (NIST SP 800-38D):**
   - 256-bitli maxfiy kalit generatsiyasi.
   - Har bir shifrlash uchun yangi 96-bitli IV (Nonce).
   - GCM autentifikatsiya tegi orqali ma'lumotning o‘zgartirilmaganligini (Integrity) kafolatlash.
3. **Xeshlash va Shifrlash farqlari:**
   - Qaytarilmaslik va qaytariluvchanlik bo‘yicha nazariy va amaliy taqqoslash jadvali.

---

## 📊 5. Asosiy Funksional Modullar

### 5.1. Chorva Hisobi (Guruhlar Bo'yicha)
- Individual raqamlar o‘rniga zamonaviy guruhli hisob: masalan, *250 bosh Hisori qo‘y*, *80 bosh Qora-ola qoramol*.
- Hisob-kitob formulasi:  
  $$\text{Joriy Son} = \text{Boshlang‘ich Son} + \sum \text{Kirimlar} - \sum \text{Chiqimlar}$$
- **Erkin qoldiq balansi:**  
  $$\text{Erkin Qoldiq} = \text{Joriy Bosh Soni} - \sum \text{Bozordagi Faol Bandlik}$$
- Manfiy qoldiqqa tushib qolish yoki erkin qoldiqdan ortiq miqdorni bozorda band qilishning qat'iy oldi olingan.

### 5.2. Hayvonlar Katalogi
- Tayyor turlar: Qo‘y, Echki, Qoramol, Ot, Tuya, Eshak, Tovuq, O‘rdak, G‘oz, Kurka, Quyon.
- Administrator va menejerlar yangi zotlarni katalogga kiritishi mumkin.

### 5.3. Yem-Xashak Boshqaruvi
- Xashak, don yemi, silos, kombikorm va vitaminlar ombori.
- Kirim va chiqim operatsiyalari, minimal zaxira ogohlantirishlari (kritik kam qolgan ozuqalar boshqaruv panelida sariq belgi bilan aks etadi).

### 5.4. Moliya va Hisob-Kitob
- Xarajatlar (yem, veterinar, dori, ish haqi, transport, kommunal) va daromadlar (chorva sotuvi, sut mahsulotlari).
- Moliyaviy natija hisobi (Operatsion balans).
- Barcha ma'lumotlarni CSV formatida yuklab olish.
- Sotuv yakunlanganda bitta sotuv uchun **faqat bir marta** daromad yozuvi yaratiladi.

### 5.5. Bozor (Marketplace)
- Sotuv e'lonlari va sotib olish so'rovlari.
- Fermalararo maxfiylik: boshqa fermalarning ichki hisob-kitoblari, umumiy chorva soni va moliyasi begonalarga ko‘rsatilmaydi.
- Qisman sotuv (Partial Sale) imkoniyati: masalan, 100 bosh band qilingan e'londan 40 bosh sotilganda, qolgan 60 bosh e'londa faol qoladi, umumiy ferma qoldig‘i 40 taga kamayadi.
- E'lon yopilganda qolgan band qilingan chorva zudlik bilan erkin qoldiqqa qaytariladi.

---

## 🧪 6. Qabul Testlari & Natijalar (Test A — Test I)

Ilovaning **"Xavfsizlik Testlari"** sahifasida texnik topshiriqda belgilangan barcha qabul testlari avtomatlashtirilgan tarzda bajariladi:

| Test Kodi | Nomi | Kutilgan Natija | Holat |
| :--- | :--- | :--- | :---: |
| **TEST-A** | Ferma Nomi Validatsiyasi | "Baraka Ferma" probel sababli rad etiladi; "BarakaFerma" qabul qilinadi; "barakaferma" takroriylik sababli rad etiladi | **PASS** ✅ |
| **TEST-B** | Fermaga Qo‘shilish So‘rovi | So‘rov "pending" saqlanadi, foydalanuvchi ma'lumotlarga kira olmaydi, admin qabul qilgach rol beriladi | **PASS** ✅ |
| **TEST-C** | Chorva Hisobi & Erkin Qoldiq | 250 boshdan 100 bosh band qilinsa -> Jami: 250, Band: 100, Erkin: 150 | **PASS** ✅ |
| **TEST-D** | Ortiqcha Bandlikni To‘sish | Erkin 150 bosh bo‘lganda 151 bosh band qilishga urinish rad etiladi | **PASS** ✅ |
| **TEST-E** | Qisman Sotuv (Partial Sale) | 100 bosh band e'londan 40 bosh sotilsa -> Jami: 210, Band: 60, Erkin: 150. Bitta daromad yoziladi | **PASS** ✅ |
| **TEST-F** | E'lonni Yopish & Bo‘shatish | 60 bosh band qolgan e'lon yopilganda -> Jami: 210, Band: 0, Erkin: 210 | **PASS** ✅ |
| **TEST-G** | Fermalararo Maxfiylik | Boshqa ferma ma'lumotlarini so‘rash RLS darajasida 403 Forbidden bilan rad etiladi | **PASS** ✅ |
| **TEST-H** | Rol Nazorati (RBAC) | Kuzatuvchi (Viewer) ma'lumot o‘zgartirishga uringanda server amalni rad etadi | **PASS** ✅ |
| **TEST-I** | Yagona Daromad Integriteti | Bitta sotuv uchun takroriy daromad yozilishi unique constraint bilan cheklanadi | **PASS** ✅ |

---

## 🛠️ 7. Texnologiyalar & Arxitektura

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend / Database:** 
  - PostgreSQL 15+ & Supabase: 17 ta normallashtirilgan jadval, `CHECK` cheklovlari, `UNIQUE (LOWER(name))` indekslari, `plpgsql` atomar saqlanadigan funksiyalari va Row-Level Security (RLS) siyosatlari.
  - SQL fayl manzili: `supabase/migrations/20261014_init_podachi_schema.sql`
- **Kriptografiya:** Web Crypto API (SHA-256, AES-256-GCM).
- **Dual-Mode Architecture:** Supabase kalitlari mavjud bo‘lmagan taqdirda ham ilova to‘liq xotira va `localStorage` bazasida xuddi serverdek ishlaydi va taqdimot paytida internet uzilsa ham to‘xtovsiz ishlaydi.

---

## 🚀 8. Ishga Tushirish Yo‘riqnomasi

### Talablar:
- Node.js (v18 yoki undan yuqori)
- npm yoki yarn

### O‘rnatish va ishga tushirish:

```bash
# 1. Loyiha papkasiga kiring (agar hali kirmagan bo'lsangiz)
cd PODACHI

# 2. Bog'liqliklarni o'rnating
npm install

# 3. Dasturni ishlab chiqish (Development) rejimida ishga tushiring
npm run dev

# 4. Brauzerda oching:
# http://localhost:5173
```

### Production Build tekshiruvi:
```bash
npm run build
npm run preview
```

---

## 📂 9. Loyiha Fayl Tuzilmasi

```text
PODACHI/
├── public/
│   ├── logo.svg                       # Original Podachi logotipi
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx             # Ferma va rol almashtirgichli header
│   │   │   └── Sidebar.tsx            # Modulli navigatsiya paneli
│   │   └── ui/
│   │       ├── Badge.tsx              # Status indikatorlari
│   │       ├── Modal.tsx              # Dialog oynalari
│   │       ├── StatCard.tsx           # Dashboard kartalari
│   │       └── Toast.tsx              # Bildirishnomalar konteyneri
│   ├── context/
│   │   └── AppContext.tsx             # Global reaktiv holat va RBAC konteksti
│   ├── lib/
│   │   ├── backendEngine.ts           # Xavfsiz simulyatsiya va biznes mantiq
│   │   ├── crypto.ts                  # SHA-256 va AES-256-GCM algoritmlari
│   │   ├── initialData.ts             # O'zbekiston chorvachiligiga oid demo ma'lumotlar
│   │   └── supabase.ts                # Supabase integratsiya moduli
│   ├── pages/
│   │   ├── Dashboard.tsx              # Asosiy tahliliy panel va grafiklar
│   │   ├── Livestock.tsx              # Chorva hisobi va erkin qoldiq
│   │   ├── AnimalCatalog.tsx          # Zotlar katalogi
│   │   ├── MovementsHistory.tsx       # Chorva harakati auditi
│   │   ├── Veterinary.tsx             # Sog'liq va emlashlar
│   │   ├── FeedManagement.tsx         # Yem-xashak zaxirasi
│   │   ├── Finance.tsx                # Moliya, balans va CSV eksport
│   │   ├── Marketplace.tsx            # Bozor e'lonlari va so'rovlar
│   │   ├── MyListings.tsx             # Sotuvni yakunlash va bandlikni bo'shatish
│   │   ├── UserManagement.tsx         # A'zolar va RBAC boshqaruvi
│   │   ├── SecurityCenter.tsx         # Kriptografiya va tarmoq xavfsizligi
│   │   ├── AuditLogs.tsx              # Audit jurnali
│   │   ├── SecurityTesting.tsx        # Qabul testlari (Test A-I)
│   │   ├── FarmSettings.tsx           # Sozlamalar va JSON backup
│   │   ├── FarmCreate.tsx             # Yangi ferma yaratish
│   │   └── FarmJoin.tsx               # Fermaga qo'shilish
│   ├── types/
│   │   └── index.ts                   # To'liq TypeScript interfeyslari
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── supabase/
│   └── migrations/
│       └── 20261014_init_podachi_schema.sql # PostgreSQL 19+ jadvallar, RLS va triggerlar
├── .env.example                       # Muhit konfiguratsiya shabloni
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🔒 10. Maxfiylik va ZIP Arxiv Eslatmasi

Texnik topshiriqning 19-bandiga muvofiq:
- Hech qanday maxfiy API kalitlari yoki parollar repozitoriyga yozilmagan.
- Loyiha to‘liq tayyor holatga keltirilgan bo‘lib, **foydalanuvchining alohida buyrug‘i berilmaguncha avtomatik ZIP arxiv yaratilmaydi**.
- Buyruq berilganda loyiha `node_modules` va vaqtinchalik kesh fayllarisiz toza holda ZIP arxivlanadi.
