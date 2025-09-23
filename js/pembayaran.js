$(document).ready(function() {
    const table = $('#dataTable').DataTable({"language": {"url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Indonesian.json"}});

    db.collection('bills').orderBy('dibuatPada', 'desc').onSnapshot(snapshot => {
        table.clear().draw();
        snapshot.forEach((doc, index) => {
            const bill = doc.data();
            let statusBadge = '';
            if (bill.status === 'PENDING') {
                statusBadge = `<span class="badge bg-warning text-dark">${bill.status}</span>`;
            } else if (bill.status === 'PAID') {
                statusBadge = `<span class="badge bg-success">${bill.status}</span>`;
            } else {
                 statusBadge = `<span class="badge bg-danger">${bill.status}</span>`;
            }

            table.row.add([
                index + 1,
                bill.tanggal,
                doc.id,
                bill.pasien.nama,
                formatRupiah(bill.total),
                statusBadge
            ]).draw(false);
        });
    });
});
