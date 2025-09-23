$(document).ready(function() {
    const table = $('#dataTable').DataTable({"language": {"url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Indonesian.json"}});
    const modal = new bootstrap.Modal(document.getElementById('formModal'));
    db.collection('patients').orderBy('nama').onSnapshot(snapshot => {
        table.clear().draw();
        snapshot.forEach((doc, index) => {
            const patient = doc.data();
            table.row.add([
                index + 1, patient.nama, patient.tgl_lahir, patient.alamat, patient.telp,
                `<button class="btn btn-danger btn-sm" onclick="deleteData('patients', '${doc.id}')"><i class="fas fa-trash"></i></button>`
            ]).draw(false);
        });
    });
    $('#formData').on('submit', function(e) {
        e.preventDefault();
        db.collection('patients').add({
            nama: $('#nama').val(), tgl_lahir: $('#tgl_lahir').val(), alamat: $('#alamat').val(), telp: $('#telp').val()
        }).then(() => { this.reset(); modal.hide(); });
    });
});
function deleteData(collection, id) {
    if (confirm(`Yakin ingin menghapus data ini dari koleksi ${collection}?`)) {
        db.collection(collection).doc(id).delete();
    }
}
