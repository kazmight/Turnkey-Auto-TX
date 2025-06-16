## Script Auto Transfer ETH Sepolia 
Selamat datang di Script Auto Transfer ETH Sepolia! Ini adalah alat Node.js yang dirancang untuk mengotomatisasi proses pengiriman token native Ethereum (ETH Sepolia) ke banyak alamat wallet. Skrip ini mendukung multi-akun pengirim, konfigurasi transaksi yang fleksibel, dan log konsol berwarna untuk visibilitas yang lebih baik.

## Fitur Utama
Multi-Akun Pengirim: Gunakan beberapa private key dari file .env Anda untuk mengirim transaksi dari berbagai akun.
Daftar Penerima dari File: Skrip akan membaca alamat wallet penerima dari file wallet.txt, memungkinkan transfer ke banyak tujuan sekaligus.
Input Transaksi Interaktif: Tentukan jumlah transaksi yang ingin dijalankan, jumlah ETH Sepolia per transaksi, dan delay antar transaksi secara manual melalui konsol.
Log Konsol Berwarna:
Hijau: Transaksi berhasil, lengkap dengan tautan Etherscan.
Merah: Transaksi gagal atau ada kesalahan.
Biru: Informasi umum dan input dari pengguna.
Kuning: Saldo native token (ETH Sepolia) akun pengirim.
Pencegahan Log Duplikat: Tidak ada lagi pesan Account already exists. yang mengganggu di konsol.
Persyaratan
Sebelum Anda mulai, pastikan Anda telah menginstal:

Node.js: Versi 16 atau lebih tinggi.
npm (Node Package Manager): Biasanya terinstal bersama Node.js.
Cara Menggunakan
Ikuti langkah-langkah di bawah ini untuk menyiapkan dan menjalankan skrip:

## 1. Klon Repositori (Jika Ada) atau Buat Proyek Baru
Jika Anda memiliki repositori Git, klon:
```Bash
git clone https://github.com/kazmight/Turnkey-Auto-TX.git
cd Turnkey-Auto-TX
```

## 2. Instal Dependensi
Jalankan perintah berikut di terminal Anda untuk menginstal semua pustaka yang diperlukan:
```Bash
npm install web3 dotenv inquirer chalk
```
## 3. Siapkan File Konfigurasi
Buat dua file di direktori proyek Anda:
## a. .env (Untuk Private Keys Anda)
Buat file bernama .env dan masukkan private key akun pengirim Anda. Anda bisa menambahkan lebih dari satu private key.

## Contoh .env:

PRIVATE_KEY=0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0


## b. wallet.txt (Untuk Alamat Wallet Penerima)
Buat file bernama wallet.txt dan daftar semua alamat wallet penerima, satu alamat per baris.

Contoh wallet.txt:

0xAbC1234567890123456789012345678901234567
0xDef4567890123456789012345678901234567890
0xGhi7890123456789012345678901234567890123
Pastikan tidak ada baris kosong atau spasi ekstra yang tidak diinginkan di dalam file ini.

## 4. Jalankan Skrip
Setelah semua dependensi terinstal dan file konfigurasi disiapkan, jalankan skrip dari terminal Anda:
```Bash
node index.js
```
🔒 Fitur Password (Keamanan)
Untuk menjaga keamanan skrip Anda dan memastikan hanya pengguna yang sah yang dapat menjalankannya, skrip ini dilengkapi dengan sistem otentikasi password sederhana.


Input Tersembunyi di Konsol: Saat Anda diminta untuk memasukkan password, input Anda akan sepenuhnya tersembunyi (tidak ada karakter yang muncul di konsol saat Anda mengetik), mencegah orang lain melihatnya.
Otentikasi Wajib: Skrip tidak akan melanjutkan eksekusi ke langkah-langkah transfer token sampai password yang benar dimasukkan.

## Untuk password silahkan Join Channel Dasar Pemulung: https://t.me/dasarpemulung

Jalankan skrip: Saat Anda menjalankan node index.js, Anda akan diminta untuk memasukkan password ini.

Anda akan diminta untuk memasukkan jumlah transaksi yang ingin Anda jalankan.
Kemudian, masukkan delay (jeda) dalam detik antara setiap transaksi.
Terakhir, tentukan jumlah Sepolia ETH yang ingin Anda kirim per transaksi.
Skrip akan mulai mengirim transaksi secara otomatis, menampilkan status dan log berwarna yang mudah dibaca.

Catatan Penting
Saldo Akun: Pastikan akun pengirim Anda memiliki cukup ETH Sepolia untuk menutupi jumlah transfer dan biaya gas. Skrip akan memberikan peringatan jika dana tidak mencukupi.
RPC Endpoint: Secara default, skrip menggunakan https://rpc.sepolia.org. Jika Anda mengalami masalah stabilitas atau batasan laju, pertimbangkan untuk menggunakan layanan RPC kustom dari penyedia seperti Infura atau Alchemy.
Biaya Gas: Biaya gas dapat berfluktuasi di jaringan Ethereum. Skrip akan mengambil harga gas saat ini, tetapi perlu diingat bahwa biaya total transaksi bisa bervariasi.


## Script By Kazmight 
