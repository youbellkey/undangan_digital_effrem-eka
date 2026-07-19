// config.js
// Konfigurasi Global untuk Aplikasi Undangan
// API_URL harus menunjuk ke Google Apps Script Web App URL yang baru.

window.APP_CONFIG = {
  // Ganti URL ini dengan URL Web App hasil deploy Google Apps Script Anda.
  API_URL: "https://script.google.com/macros/s/AKfycbycb-LN1YtyFYWdBoVyozntR_Fzp8kfoX8MqtsoWf8DsJ1rNGVsIwnHJcdMxKtrMSg/exec",
  
  // Menggunakan origin location secara dinamis (contoh: https://undangan-digital-effrem-eka.vercel.app)
  // Jangan di-hardcode agar tetap bekerja jika domain diubah.
  get BASE_URL() {
    return window.location.origin;
  }
};
