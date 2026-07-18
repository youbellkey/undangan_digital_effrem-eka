# Changelog - Undangan Pernikahan Effrem & Eka

Semua perubahan penting pada proyek undangan digital VVIP Dayak-Catholic ini didokumentasikan di bawah ini.

## [1.1.0] - 2026-07-19

### Added
- **Welcome Overlay (Envelope)**: Implementasi ornamen VVIP khas (`2 atas .png` di atas judul, dan `2 bawah.png` di bawah judul) pada Welcome Overlay / Digital Envelope.
- **Cross Animation**: Efek transisi masuk pudar-swivel (putar 3D) pada ikon salib di sampul, dilanjutkan dengan putaran putar 3D lambat secara konstan (`swivel-continuous` loop) setelah halaman terbuka.
- **Spotlight Glow**: Animasi Backlight dan cahaya tepi emas berdenyut halus (*spotlight pulse glow*) pada foto profil kedua mempelai (`c-photo-frame`) saat di-scroll masuk ke viewport.
- **Vintage Paper Theme (Perjalanan Kasih)**: Desain kertas tua/parchment klasik pada panel timeline, lengkap dengan detail noda kopi radial, garis jahitan putus-putus (`dashed`), segel cap lilin merah pada titik kejadian, dan Google Font tulisan tangan cetak `Kalam` yang estetik.
- **Custom Event Glows**: Garis tepi cahaya emas menyala tajam (*neon gold border filament glow*) dan efek denyutan bernapas pada kartu Misa & Sakramen serta Resepsi Pernikahan.

### Changed
- **Cover Photo Animation**: Memisahkan layer container JS scroll-transform (`.js-hero-photo`) dan tag gambar CSS glow (`.hero-rim-glow-img`) untuk mengatasi bug browser engine (Chromium/WebKit conflict) yang melumpuhkan efek paralaks penyusutan foto.
- **Foliage Color (Falling Leaves)**: Mengganti daun gugur warna merah menyala dengan palet warna dedaunan kering tropis Kalimantan (Sienna tembaga, oker emas, zaitun lapuk, cokelat kayu, dsb.) secara acak agar menyatu harmonis dengan latar belakang.
- **Firefly Particles**: Peningkatan gerakan acak (*random 3D drift*) dengan durasi kedip, durasi terbang, dan koordinat pergeseran yang diacak per partikel agar berterbangan secara organik.
- **Mempelai Photos Custom Variables**: Mengubah pembacaan warna border foto profil mempelai menjadi inline style `#ffc107` dan `#d32f2f` guna mengeliminasi error parsing JIT Tailwind CDN pada browser mobile tertentu.
- **Countdown Layout**: Pengaturan layout hitung mundur menggunakan `flex-wrap: nowrap`, lebar kolom dinamis (`flex: 1`), dan ukuran teks/label berskala `clamp` agar keempat kolom (Hari, Jam, Menit, Detik) selalu berjejer sejajar rapi di semua resolusi layar mobile.
- **Misa Card Theme Alignment**: Mengubah Misa & Sakramen Card menjadi tipe gelap (`c-glass-panel--dark`) dengan teks putih/abu-abu terang dan lencana Misa warna emas-merah agar berpasangan serasi dengan kartu Resepsi di sebelahnya.
- **Timeline Copywriter**: Menulis ulang keempat paragraf linimasa perjalanan kasih Effrem dan Eka menggunakan narasi sastrawan pihak ketiga yang puitis dan menyentuh jiwa tanpa merubah fakta aslinya.
- **Version Cache-Busting**: Menaikkan seluruh query caching string pada pemuatan link CSS dan script JS di `index.html` dari `v=16` ke `v=34` untuk memastikan browser memuat perubahan terbaru secara instan.

### Removed
- **Glint Sweep Effect**: Menghapus efek kilau cahaya menyapu diagonal (`::after`) pada kartu detail acara agar tidak terlihat norak, digantikan dengan garis tepi emas tajam yang elegan.
