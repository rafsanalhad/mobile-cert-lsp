# Agenda Nusantara

Aplikasi tugas mobile berbasis React Native + Expo untuk ujian LSP.

## Fitur

- Login sederhana dengan akun default
- Beranda dengan ringkasan tugas
- Tambah tugas penting dan biasa
- Daftar tugas dengan filter status/kategori
- Toggle status selesai/belum selesai
- Ganti password
- SQLite untuk penyimpanan data di HP

## Akun Default

- Username: `user`
- Password: `user`

## Cara Menjalankan di HP

### 1. Masuk ke folder project

```bash
cd AgendaNusantara
```

### 2. Install dependency

```bash
npm install
```

### 3. Jalankan Expo

```bash
npm start
```

Kalau Metro sudah muncul, buka **Expo Go** di HP lalu scan QR code yang tampil di terminal.

## Catatan Penting

- Project ini dibuat untuk dibuka di **HP / Expo Go**.
- Tidak memakai mode web.
- Pastikan HP dan laptop ada di jaringan Wi-Fi yang sama.
- Jika QR tidak bisa dibaca, matikan VPN dan coba lagi.

## Struktur Project

```text
AgendaNusantara/
├── App.js
├── index.js
├── app.json
├── package.json
├── src/
│   ├── database/
│   │   ├── database.js
│   │   └── sqlitePromise.native.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── BerandaScreen.js
│   │   ├── DaftarTugasScreen.js
│   │   ├── TambahTugasScreen.js
│   │   └── PengaturanScreen.js
│   └── utils/
│       └── AuthContext.js
└── assets/
```

## Alur Aplikasi

1. Aplikasi dibuka.
2. Database SQLite diinisialisasi.
3. User login dengan akun default.
4. Masuk ke beranda.
5. User bisa menambah tugas, melihat daftar tugas, mengubah status, dan mengganti password.

## Jika Ingin Reset Data

Karena data disimpan di SQLite perangkat, cara paling mudah untuk reset adalah:

- hapus aplikasi dari HP, lalu install ulang via Expo Go / development build,
- atau hapus database aplikasi dari perangkat jika memakai build native.

## Keterangan Ujian LSP

Project ini disusun agar alur fitur utama selesai dari awal sampai akhir:

- autentikasi
- navigasi antar layar
- CRUD tugas
- statistik ringkas
- pengaturan password
