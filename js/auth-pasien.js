// Inisialisasi Firebase Auth
const auth = firebase.auth();

// Cek jika user sudah login, langsung arahkan ke portal
auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = 'portal-pasien.html';
    }
});

// --- LOGIKA REGISTER ---
const formRegister = document.getElementById('formRegister');
const registerError = document.getElementById('registerError');
formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('regNama').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Berhasil mendaftar
            const user = userCredential.user;
            // Simpan data pasien ke Firestore
            db.collection('patients').doc(user.uid).set({
                nama: nama,
                email: email,
                // Tambahkan field lain jika perlu, misal tgl_lahir, alamat, telp
                // Ambil dari form register jika Anda menambahkannya
            }).then(() => {
                // Pendaftaran berhasil, user akan otomatis login
                // dan diarahkan oleh onAuthStateChanged
            });
        })
        .catch(error => {
            registerError.textContent = error.message;
        });
});

// --- LOGIKA LOGIN ---
const formLogin = document.getElementById('formLogin');
const loginError = document.getElementById('loginError');
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Login berhasil, user akan diarahkan oleh onAuthStateChanged
        })
        .catch(error => {
            loginError.textContent = error.message;
        });
});
