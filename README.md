# Yubuild — Website Portofolio & Penjualan Jasa

Halaman satu-halaman untuk **mengiklankan jasa pembuatan website**: memperkenalkan
layanan, memajang 10 karya nyata beserta tangkapan layarnya, menjelaskan proses dan
harga, lalu mengarahkan pengunjung ke WhatsApp.

Gaya visualnya **kertas** — kartu bertumpuk, selotip, tepi sobek, note yang digantung
di tali — dengan palet **biru dan putih**. Ada pesawat kertas yang terbang mengikuti
gulir di bagian portofolio.

Dibuat dengan **HTML, CSS, dan JavaScript murni**. Tanpa framework, tanpa `npm install`,
tanpa proses build, tanpa pemanggilan ke server pihak ketiga (font pun di-host sendiri).

---

## Menjalankan di komputer sendiri

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Atau cukup klik dua kali `index.html`.

---

## ⚡ Yang WAJIB dicek sebelum dipublikasikan

### 1. Nomor WhatsApp

Sudah diisi `0857-7421-890`. Kalau berubah, ganti di **satu tempat**:
`assets/js/main.js`, bagian paling atas.

```js
var PENGATURAN = {
  waNumber:  '628577421890',   // format internasional, tanpa + dan tanpa spasi
  waDisplay: '0857-7421-890',  // tampilan nomor di halaman
  pesanUmum: 'Halo Yubuild, saya mau tanya soal pembuatan website.'
};
```

Seluruh tautan WhatsApp di halaman (navigasi, tombol paket, footer, tombol mengambang,
tombol di dalam popup karya) otomatis ikut. Nomor di `index.html` hanya cadangan
seandainya JavaScript tidak jalan — sebaiknya ikut diganti dengan cari-ganti
`628577421890` dan `0857-7421-890`.

### 2. Harga paket

Angka di bagian **Harga** adalah usulan awal, **bukan tarif resmi Anda**. Buka
`index.html`, cari `class="amount"`, lalu sesuaikan tiga angka berikut:

| Paket | Isi berkas saat ini |
|---|---|
| Landing page | Mulai Rp 1.500.000 · 5–7 hari kerja |
| Company profile | Mulai Rp 3.000.000 · 10–14 hari kerja |
| Aplikasi web | Mulai Rp 9.000.000 · menyesuaikan lingkup |

Estimasi waktu di bagian **Tanya jawab** memakai angka yang sama — samakan juga bila
Anda mengubahnya.

### 3. Janji yang tertulis di halaman

Halaman ini menjanjikan beberapa hal atas nama Anda. Pastikan Anda memang sanggup
memenuhinya, atau ubah kalimatnya:

- Bayar dua tahap 50% / 50%
- Garansi perbaikan **30 hari** setelah online
- Dua putaran revisi (landing page) dan tiga putaran (company profile)
- Jam balas chat **Senin–Sabtu, 08.00–21.00 WIB**
- "Biasanya dibalas di hari yang sama"
- Seluruh kode dan akun hosting/domain diserahkan atas nama klien

Cari kalimatnya di bagian **Alasan percaya**, **Papan catatan**, **Kontak**, dan **Tanya jawab**.

### 4. Domain

Ganti `https://yubuild.id/` di `index.html` (tag `canonical`, Open Graph, dan blok
`application/ld+json`) serta di `robots.txt` dan `sitemap.xml` dengan domain asli Anda.

---

## Tangkapan layar portofolio — dari mana asalnya

Semua gambar di `assets/img/karya/` **bukan mockup**. Setiap proyek benar-benar
dijalankan lalu dipotret:

| Karya | Cara pengambilan |
|---|---|
| Ayomancing, SMP Ibnu Sina, ingonentok, LP Duitku, BrainTug, Karya Logam Jaya | Situs statis dijalankan lewat server lokal, lalu dipotret pada 1440 × 900 |
| Pracaya | Dijalankan lengkap dengan database berisi data contoh, login sebagai admin/akunting, lalu dipotret |
| Rintis | Dijalankan dengan data contoh, dipotret pada mode terang, mode gelap, dan tampilan ponsel |
| Makaryo, Warkas | Halaman publik (masuk & daftar) — bagian dalamnya memerlukan akun dan basis data klien, jadi tidak dipajang |

Nama, angka, dan foto yang terlihat adalah **data contoh**; data asli klien tidak
ditampilkan. Hal ini juga dinyatakan terbuka di halaman, tepat di bawah daftar karya.

Setiap berkas punya dua versi:

- `nama.webp` — ukuran penuh, dipakai di dalam popup detail
- `nama-thumb.webp` — potongan 16:10, dipakai di kartu

---

## Isi repositori

```
index.html                 Seluruh isi halaman
assets/css/style.css       Semua gaya — bernomor per bagian (1–10)
assets/js/main.js          Semua perilaku — bernomor per bagian (0–7)
assets/img/karya/          54 tangkapan layar (WebP) dari 10 proyek
assets/img/og.png          Gambar pratinjau saat tautan dibagikan
assets/img/logo-yubuild.svg, favicon.svg
assets/fonts/              Plus Jakarta Sans + Caveat (di-host sendiri, lisensi OFL)
og-build.html              Sumber gambar Open Graph (lihat di bawah)
robots.txt, sitemap.xml, .nojekyll
```

### Isi `main.js`

| Bagian | Isinya |
|---|---|
| 0 | Pengaturan nomor WhatsApp |
| 1 | Navigasi, progres baca, penanda menu aktif |
| 2 | Animasi muncul saat masuk layar |
| 3 | Filter karya |
| 4 | Popup detail karya (galeri, tombol, jebakan fokus untuk papan ketik) |
| 5 | Papan catatan: note digantung yang bisa digeser |
| 6 | Pesawat kertas yang terbang mengikuti gulir |
| 7 | Formulir kontak → pesan WhatsApp yang sudah tersusun |

---

## Cara kerja dua animasi utamanya

**Note digantung.** Setiap note diperlakukan sebagai bandul sederhana:

```
percepatan = -(g / panjang) · sin(sudut) − redaman · kecepatan
```

Saat digeser, sudutnya mengikuti jari atau kursor; saat dilepas, note mengayun lalu
berhenti sendiri. Panjang tali tiap note sengaja dibuat berbeda supaya iramanya tidak
seragam. Menggulir cepat memberi sedikit dorongan, seperti tertiup angin. Posisi
jepitan dibaca langsung dari lengkungan tali di SVG, jadi selalu menempel di talinya
berapa pun lebar layar. Bisa juga digeser lewat tombol panah kiri/kanan di papan ketik.

**Pesawat kertas.** Pesawatnya bergerak di sepanjang lengkungan `#flightPath` memakai
`getPointAtLength()`. Kemajuan gulir menentukan posisinya, arah hidungnya dihitung dari
titik berikutnya di jalur, dan jejak putus-putusnya digambar bertahap dengan mengubah
`stroke-dasharray`.

Keduanya otomatis berhenti bila pengunjung menyalakan **"kurangi gerakan"** di
perangkatnya (`prefers-reduced-motion`).

---

## Menerbitkan

Isinya statis semua, jadi bisa di-hosting di mana saja tanpa konfigurasi:

- **GitHub Pages** — *Settings → Pages → Deploy from a branch*, pilih branch ini,
  folder `/ (root)`. Berkas `.nojekyll` sudah disertakan.
- **Netlify / Vercel / Cloudflare Pages** — hubungkan repo ini, kosongkan
  *build command* dan *output directory*.
- **Hosting biasa (cPanel)** — unggah seluruh isi folder ke `public_html`.

---

## Memperbarui gambar pratinjau (Open Graph)

`assets/img/og.png` dibuat dari `og-build.html`. Setelah mengubahnya:

```bash
python3 -m http.server 8000
# potret http://localhost:8000/og-build.html pada 1200 × 630, simpan ke assets/img/og.png
```

---

## Menambah karya baru

Salin satu blok `<article class="work-item">` di `index.html`, lalu ubah:

1. `data-kind` — `landing`, `profile`, `app`, atau `game` (menentukan filter)
2. Gambar kartu → `assets/img/karya/<nama>-thumb.webp`
3. `data-kind-label` dan `data-shots` pada `<div class="work-detail">`
   (`data-shots` berisi daftar JSON: `[{"src":"berkas.webp","alt":"keterangan"}]`)
4. Isi penjelasan di dalam `work-detail`
5. Perbarui angka pada tombol filter dan pada bagian statistik di hero

---

## Aksesibilitas & kinerja

- Seluruh gambar punya `alt`; yang dekoratif ditandai `aria-hidden`
- Popup detail bisa ditutup dengan `Esc` dan fokus papan ketik terkurung di dalamnya
- Menu, filter, dan akordeon memakai `aria-expanded` / `aria-pressed` / `<details>`
- Animasi mati otomatis pada `prefers-reduced-motion`
- Gambar memakai WebP dan `loading="lazy"`; font 27 KB + 74 KB di-host sendiri
- Tidak ada permintaan ke server pihak ketiga sama sekali — tidak ada pelacak

## Lisensi font

- **Plus Jakarta Sans** — SIL Open Font License 1.1, lihat `assets/fonts/OFL-PlusJakartaSans.txt`
- **Caveat** — SIL Open Font License 1.1 (Impallari Type)
