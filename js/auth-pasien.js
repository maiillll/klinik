// Pastikan kode ini berjalan setelah halaman dimuat sepenuhnya
document.addEventListener('DOMContentLoaded', function() {
    
    // Inisialisasi Firebase Auth
    const auth = firebase.auth();

    // Cek jika user sudah login, langsung arahkan ke portal
    auth.onAuthStateChanged(user => {
        if (user) {
            // Cek apakah data pasien sudah ada di Firestore sebelum mengarahkan
            const userDocRef = db.collection('patients').doc(user.uid);
            userDocRef.get().then((doc) => {
                if (doc.exists) {
                    window.location.href = 'portal-pasien.html';
                }
                // Jika tidak ada, biarkan user di halaman login untuk jaga-jaga,
                // atau bisa juga dipaksa logout jika alurnya harus begitu.
            }).catch((error) => {
                console.error("Error checking patient data:", error);
            });
        }
    });

    // --- LOGIKA REGISTER ---
    const formRegister = document.getElementById('formRegister');
    const registerError = document.getElementById('registerError');

    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            const nama = document.getElementById('regNama').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            // Hapus pesan error sebelumnya
            registerError.textContent = '';

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    const user = userCredential.user;
                    // Simpan data tambahan pasien ke koleksi 'patients' di Firestore
                    // Menggunakan UID dari Auth sebagai ID dokumen
                    return db.collection('patients').doc(user.uid).set({
                        nama: nama,
                        email: email,
                        dibuatPada: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .then(() => {
                    // Pendaftaran dan penyimpanan data berhasil.
                    // Pengguna akan otomatis login dan diarahkan oleh onAuthStateChanged.
                    console.log('Pendaftaran berhasil!');
                })
                .catch(error => {
                    // Tampilkan pesan error yang lebih mudah dimengerti
                    if (error.code == 'auth/email-already-in-use') {
                        registerError.textContent = 'Email ini sudah terdaftar. Silakan login.';
                    } else if (error.code == 'auth/weak-password') {
                        registerError.textContent = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
                    } else {
                        registerError.textContent = error.message;
                    }
                });
        });
    }

    // --- LOGIKA LOGIN ---
    const formLogin = document.getElementById('formLogin');
    const loginError = document.getElementById('loginError');

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Hapus pesan error sebelumnya
            loginError.textContent = '';

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // Login berhasil, pengguna akan diarahkan oleh onAuthStateChanged.
                    console.log('Login berhasil!');
                })
                .catch(error => {
                    loginError.textContent = "Email atau password salah.";
                });
        });
    }
});
