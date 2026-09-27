# Nusantara 12 — Museum Game Tradisional

12 game tradisional Indonesia, dimainkan penuh (bukan demo), dalam satu website. Dipecah jadi
file-file terpisah supaya lebih ringan di-load & mudah di-maintain per game.

## Struktur folder

```
nusantara12/
├── index.html          <- halaman utama, load semua script berurutan
├── manifest.json        <- PWA manifest (bisa "Add to Home Screen")
├── sw.js                 <- service worker, cache-first untuk main offline
├── css/
│   └── style.css         <- palette kayu/kertas, safe-area, responsive base
└── js/
    ├── InputManager.js    <- input terpadu: keyboard + zona sentuh ternormalisasi
    ├── palette.js          <- konstanta warna PAL + helper paperBG() & woodButton()
    ├── main.js              <- konfigurasi & boot Phaser.Game
    └── scenes/
        ├── Boot.js          <- BootScene + daftar 12 game + HubScene (desa)
        ├── Congklak.js
        ├── LompatTali.js
        ├── Engklek.js
        ├── Egrang.js
        ├── Kelereng.js
        ├── GobakSodor.js
        ├── Layangan.js
        ├── SuitMonopoli.js
        ├── Bentengan.js
        ├── PetakUmpet.js
        ├── BalapKarung.js
        └── Bakiak.js
```

## Cara deploy

Ini situs statis murni (HTML + JS biasa via `<script>` tag, TANPA build step/bundler),
jadi tinggal upload folder ini ke hosting statis mana pun:

- **Netlify / Vercel**: drag-and-drop folder ini ke dashboard, atau `netlify deploy` /
  `vercel deploy` dari dalam folder.
- **GitHub Pages**: push folder ini ke repo, aktifkan Pages dari branch/folder tsb.
- **Hosting biasa (cPanel dll)**: upload semua isi folder ke `public_html/` (atau subfolder).

Tidak perlu `npm install`, tidak perlu Node — buka `index.html` lewat web server statis
apa pun sudah langsung jalan.

⚠️ **Penting**: karena pakai `<script src="...">` biasa (bukan ES module), file ini
juga bisa langsung dibuka dari `file://` di browser tanpa server — tapi service worker
(`sw.js`) untuk mode offline PWA hanya aktif kalau diakses lewat `http://` atau `https://`
(termasuk `localhost`). Untuk uji coba lokal dengan server:

```bash
# opsi simpel pakai Python
python3 -m http.server 8080
# lalu buka http://localhost:8080
```

## Status game (12/12 sudah playable)

Congklak (AI minimax), Lompat Tali (rhythm + mode 2 orang), Engklek (5 peta),
Egrang (balance + opsi gyro), Kelereng (flick shooter), Gobak Sodor (dodge penjaga),
Layangan Adu (tarik-ulur benang), Suwit Jawa + Monopoli Kampung, Bentengan (capture/tawanan),
Petak Umpet (cari 60 detik), Balap Karung + Kerupuk, Bakiak (co-op 3 orang 1 HP).

## Yang belum ada (jujur, biar gak salah ekspektasi)

- Belum ada build pipeline Vite/TypeScript/Matter.js sungguhan — ini Phaser 3.80 lewat
  CDN + JS biasa, dipilih supaya tetap 100% statis & tanpa build step untuk deploy cepat.
- Belum ada: save/progress persisten, Ensiklopedia Lontar, Lencana Kayu Ukir, avatar 8
  daerah, Tutorial Mbah, setting Gamelan/SFX.
- Beberapa mekanik disederhanakan dari spesifikasi penuh demi tetap ringan & playable
  di satu file per game (contoh: Monopoli belum ada Jembatan/Lumbung terpisah;
  Bentengan single-player vs AI, bukan 5v5 penuh).

Kalau mau nambah TypeScript + build step (Vite) di kemudian hari, struktur folder ini
sudah dipisah per file sehingga tinggal di-convert ke module (`import`/`export`) dan
ditambah `vite.config.ts` tanpa perlu menulis ulang logic game-nya.
