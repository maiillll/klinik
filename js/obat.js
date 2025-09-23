$(document).ready(function() {
    const table = $('#dataTable').DataTable({"language": {"url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Indonesian.json"}});
    const modal = new bootstrap.Modal(document.getElementById('formModal'));

    db.collection('medicines').orderBy('nama').onSnapshot(snapshot => {
        table.clear().draw();
        snapshot.forEach((doc, index) => {
            const medicine = doc.data();
            table.row.add([
                index + 1,
                medicine.nama,
                medicine.satuan,
                formatRupiah(medicine.harga),
                `<button class="btn btn-danger btn-sm" onclick="deleteData('${doc.id}')"><i class="fas fa-trash"></i></button>`
            ]).draw(false);
        });
    });

    $('#formData').on('submit', function(e) {
        e.preventDefault();
        db.collection('medicines').add({
            nama: $('#nama').val(),
            satuan: $('#satuan').val(),
            harga: Number($('#harga').val())
        }).then(() => {
            this.reset();
            modal.hide();
        });
    });
});
function deleteData(id) {
    if (confirm('Yakin ingin menghapus data obat ini?')) {
        db.collection('medicines').doc(id).delete();
    }
}
