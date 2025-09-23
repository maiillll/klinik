// Konfigurasi Firebase Anda (salin dari konsol Firebase)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAr9-ZC-Po3e-dH3WPAmc7fEXZ7peEtSN8",
  authDomain: "klinik-26f61.firebaseapp.com",
  projectId: "klinik-26f61",
  storageBucket: "klinik-26f61.firebasestorage.app",
  messagingSenderId: "388091198852",
  appId: "1:388091198852:web:11401553ab9bd4b1bb71d1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// === Referensi Elemen DOM ===
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');

// Form Login
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

// Tombol Logout
const logoutButton = document.getElementById('logout-button');

// Form Tambah Pasien
const addPatientForm = document.getElementById('add-patient-form');
const namaPasien = document.getElementById('nama-pasien');
const tglLahirPasien = document.getElementById('tgl-lahir-pasien');
const alamatPasien = document.getElementById('alamat-pasien');
const riwayatMedis = document.getElementById('riwayat-medis');

// Daftar Pasien
const patientList = document.getElementById('patient-list');

// === Logika Autentikasi ===

// Cek status login pengguna
auth.onAuthStateChanged(user => {
    if (user) {
        // Pengguna sudah login, tampilkan aplikasi
        loginSection.classList.add('hidden');
        appSection.classList.remove('hidden');
        loadPatients(); // Muat data pasien setelah login berhasil
    } else {
        // Pengguna belum login, tampilkan halaman login
        loginSection.classList.remove('hidden');
        appSection.classList.add('hidden');
    }
});

// Event listener untuk form login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;

    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            console.error("Error saat login:", error);
            loginError.textContent = "Email atau password salah. Coba lagi.";
        });
});

// Event listener untuk tombol logout
logoutButton.addEventListener('click', () => {
    auth.signOut();
});

// === Logika Firestore (Database) ===

// Tambah pasien baru
addPatientForm.addEventListener('submit', (e) => {
    e.preventDefault();

    db.collection('patients').add({
        nama: namaPasien.value,
        tanggalLahir: tglLahirPasien.value,
        alamat: alamatPasien.value,
        riwayat: riwayatMedis.value,
        dibuatPada: firebase.firestore.FieldValue.serverTimestamp() // Tambah timestamp
    })
    .then(() => {
        console.log("Data pasien berhasil ditambahkan!");
        addPatientForm.reset(); // Kosongkan form setelah submit
    })
    .catch(error => {
        console.error("Error menambahkan pasien: ", error);
    });
});

// Fungsi untuk memuat dan menampilkan data pasien (real-time)
function loadPatients() {
    db.collection('patients').orderBy('dibuatPada', 'desc').onSnapshot(snapshot => {
        let html = '';
        snapshot.forEach(doc => {
            const patient = doc.data();
            const id = doc.id;
            html += `
                <div class="patient-card" data-id="${id}">
                    <h3>${patient.nama}</h3>
                    <p><strong>Tanggal Lahir:</strong> ${patient.tanggalLahir}</p>
                    <p><strong>Alamat:</strong> ${patient.alamat}</p>
                    <p><strong>Riwayat:</strong> ${patient.riwayat}</p>
                </div>
            `;
        });
        patientList.innerHTML = html;
    });
}
