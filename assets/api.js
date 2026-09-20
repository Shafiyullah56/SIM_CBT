/**
 * API.js — jembatan antara frontend (halaman-halaman hasil Stitch ini) dan
 * backend Google Apps Script (Code.gs).
 *
 * CARA PAKAI:
 * 1. Ganti APPS_SCRIPT_URL di bawah dengan URL deployment Web App kamu
 *    (hasil dari Deploy > New deployment di Apps Script).
 * 2. Include file ini di tiap halaman HTML sebelum </body>:
 *    <script src="assets/api.js"></script>
 * 3. Panggil fungsinya, semua async, contoh:
 *    const hasil = await API.login(username, password);
 *
 * CATATAN CORS: Apps Script Web App tidak bisa diset custom response header,
 * jadi request POST di sini sengaja pakai body text/plain (bukan application/json)
 * supaya browser tidak mengirim preflight OPTIONS yang akan gagal karena
 * Apps Script tidak merespons preflight dengan benar. Apps Script tetap bisa
 * baca isinya lewat JSON.parse(e.postData.contents) seperti biasa.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwTmHqJ8G_-fRg9uS8q8giMJRHAfS8udFdgnPYgZPAFCqeKnXAVAHgXlq9p6zr7Fpw/exec';

async function callGet(action, params = {}) {
  const query = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${APPS_SCRIPT_URL}?${query}`, { method: 'GET' });
  const json = await res.json();
  if (json.status >= 400) throw new Error(json.data?.error || 'Terjadi kesalahan');
  return json.data;
}

async function callPost(action, data = {}) {
  const token = localStorage.getItem('token') || '';
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // lihat catatan CORS di atas
    body: JSON.stringify({ action, token, ...data })
  });
  const json = await res.json();
  if (json.status >= 400) throw new Error(json.data?.error || 'Terjadi kesalahan');
  return json.data;
}

const API = {
  // --- Auth ---
  async login(username, password) {
    const data = await callPost('login', { username, password });
    // simpan sesi login di browser supaya tidak perlu login ulang tiap halaman
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('nama', data.nama);
    localStorage.setItem('role', data.role);
    return data;
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('nama');
    localStorage.removeItem('role');
  },
  getSession() {
    return {
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId'),
      nama: localStorage.getItem('nama'),
      role: localStorage.getItem('role')
    };
  },

  // --- Bank Soal (trainer) ---
  listSoal(kategori) {
    return callGet('listSoal', kategori ? { kategori } : {});
  },
  createSoal(data) {
    return callPost('createSoal', { data });
  },
  updateSoal(id, data) {
    return callPost('updateSoal', { id, data });
  },
  deleteSoal(id) {
    return callPost('deleteSoal', { id });
  },

  // --- Sesi Tes (trainer) ---
  listSesi() {
    return callGet('listSesi');
  },
  createSesi(data) {
    return callPost('createSesi', { data });
  },

  // --- Pengerjaan tes (karyawan) ---
  getSesiUntukPeserta(sesiId) {
    return callGet('getSesiUntukPeserta', { sesiId });
  },
  submitJawaban(sesiId, userId, jawaban) {
    return callPost('submitJawaban', { sesiId, userId, jawaban });
  },

  // --- Leaderboard & Rekap ---
  leaderboard(sesiId) {
    return callGet('leaderboard', { sesiId });
  },
  rekap(training) {
    return callGet('rekap', { training });
  }
};

// Helper kecil: redirect ke login.html kalau belum ada token,
// panggil di awal halaman yang butuh login (dashboard, bank-soal, dst).
function requireLogin(roleYangDiharapkan) {
  const session = API.getSession();
  if (!session.token) {
    window.location.href = 'login.html';
    return null;
  }
  if (roleYangDiharapkan && session.role !== roleYangDiharapkan) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}
