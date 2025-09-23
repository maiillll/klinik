$(document).ready(function() {
    const table = $('#dataTable').DataTable({"language": {"url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Indonesian.json"}});
    const modal = new bootstrap.Modal(document.getElementById('formModal'));
    db.collection('actions').orderBy('nama').onSnapshot(snapshot => {
        table.clear().draw();
        snapshot.forEach((doc, index) => {
            const action = doc.data();
            table.row.add([
                index + 1, action.nama, formatRupiah(action.harga),
                `<button class="btn btn-danger btn-sm" onclick="deleteData('actions', '${doc.id}')"><i class="fas fa-trash"></i></button>`
            ]).draw(false);
        });
    });
    $('#formData').on('submit', function(e) {
        e.preventDefault();
        db.collection('actions').add({
            nama: $('#nama').val(), harga: Number($('#harga').val())
        }).then(() => { this.reset(); modal.hide(); });
    });
});
// Fungsi deleteData ada di pasien.js dan bisa digunakan bersama jika pasien.js dimuat lebih dulu,
// atau salin fungsi yang sama ke sini jika halaman ini bisa diakses mandiri.
function deleteData(collection, id) {
    if (confirm(`Yakin ingin menghapus data ini dari koleksi ${collection}?`)) {
        db.collection(collection).doc(id).delete();
    }
}
