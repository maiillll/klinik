// PENTING: GANTI DENGAN KONFIGURASI FIREBASE ANDA
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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

$(document).ready(function() {
    var table = $('#dataTable').DataTable({
        "columnDefs": [{ "targets": -1, "orderable": false }],
        "dom": '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>><"row"<"col-sm-12"tr>><"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
    });

    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
    
    db.collection('doctors').onSnapshot(snapshot => {
        table.clear().draw();
        let number = 1;
        snapshot.forEach(doc => {
            const doctor = doc.data();
            const id = doc.id;
            table.row.add([
                number,
                doctor.nama,
                doctor.spesialis,
                doctor.email,
                doctor.telp,
                doctor.alamat,
                `<button class="btn btn-warning btn-sm edit-btn" data-id="${id}"><i class="fas fa-edit"></i></button>
                 <button class="btn btn-danger btn-sm delete-btn" data-id="${id}"><i class="fas fa-trash"></i></button>`
            ]).draw(false);
            number++;
        });
    }, error => {
        console.error("Error fetching doctors: ", error);
    });
});
