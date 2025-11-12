let selectedPatient = null;
let selectedDoctor = null;

// Fungsi Autocomplete (Mirip seperti di resep.js)
function setupAutocomplete(inputId, collectionName, onSelect) {
    const input = $(`#${inputId}`);
    input.on("input", function() {
        const val = $(this).val();
        $(`#${inputId}-list`).remove();
        if (!val) return;
        const listContainer = $(`<div id="${inputId}-list" class="autocomplete-items"></div>`);
        input.parent().append(listContainer);
        db.collection(collectionName).where('nama', '>=', val).where('nama', '<=', val + '\uf8ff').limit(5).get().then(snapshot => {
            snapshot.forEach(doc => {
                const item = { id: doc.id, ...doc.data() };
                const itemDiv = $(`<div><strong>${item.nama.substr(0, val.length)}</strong>${item.nama.substr(val.length)}</div>`);
                itemDiv.on("click", function() { input.val(item.nama); onSelect(item); listContainer.remove(); });
                listContainer.append(itemDiv);
            });
        });
    });
    $(document).on("click", function(e) { if (!$(e.target).is(input)) $(`#${inputId}-list`).remove(); });
}

// Fungsi untuk update status antrian
function updateStatus(id, newStatus) {
    db.collection('queue').doc(id).update({
        status: newStatus
    }).then(() => {
        console.log("Status antrian diperbarui!");
    }).catch(err => {
        console.error("Error update status: ", err);
    });
}

$(document).ready(function() {
    const table = $('#dataTable').DataTable({"language": {"url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Indonesian.json"}});
    const modal = new bootstrap.Modal(document.getElementById('formModal'));

    // Dapatkan tanggal hari ini format YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);

    // 1. Setup Autocomplete
    setupAutocomplete('cariPasien', 'patients', data => {
        selectedPatient = data;
        $('#pasienInfo').text(`ID: ${data.id}`);
    });
    // PENTING: Anda harus punya koleksi 'doctors' di Firestore
    setupAutocomplete('cariDokter', 'doctors', data => {
        selectedDoctor = data;
        $('#dokterInfo').text(`Spesialis: ${data.spesialis || 'Umum'}`);
    });

    // 2. Tampilkan data antrian hari ini (real-time)
    db.collection('queue')
      .where('queueDate', '==', today)
      .orderBy('queueNumber')
      .onSnapshot(snapshot => {
        table.clear().draw();
        snapshot.forEach(doc => {
            const queue = doc.data();
            let statusBadge = '';
            let actionButtons = '';
            
            // Tentukan badge & tombol berdasarkan status
            if (queue.status === 'Menunggu') {
                statusBadge = `<span class="badge bg-warning text-dark">${queue.status}</span>`;
                actionButtons = `<button class="btn btn-primary btn-sm" onclick="updateStatus('${doc.id}', 'Dipanggil')">Panggil</button>`;
            } else if (queue.status === 'Dipanggil') {
                statusBadge = `<span class="badge bg-info">${queue.status}</span>`;
                actionButtons = `<button class="btn btn-success btn-sm" onclick="updateStatus('${doc.id}', 'Selesai')">Selesai</button>`;
            } else {
                statusBadge = `<span class="badge bg-success">${queue.status}</span>`;
                actionButtons = `<button class="btn btn-secondary btn-sm" disabled>Selesai</button>`;
            }

            table.row.add([
                queue.queueNumber,
                queue.patientName,
                queue.doctorName,
                statusBadge,
                actionButtons
            ]).draw(false);
        });
    });

    // 3. Logika Simpan Antrian Baru
    $('#formData').on('submit', async function(e) {
        e.preventDefault();
        if (!selectedPatient || !selectedDoctor) {
            alert('Harap pilih pasien dan dokter terlebih dahulu.');
            return;
        }

        // Dapatkan nomor antrian terakhir untuk hari ini
        const today = new Date().toISOString().slice(0, 10);
        const queueQuery = await db.collection('queue')
                                   .where('queueDate', '==', today)
                                   .orderBy('queueNumber', 'desc')
                                   .limit(1)
                                   .get();

        let newQueueNumber = 1;
        if (!queueQuery.empty) {
            newQueueNumber = queueQuery.docs[0].data().queueNumber + 1;
        }

        // Simpan data antrian baru
        db.collection('queue').add({
            patientId: selectedPatient.id,
            patientName: selectedPatient.nama,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.nama,
            queueNumber: newQueueNumber,
            queueDate: today,
            status: 'Menunggu',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            // Reset form dan tutup modal
            this.reset();
            modal.hide();
            selectedPatient = null;
            selectedDoctor = null;
            $('#pasienInfo').text('Pasien belum dipilih.');
            $('#dokterInfo').text('Dokter belum dipilih.');
        }).catch(err => {
            console.error("Error menambah antrian: ", err);
            alert("Gagal menambahkan ke antrian.");
        });
    });
});
