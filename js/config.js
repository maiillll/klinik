// Konfigurasi Firebase Anda (DIAMBIL DARI INFORMASI YANG ANDA BERIKAN)
const firebaseConfig = {
  apiKey: "AIzaSyAr9-ZC-Po3e-dH3WPAmc7fEXZ7peEtSN8",
  authDomain: "klinik-26f61.firebaseapp.com",
  projectId: "klinik-26f61",
  storageBucket: "klinik-26f61.firebasestorage.app",
  messagingSenderId: "388091198852",
  appId: "1:388091198852:web:11401553ab9bd4b1bb71d1"
};

// Inisialisasi Firebase dengan gaya yang kompatibel (v8)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
