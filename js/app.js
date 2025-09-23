$(document).ready(function() {
    // Toggle sidebar
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    // Menandai menu aktif berdasarkan halaman
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === 'index.html' || currentPage === '') {
        $('#nav-pasien').addClass('active');
    } else if (currentPage === 'tindakan.html') {
        $('#nav-tindakan').addClass('active');
    } else if (currentPage === 'obat.html') {
        $('#nav-obat').addClass('active');
    } else if (currentPage === 'resep.html') {
        $('#nav-resep').addClass('active');
    } else if (currentPage === 'pembayaran.html') {
        $('#nav-pembayaran').addClass('active');
    }
});

// Fungsi helper format Rupiah
function formatRupiah(angka) {
    if (isNaN(angka)) return 0;
    return new Intl.NumberFormat('id-ID').format(angka);
}
