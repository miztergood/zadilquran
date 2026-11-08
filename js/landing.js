/**
 * ============================================================================
 * ZADIL QURAN - LANDING PAGE & ONLINE PSB MODULE (js/landing.js)
 * Digunakan oleh index.html & landingpage.html
 * ============================================================================
 */

function handleLandingPortalClick() {
    if (checkExistingSession() && sessionData) {
        window.location.href = getDashboardUrlByRole(sessionData.role);
    } else {
        window.location.href = 'login.html';
    }
}

function updateLandingNavAuthButton(hasSession) {
    const textEl = document.getElementById('btnLandingPortalText');
    const btnEl = document.getElementById('btnLandingPortal');
    if (!textEl || !btnEl) return;
    if (hasSession && sessionData) {
        textEl.textContent = 'Buka Dashboard';
        btnEl.classList.remove('bg-[#9a2024]', 'hover:bg-[#871a1e]');
        btnEl.classList.add('bg-[#1c6b45]', 'hover:bg-[#165737]');
    } else {
        textEl.textContent = 'Portal Tahfizh';
        btnEl.classList.remove('bg-[#1c6b45]', 'hover:bg-[#165737]');
        btnEl.classList.add('bg-[#9a2024]', 'hover:bg-[#871a1e]');
    }
}

function toggleLandingMobileMenu() {
    const menu = document.getElementById('landingMobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function toggleFaq(index) {
    const content = document.getElementById('faq-content-' + index);
    const icon = document.getElementById('faq-icon-' + index);
    if (!content) return;
    const isHidden = content.classList.contains('hidden');
    document.querySelectorAll('.faq-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.faq-icon').forEach(el => el.classList.remove('rotate-180'));
    if (isHidden) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
    }
}

function submitPsbForm(event) {
    event.preventDefault();
    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };

    const payload = {
        namaSantri: getVal('psbNamaSantri'),
        namaPanggilan: getVal('psbNamaPanggilan'),
        jenisKelamin: getVal('psbGender'),
        tempatLahir: getVal('psbTempatLahir'),
        tanggalLahir: getVal('psbTglLahir'),
        alamat: getVal('psbAlamat'),
        rt: getVal('psbRt'),
        rw: getVal('psbRw'),
        desa: getVal('psbDesa'),
        kecamatan: getVal('psbKecamatan'),
        kabKota: getVal('psbKabKota'),
        provinsi: getVal('psbProvinsi'),
        pendidikanTerakhir: getVal('psbJenjang'),
        tahunLulus: getVal('psbTahunLulus'),
        sekolahAsal: getVal('psbSekolahAsal'),
        namaAyah: getVal('psbNamaAyah'),
        pekerjaanAyah: getVal('psbPekerjaanAyah'),
        pendidikanAyah: getVal('psbPendidikanAyah'),
        namaIbu: getVal('psbNamaIbu'),
        pekerjaanIbu: getVal('psbPekerjaanIbu'),
        pendidikanIbu: getVal('psbPendidikanIbu'),
        namaWali: getVal('psbNamaWali') || getVal('psbNamaAyah'),
        noHpWali: getVal('psbWaWali'),
        catatan: getVal('psbCatatan')
    };

    const buildWaUrl = (kodeZq) => {
        const ttl = `${payload.tempatLahir}, ${payload.tanggalLahir}`;
        const alamatFull = `${payload.alamat}, RT ${payload.rt || '-'}/RW ${payload.rw || '-'}, Desa/Kel ${payload.desa}, Kec. ${payload.kecamatan}, ${payload.kabKota}, ${payload.provinsi}`;
        const pesan = `*FORMULIR PENDAFTARAN SANTRI MUKIM*\n*PONDOK PESANTREN TAHFIZH ZADIL QUR'AN TUBAN*\n` +
            (kodeZq ? `*Kode Pendaftaran / ID Santri:* *${kodeZq}*\n\n` : `\n`) +
            `*I. DATA CALON SANTRI*\n` +
            `• *Nama Lengkap:* ${payload.namaSantri} (${payload.namaPanggilan || '-'})\n` +
            `• *Jenis Kelamin:* ${payload.jenisKelamin}\n` +
            `• *TTL:* ${ttl}\n` +
            `• *Alamat:* ${alamatFull}\n` +
            `• *Pendidikan Terakhir:* ${payload.pendidikanTerakhir} (Lulus: ${payload.tahunLulus || '-'})\n` +
            `• *Sekolah Asal:* ${payload.sekolahAsal || '-'}\n\n` +
            `*II. DATA ORANG TUA / WALI*\n` +
            `• *Ayah:* ${payload.namaAyah} (${payload.pekerjaanAyah || '-'} / ${payload.pendidikanAyah || '-'})\n` +
            `• *Ibu:* ${payload.namaIbu} (${payload.pekerjaanIbu || '-'} / ${payload.pendidikanIbu || '-'})\n` +
            `• *No. HP/WA Ortu:* ${payload.noHpWali}\n` +
            (payload.catatan ? `• *Catatan:* ${payload.catatan}\n\n` : `\n`) +
            `Bismillah, data pendaftaran sudah kami isi melalui Formulir Digital Zadil Qur'an. Mohon informasi jadwal observasi dan langkah selanjutnya. Terima kasih.`;
        return `https://wa.me/6285731804663?text=${encodeURIComponent(pesan)}`;
    };

    AppNotify.loading('Menyimpan Formulir ke Buku Induk...');
    apiCall('registerCalonSantriOnline', payload).then(res => {
        AppNotify.close();
        if (res && res.status === 'success' && res.data && res.data.idSantri) {
            const idZq = res.data.idSantri;
            const waUrl = buildWaUrl(idZq);
            if (event.target && typeof event.target.reset === 'function') {
                event.target.reset();
            }

            Swal.fire({
                icon: 'success',
                title: 'Pendaftaran Berhasil Tercatat!',
                html: `
                    <div class="text-left text-sm space-y-3 mt-2">
                        <p class="text-gray-600 dark:text-gray-300">Alhamdulillah, data ananda <b>${payload.namaSantri}</b> telah tersimpan otomatis di Buku Induk & Sistem Keuangan Pesantren.</p>
                        <div class="bg-[#fdf2f2] dark:bg-[#731417]/30 border border-[#f5d0d1] dark:border-[#9a2024]/50 rounded-2xl p-4 text-center">
                            <span class="text-[11px] font-bold uppercase tracking-wider text-[#9a2024] dark:text-[#f29fa3] block mb-1">Kode ID Santri Anda (Simpan untuk Login):</span>
                            <div class="font-mono text-2xl font-extrabold text-[#9a2024] dark:text-white tracking-wider">${idZq}</div>
                            <p class="text-[11px] text-gray-500 mt-1">Gunakan kode di atas untuk masuk ke <b>Portal Wali Santri</b> (Cek Hafalan, Tagihan SPP Rp 200.000 & Biaya Masuk Rp 1.800.000).</p>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#1c6b45',
                cancelButtonColor: '#9a2024',
                confirmButtonText: '<i class="fa-brands fa-whatsapp mr-1.5"></i> Kirim Konfirmasi ke WA Admin',
                cancelButtonText: '<i class="fa-solid fa-right-to-bracket mr-1.5"></i> Masuk Portal Wali'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.open(waUrl, '_blank');
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = `login.html?tab=wali&id=${encodeURIComponent(idZq)}`;
                }
            });
        } else {
            window.open(buildWaUrl(''), '_blank');
        }
    }).catch(() => {
        AppNotify.close();
        window.open(buildWaUrl(''), '_blank');
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initPwa();
    fetchInitialBranding();
    const hasSession = checkExistingSession();
    updateLandingNavAuthButton(hasSession);
});

