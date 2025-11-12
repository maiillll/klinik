// Fungsi untuk update status antrian (tetap diperlukan oleh admin)
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

    // Dapatkan tanggal hari ini format YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);

    // Tampilkan data antrian hari ini (real-time)
    db.collection('queue')
      .where('queueDate', '==', today)
      .orderBy('queueNumber')
      .onSnapshot(snapshot => {
        table.clear().draw();
        snapshot.forEach(doc => {
            const queue = doc.data();
            let statusBadge = '';
            let actionButtons = '';
            
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
                statusBadge,
                actionButtons
            ]).draw(false);
        });
    });
});
