# Frontend: Bank Soal Interaktif Training Karyawan

Hasil konsolidasi dari 8 halaman desain Google Stitch, dirapikan jadi satu situs statis
(HTML + Tailwind CDN + vanilla JS) yang siap dihubungkan ke backend Apps Script (`Code.gs`)
dan dideploy ke Vercel sebagai static site (tidak perlu Next.js/React — Vercel bisa hosting
HTML statis langsung).

## Struktur
```
login.html       — halaman login (SUDAH wired ke backend)
dashboard.html    — dashboard trainer/HRD (belum wired, lihat komentar TODO)
bank-soal.html    — kelola bank soal (belum wired)
sesi-tes.html     — buat/edit sesi tes (belum wired)
rekap.html        — rekap & perbandingan skor (belum wired)
ujian.html        — pengerjaan tes karyawan (SUDAH wired ke backend, termasuk
                     navigasi antar soal & submit — ini yang paling penting)
hasil.html        — hasil skor setelah submit (belum wired)
leaderboard.html  — leaderboard sesi (belum wired)
assets/api.js     — semua fungsi pemanggil backend Code.gs ada di sini
```

## Yang SUDAH berfungsi penuh
- **login.html**: memanggil `API.login()`, menyimpan sesi ke `localStorage`, redirect ke
  `dashboard.html` (trainer) atau `ujian.html` (karyawan).
- **ujian.html**: mengambil soal sungguhan dari `API.getSesiUntukPeserta(sesiId)`, render
  soal satu per satu (PG maupun isian singkat, sesuai tipe di data — bukan lagi mockup statis),
  simpan jawaban per soal, navigasi Sebelumnya/Selanjutnya, dan submit ke
  `API.submitJawaban()` di soal terakhir, lalu redirect ke `hasil.html`.
  Diakses lewat URL: `ujian.html?sesi=ID_SESI`

## Yang BELUM wired (masih data dummy/statis dari Stitch)
Tiap file punya komentar `<!-- TODO(belum wired): ... -->` tepat di bawah tag `<body>`
yang menjelaskan endpoint mana yang perlu dipanggil. Ringkasnya:
- `dashboard.html`, `bank-soal.html`, `sesi-tes.html`, `rekap.html` → butuh `requireLogin('trainer')`
  + data dari `API.listSesi()` / `API.listSoal()` / `API.createSesi()` / `API.rekap()`.
- `hasil.html`, `leaderboard.html` → butuh data dikirim lewat query string dari halaman
  sebelumnya, atau lewat `API.leaderboard()`.

Silakan kirim balik ke chat kalau mau lanjutkan wiring halaman-halaman ini satu per satu —
polanya sama seperti yang sudah dikerjakan di `login.html` dan `ujian.html`.

## Setup sebelum dipakai
1. Buka `assets/api.js`, ganti `APPS_SCRIPT_URL` dengan URL deployment Web App `Code.gs` kamu.
2. Buka `login.html` di browser (atau jalankan lewat local server, misal `npx serve .`)
   untuk uji coba — jangan buka lewat `file://` langsung karena beberapa browser
   membatasi `fetch()` dari file lokal.
3. Pastikan sheet `Users` di Google Sheets sudah ada minimal 1 akun trainer dan
   1 akun karyawan untuk uji coba login.

## Catatan desain
Warna, tipografi, dan komponen mengikuti design system yang di-generate Stitch
(`industrial_training_assessment_portal/DESIGN.md` di file zip aslinya) — primary merah
`#D32F2F`/`#af101a` sesuai brand Tjiwi Kimia, sesuai brief awal.
