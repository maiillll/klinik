$(document).ready(function() {
    let selectedPatient = null,
        selectedTindakan = null,
        selectedObat = null;
    let itemsTindakan = [],
        itemsObat = [];

    // --- FUNGSI UTAMA ---
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
                    const item = {
                        id: doc.id,
                        ...doc.data()
                    };
                    const itemDiv = $(`<div><strong>${item.nama.substr(0, val.length)}</strong>${item.nama.substr(val.length)}</div>`);
                    itemDiv.on("click", function() {
                        input.val(item.nama);
                        onSelect(item);
                        listContainer.remove();
                    });
                    listContainer.append(itemDiv);
                });
            });
        });
        $(document).on("click", function(e) {
            if (!$(e.target).is(input)) $(`#${inputId}-list`).remove();
        });
    }

    function renderTablesAndTotal() {
        let total = 0;
        const tindakanBody = $('#tabelTindakan tbody').empty();
        itemsTindakan.forEach((item, i) => {
            const subtotal = item.harga * item.qty;
            total += subtotal;
            tindakanBody.append(`<tr><td>${item.nama}</td><td>${item.qty}</td><td>${formatRupiah(subtotal)}</td><td><button type="button" class="btn btn-danger btn-sm remove-tindakan" data-index="${i}"><i class="fas fa-times"></i></button></td></tr>`);
        });
        const obatBody = $('#tabelObat tbody').empty();
        itemsObat.forEach((item, i) => {
            const subtotal = item.harga * item.qty;
            total += subtotal;
            obatBody.append(`<tr><td>${item.nama} (${item.satuan})</td><td>${item.qty}</td><td>${formatRupiah(subtotal)}</td><td><button type="button" class="btn btn-danger btn-sm remove-obat" data-index="${i}"><i class="fas fa-times"></i></button></td></tr>`);
        });
        $('#totalBiaya').text(formatRupiah(total));
    }

    // --- SETUP AUTOCOMPLETE ---
    setupAutocomplete('cariPasien', 'patients', data => {
        selectedPatient = data;
        $('#pasienInfo').text(`ID: ${data.id}, Alamat: ${data.alamat}`);
    });
    setupAutocomplete('cariTindakan', 'actions', data => {
        selectedTindakan = data;
        $('#hargaTindakan').val(formatRupiah(data.harga));
    });
    setupAutocomplete('cariObat', 'medicines', data => {
        selectedObat = data;
        $('#hargaObat').val(formatRupiah(data.harga));
    });

    // --- EVENT LISTENERS ---
    $('#addTindakan').on('click', () => {
        if (selectedTindakan && $('#qtyTindakan').val() > 0) {
            itemsTindakan.push({ ...selectedTindakan,
                qty: Number($('#qtyTindakan').val())
            });
            renderTablesAndTotal();
            $('#cariTindakan, #hargaTindakan').val('');
            $('#qtyTindakan').val(1);
            selectedTindakan = null;
        } else {
            alert('Pilih tindakan & pastikan Qty > 0.');
        }
    });
    $('#addObat').on('click', () => {
        if (selectedObat && $('#qtyObat').val() > 0) {
            itemsObat.push({ ...selectedObat,
                qty: Number($('#qtyObat').val())
            });
            renderTablesAndTotal();
            $('#cariObat, #hargaObat').val('');
            $('#qtyObat').val(1);
            selectedObat = null;
        } else {
            alert('Pilih obat & pastikan Qty > 0.');
        }
    });

    $('#tabelTindakan').on('click', '.remove-tindakan', function() {
        itemsTindakan.splice($(this).data('index'), 1);
        renderTablesAndTotal();
    });
    $('#tabelObat').on('click', '.remove-obat', function() {
        itemsObat.splice($(this).data('index'), 1);
        renderTablesAndTotal();
    });

    // --- PROSES SUBMIT FORM DAN PEMBAYARAN ---
    $('#formResep').on('submit', function(e) {
        e.preventDefault();
        if (!selectedPatient) return alert('Pilih pasien terlebih dahulu.');
        if (itemsTindakan.length === 0 && itemsObat.length === 0) return alert('Tambahkan minimal satu tindakan atau obat.');

        const totalBiaya = itemsTindakan.reduce((s, i) => s + (i.harga * i.qty), 0) + itemsObat.reduce((s, i) => s + (i.harga * i.qty), 0);

        const tagihanData = {
            pasien: {
                id: selectedPatient.id,
                nama: selectedPatient.nama
            },
            tanggal: $('#tanggal').val() || new Date().toISOString().slice(0, 10),
            itemsTindakan,
            itemsObat,
            total: totalBiaya,
            status: 'PENDING',
            dibuatPada: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 1. Simpan data tagihan ke Firestore
        db.collection('bills').add(tagihanData).then(docRef => {
            
            // 2. Siapkan data untuk dikirim ke backend Pipedream
            const requestDataToBackend = {
                order_id: docRef.id,
                gross_amount: tagihanData.total
            };

            // 3. Panggil backend Pipedream Anda
            const pipedreamUrl = "https://eogv8o8hgcb7rg8.m.pipedream.net"; // URL PIPEDREAM BARU ANDA SUDAH DIMASUKKAN DI SINI
            
            fetch(pipedreamUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestDataToBackend)
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    // 4. Jika token diterima, buka pop-up pembayaran Midtrans
                    window.snap.pay(data.token, {
                        onSuccess: function(result) {
                            db.collection('bills').doc(docRef.id).update({ status: 'PAID' });
                            alert("Pembayaran berhasil!");
                            window.location.href = 'pembayaran.html';
                        },
                        onPending: function(result) {
                            db.collection('bills').doc(docRef.id).update({ status: 'PENDING' });
                            alert("Menunggu pembayaran!");
                            window.location.href = 'pembayaran.html';
                        },
                        onError: function(result) {
                            db.collection('bills').doc(docRef.id).update({ status: 'FAILED' });
                            alert("Pembayaran gagal!");
                        }
                    });
                } else {
                    alert('Gagal mendapatkan token pembayaran dari server.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Gagal menghubungi server pembayaran. Cek console (F12) untuk detail.');
            });

        }).catch(err => {
            console.error(err);
            alert('Gagal membuat tagihan di database.');
        });
    });
});
