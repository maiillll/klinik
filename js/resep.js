$(document).ready(function() {
    let selectedPatient = null;
    let selectedTindakan = null;
    let selectedObat = null;
    let itemsTindakan = [];
    let itemsObat = [];

    // --- FUNGSI UTAMA ---
    function setupAutocomplete(inputId, collectionName, onSelect) {
        const input = document.getElementById(inputId);
        let currentFocus;

        input.addEventListener("input", function(e) {
            const val = this.value;
            closeAllLists();
            if (!val) return false;
            currentFocus = -1;
            
            const listContainer = document.createElement("DIV");
            listContainer.setAttribute("id", this.id + "autocomplete-list");
            listContainer.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(listContainer);

            db.collection(collectionName).where('nama', '>=', val).where('nama', '<=', val + '\uf8ff').limit(5).get().then(snapshot => {
                snapshot.forEach(doc => {
                    const item = doc.data();
                    const itemDiv = document.createElement("DIV");
                    itemDiv.innerHTML = "<strong>" + item.nama.substr(0, val.length) + "</strong>";
                    itemDiv.innerHTML += item.nama.substr(val.length);
                    itemDiv.innerHTML += `<input type='hidden' value='${JSON.stringify({id: doc.id, ...item})}'>`;
                    itemDiv.addEventListener("click", function(e) {
                        const selectedData = JSON.parse(this.getElementsByTagName("input")[0].value);
                        input.value = selectedData.nama;
                        onSelect(selectedData);
                        closeAllLists();
                    });
                    listContainer.appendChild(itemDiv);
                });
            });
        });

        function closeAllLists(elmnt) {
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != input) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        document.addEventListener("click", function(e) {
            closeAllLists(e.target);
        });
    }

    function renderTablesAndTotal() {
        let total = 0;
        const tindakanBody = $('#tabelTindakan tbody');
        tindakanBody.empty();
        itemsTindakan.forEach((item, index) => {
            const subtotal = item.harga * item.qty;
            total += subtotal;
            tindakanBody.append(`
                <tr>
                    <td>${item.nama}</td>
                    <td>${item.qty}</td>
                    <td>${formatRupiah(subtotal)}</td>
                    <td><button type="button" class="btn btn-danger btn-sm remove-tindakan" data-index="${index}"><i class="fas fa-times"></i></button></td>
                </tr>
            `);
        });

        const obatBody = $('#tabelObat tbody');
        obatBody.empty();
        itemsObat.forEach((item, index) => {
            const subtotal = item.harga * item.qty;
            total += subtotal;
            obatBody.append(`
                <tr>
                    <td>${item.nama} (${item.satuan})</td>
                    <td>${item.qty}</td>
                    <td>${formatRupiah(subtotal)}</td>
                    <td><button type="button" class="btn btn-danger btn-sm remove-obat" data-index="${index}"><i class="fas fa-times"></i></button></td>
                </tr>
            `);
        });
        $('#totalBiaya').text(formatRupiah(total));
    }

    // --- SETUP AUTOCOMPLETE ---
    setupAutocomplete('cariPasien', 'patients', (data) => {
        selectedPatient = data;
        $('#pasienId').val(data.id);
        $('#pasienInfo').text(`ID: ${data.id}, Alamat: ${data.alamat}`);
    });
    setupAutocomplete('cariTindakan', 'actions', (data) => {
        selectedTindakan = data;
        $('#hargaTindakan').val(formatRupiah(data.harga));
    });
    setupAutocomplete('cariObat', 'medicines', (data) => {
        selectedObat = data;
        $('#hargaObat').val(formatRupiah(data.harga));
    });

    // --- EVENT LISTENERS ---
    $('#addTindakan').on('click', function() {
        if (selectedTindakan && $('#qtyTindakan').val() > 0) {
            itemsTindakan.push({ ...selectedTindakan, qty: Number($('#qtyTindakan').val()) });
            renderTablesAndTotal();
            $('#cariTindakan, #hargaTindakan').val('');
            $('#qtyTindakan').val(1);
            selectedTindakan = null;
        } else { alert('Pilih tindakan dan pastikan Qty lebih dari 0.'); }
    });

    $('#addObat').on('click', function() {
        if (selectedObat && $('#qtyObat').val() > 0) {
            itemsObat.push({ ...selectedObat, qty: Number($('#qtyObat').val()) });
            renderTablesAndTotal();
            $('#cariObat, #hargaObat').val('');
            $('#qtyObat').val(1);
            selectedObat = null;
        } else { alert('Pilih obat dan pastikan Qty lebih dari 0.'); }
    });

    // Hapus item dari tabel
    $('#tabelTindakan').on('click', '.remove-tindakan', function() {
        itemsTindakan.splice($(this).data('index'), 1);
        renderTablesAndTotal();
    });
    $('#tabelObat').on('click', '.remove-obat', function() {
        itemsObat.splice($(this).data('index'), 1);
        renderTablesAndTotal();
    });
    
    // Submit form resep
    $('#formResep').on('submit', function(e) {
        e.preventDefault();
        if (!selectedPatient) {
            alert('Silakan pilih pasien terlebih dahulu.');
            return;
        }
        if (itemsTindakan.length === 0 && itemsObat.length === 0) {
            alert('Tambahkan minimal satu tindakan atau obat.');
            return;
        }

        const totalBiaya = itemsTindakan.reduce((sum, item) => sum + (item.harga * item.qty), 0) +
                         itemsObat.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        
        const tagihanData = {
            pasien: { id: selectedPatient.id, nama: selectedPatient.nama },
            tanggal: $('#tanggal').val(),
            itemsTindakan: itemsTindakan,
            itemsObat: itemsObat,
            total: totalBiaya,
            status: 'PENDING',
            dibuatPada: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection('bills').add(tagihanData).then(docRef => {
            alert(`Tagihan berhasil dibuat dengan ID: ${docRef.id}.\n\nLangkah selanjutnya adalah memanggil backend untuk proses pembayaran Midtrans.`);
            // Di sinilah nanti Anda akan memanggil Firebase Function
            // window.snap.pay('TOKEN_DARI_BACKEND');
            window.location.href = 'pembayaran.html'; // Pindah ke halaman riwayat
        }).catch(err => {
            console.error(err);
            alert('Gagal membuat tagihan.');
        });
    });
});
