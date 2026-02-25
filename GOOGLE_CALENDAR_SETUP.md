# Integrasi Google Calendar API - Hari Libur Nasional

## 📋 Fitur yang Ditambahkan

Kalender sekarang terintegrasi dengan **Google Calendar API** untuk menampilkan hari libur nasional Indonesia secara otomatis:

### ✨ Tampilan di Kalender:
- 🔴 **Badge merah "Holiday"** muncul di tanggal hari libur
- 🎨 Background tanggal hari libur berwarna **merah muda** (`bg-red-50/40`)
- 🔢 Angka tanggal hari libur berwarna **merah** (`text-red-500`)
- ⭐ **Sidebar kanan** menampilkan detail hari libur dengan icon bintang

### 📊 Informasi yang Ditampilkan:
- Nama hari libur (misal: "Tahun Baru Imlek", "Hari Raya Nyepi")
- Deskripsi (jika ada)
- Label "PUBLIC HOLIDAY" di sidebar

---

## 🔧 Cara Setup Google Calendar API

### 1. Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **"Select a project"** → **"New Project"**
3. Beri nama project (misal: `Turbines Calendar`)
4. Klik **"Create"**

### 2. Aktifkan Google Calendar API

1. Di sidebar, pilih **"APIs & Services"** → **"Library"**
2. Cari **"Google Calendar API"**
3. Klik pada hasil pencarian
4. Klik tombol **"Enable"**

### 3. Buat API Key

1. Di sidebar, pilih **"APIs & Services"** → **"Credentials"**
2. Klik **"+ CREATE CREDENTIALS"** → **"API key"**
3. API key akan dibuat otomatis
4. **PENTING**: Klik **"RESTRICT KEY"** untuk keamanan

### 4. Restrict API Key (Keamanan)

Untuk keamanan, batasi penggunaan API key:

#### Application restrictions:
- Pilih **"HTTP referrers (web sites)"**
- Tambahkan referrer:
  ```
  http://localhost:3000/*
  https://yourdomain.com/*
  ```

#### API restrictions:
- Pilih **"Restrict key"**
- Centang **"Google Calendar API"** saja
- Klik **"Save"**

### 5. Copy API Key ke .env.local

1. Copy API key yang sudah dibuat
2. Buka file `.env.local` di root project
3. Replace `YOUR_GOOGLE_API_KEY_HERE` dengan API key Anda:

```bash
NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY=AIzaSyC...your-actual-key-here
```

### 6. Restart Development Server

```bash
# Stop server (Ctrl+C)
# Start ulang
npm run dev
```

---

## 🌍 Kalender Hari Libur Negara Lain

Jika ingin menampilkan hari libur negara lain, edit file:
`src/services/googleCalendarService.ts`

Ganti calendar ID di baris 13:

```typescript
// Indonesia (default)
const INDONESIA_HOLIDAY_CALENDAR_ID = 'en.indonesian%23holiday%40group.v.calendar.google.com';

// Contoh negara lain:
// Malaysia: 'en.malaysia%23holiday%40group.v.calendar.google.com'
// Singapore: 'en.singapore%23holiday%40group.v.calendar.google.com'
// USA: 'en.usa%23holiday%40group.v.calendar.google.com'
// UK: 'en.uk%23holiday%40group.v.calendar.google.com'
```

**Format umum**: `en.{country}%23holiday%40group.v.calendar.google.com`

---

## 🧪 Testing

Setelah setup selesai:

1. Buka kalender di browser: `http://localhost:3000/employee/calendar`
2. Navigate ke bulan yang ada hari liburnya (misal: Januari, Februari)
3. Hari libur akan muncul dengan badge merah
4. Klik tanggal hari libur → sidebar kanan akan menampilkan detail

### Contoh Hari Libur Indonesia 2026:
- **1 Januari**: Tahun Baru Masehi
- **29 Januari**: Tahun Baru Imlek
- **14 Februari**: Isra Mi'raj
- **28 Maret**: Hari Raya Nyepi

---

## ⚠️ Troubleshooting

### Hari libur tidak muncul?

1. **Cek console browser** (F12 → Console):
   - Jika ada error `NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY is not set` → API key belum diset
   - Jika ada error `403 Forbidden` → API key salah atau belum di-restrict dengan benar

2. **Restart dev server** setelah menambahkan API key

3. **Cek API key restrictions**:
   - Pastikan Google Calendar API sudah di-enable
   - Pastikan HTTP referrer sudah benar

### Quota limit exceeded?

Google Calendar API memiliki quota gratis:
- **1,000,000 requests/day** (sangat cukup untuk aplikasi kecil)

Jika terlampaui, bisa:
1. Upgrade ke billing account (tetap gratis untuk usage normal)
2. Implement caching di frontend (localStorage)

---

## 📝 Catatan Teknis

### Cara Kerja:
1. Setiap kali bulan berubah, `useEffect` di `CalendarPage` akan fetch hari libur
2. Data disimpan di state `holidays`
3. Holidays di-index berdasarkan tanggal untuk performa
4. Calendar grid dan sidebar menampilkan holidays yang sesuai

### Performance:
- API hanya dipanggil saat **bulan berubah** (bukan setiap render)
- Data di-cache di state selama user di bulan yang sama
- Menggunakan `useMemo` untuk indexing yang efisien

### Fallback:
- Jika API key tidak diset, kalender tetap berfungsi normal tanpa hari libur
- Jika API error, tidak akan crash — hanya log warning di console

---

## 🎨 Customization

### Mengubah warna hari libur:

Edit `SCHEDULE_TYPE_COLORS` di `src/app/employee/calendar/page.tsx`:

```typescript
const SCHEDULE_TYPE_COLORS = {
  // ...
  holiday: { 
    dot: 'bg-red-500',      // dot di legend
    border: 'border-red-500', // border card di sidebar
    bg: 'bg-red-50',        // background card di sidebar
    text: 'text-red-700'    // text color
  },
};
```

### Mengubah badge text:

Edit `BADGE_COLORS`:

```typescript
const BADGE_COLORS = {
  // ...
  Holiday: 'bg-red-100 text-red-700', // badge di calendar grid
};
```

---

## 📚 Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/v3/reference)
- [Public Holiday Calendars](https://calendar.google.com/calendar/u/0/r/settings/browsecalendars)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

---

**Selamat! Kalender Anda sekarang menampilkan hari libur nasional secara otomatis! 🎉**
