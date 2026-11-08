/**
 * ============================================================================
 * ZADIL QURAN - WALI SANTRI 3-IN-1 PORTAL MODULE (js/wali.js)
 * Digunakan oleh wali.html
 * Mencakup: Tab 1 (Tahfizh), Tab 2 (Keuangan & Syahriyah SPP),
 * dan Tab 3 (Buku Induk Santri).
 * ============================================================================
 */

let state = {
    santri: null,
    ustadz: null,
    setoran: [],
    tagihan: [],
    appName: "Zadil Quran"
};

let waliFilter = 'all';
let waliSearchQuery = '';

function copySantriId() {
    if (!state.santri || !state.santri.ID_Santri) return;
    navigator.clipboard.writeText(state.santri.ID_Santri).then(() => {
        AppNotify.toast('success', 'ID Santri berhasil disalin!');
    });
}

function shareProgressWa() {
    const s = state.santri;
    const u = state.ustadz;
    const mySetoran = state.setoran || [];
    if (!s) return;

    const baru = mySetoran.filter(x => x.Jenis === 'Hafalan Baru').length;
    const murojaah = mySetoran.filter(x => x.Jenis === 'Murojaah' || x.Jenis === "Muroja'ah").length;
    const last = mySetoran.length > 0 ? mySetoran[0] : null;

    let text = `*LAPORAN PERKEMBANGAN TAHFIZH AL-QUR'AN*\n`;
    text += `*${state.appName || 'Zadil Quran'}*\n\n`;
    text += `Nama Santri: *${s.Nama_Santri}*\n`;
    text += `ID Santri: *${s.ID_Santri}*\n`;
    text += `Pembimbing: *${u ? u.Nama : '-'}*\n\n`;
    text += `*Ringkasan Pencapaian:*\n`;
    text += `- Total Setoran: ${mySetoran.length}\n`;
    text += `- Hafalan Baru: ${baru}\n`;
    text += `- Muroja'ah: ${murojaah}\n`;
    if (last) {
        text += `\n*Setoran Terakhir:*\n`;
        text += `- Surat ${last.Surah} (Juz ${last.Juz}), Ayat ${last.Ayat}\n`;
        text += `- Tanggal: ${last.Tanggal}\n`;
        text += `- Predikat: ${last.Predikat}\n`;
        if (last.Catatan) text += `- Catatan Ustadz: "${last.Catatan}"\n`;
    }
    text += `\nSemoga ananda istiqomah menghafal Al-Qur'an. Aamiin.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function setWaliFilter(filterType) {
    waliFilter = filterType;
    const btnAll = document.getElementById('btnFilterAll');
    const btnBaru = document.getElementById('btnFilterBaru');
    const btnMurojaah = document.getElementById('btnFilterMurojaah');

    if (btnAll) {
        btnAll.className = filterType === 'all'
            ? "px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#9a2024] text-white shadow-xs transition"
            : "px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition";
    }
    if (btnBaru) {
        btnBaru.className = filterType === 'baru'
            ? "px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1c6b45] text-white shadow-xs transition"
            : "px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition";
    }
    if (btnMurojaah) {
        btnMurojaah.className = filterType === 'murojaah'
            ? "px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#9a2024] text-white shadow-xs transition"
            : "px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition";
    }
    renderWaliList();
}

function handleWaliSearch(q) {
    waliSearchQuery = (q || '').toLowerCase().trim();
    renderWaliList();
}

function switchWaliTab(tab) {
    const secHafalan = document.getElementById('waliSectionHafalan');
    const secKeuangan = document.getElementById('waliSectionKeuangan');
    const secProfil = document.getElementById('waliSectionProfil');

    if (secHafalan) secHafalan.classList.toggle('hidden', tab !== 'hafalan');
    if (secKeuangan) secKeuangan.classList.toggle('hidden', tab !== 'keuangan');
    if (secProfil) secProfil.classList.toggle('hidden', tab !== 'profil');

    const activeBtn = "py-2 px-2 rounded-xl text-xs font-bold bg-[#9a2024] text-white shadow-xs transition flex items-center justify-center gap-1.5 relative";
    const inactiveBtn = "py-2 px-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 relative";

    const tHaf = document.getElementById('tabBtnWaliHafalan');
    const tKeu = document.getElementById('tabBtnWaliKeuangan');
    const tPro = document.getElementById('tabBtnWaliProfil');
    if (tHaf) tHaf.className = tab === 'hafalan' ? activeBtn : inactiveBtn;
    if (tKeu) tKeu.className = tab === 'keuangan' ? activeBtn : inactiveBtn;
    if (tPro) tPro.className = tab === 'profil' ? activeBtn : inactiveBtn;

    const bHaf = document.getElementById('navBottomHafalan');
    const bKeu = document.getElementById('navBottomKeuangan');
    const bPro = document.getElementById('navBottomProfil');
    const actBot = "flex flex-col items-center gap-0.5 text-[#9a2024] dark:text-[#f29fa3] text-xs font-bold";
    const inactBot = "flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 text-xs transition";
    if (bHaf) bHaf.className = tab === 'hafalan' ? actBot : inactBot;
    if (bKeu) bKeu.className = tab === 'keuangan' ? actBot : inactBot;
    if (bPro) bPro.className = tab === 'profil' ? actBot : inactBot;
}

function renderWali() {
    const s = state.santri;
    const u = state.ustadz;
    const mySetoran = state.setoran || [];

    if (!s) return;

    const elName = document.getElementById('waliAnakName');
    const elId = document.getElementById('waliAnakId');
    const elInit = document.getElementById('waliAnakInitial');
    const elUstadz = document.getElementById('waliUstadzName');
    const elWali = document.getElementById('waliOrangtuaName');
    const elStatus = document.getElementById('waliStatusBadge');

    if (elName) elName.textContent = s.Nama_Santri;
    if (elId) elId.textContent = s.ID_Santri;
    if (elInit) elInit.textContent = (s.Nama_Santri || 'Z').charAt(0).toUpperCase();
    if (elUstadz) elUstadz.textContent = u ? u.Nama : 'Belum Ditentukan';
    if (elWali) elWali.textContent = s.Nama_Wali || s.Nama_Ayah || '-';
    if (elStatus) {
        elStatus.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span> ${s.Status || 'Santri Aktif'}`;
    }

    const baru = mySetoran.filter(x => x.Jenis === 'Hafalan Baru').length;
    const murojaah = mySetoran.filter(x => x.Jenis === 'Murojaah' || x.Jenis === "Muroja'ah").length;

    const elTotal = document.getElementById('waliTotalSetoran');
    const elBaru = document.getElementById('waliTotalBaru');
    const elMurojaah = document.getElementById('waliTotalMurojaah');

    if (elTotal) elTotal.textContent = mySetoran.length;
    if (elBaru) elBaru.textContent = baru;
    if (elMurojaah) elMurojaah.textContent = murojaah;

    renderWaliList();
    renderWaliKeuangan();
    renderWaliProfil();
}

function renderWaliList() {
    const mySetoran = state.setoran || [];
    const listContainer = document.getElementById('waliSetoranList');
    const emptyState = document.getElementById('waliEmptyState');
    const countDisplay = document.getElementById('waliCountDisplay');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    let filtered = mySetoran;
    if (waliFilter === 'baru') {
        filtered = filtered.filter(x => x.Jenis === 'Hafalan Baru');
    } else if (waliFilter === 'murojaah') {
        filtered = filtered.filter(x => x.Jenis === 'Murojaah' || x.Jenis === "Muroja'ah");
    }

    if (waliSearchQuery) {
        filtered = filtered.filter(x =>
            (x.Surah || '').toLowerCase().includes(waliSearchQuery) ||
            String(x.Juz || '').includes(waliSearchQuery) ||
            String(x.Ayat || '').includes(waliSearchQuery)
        );
    }

    if (countDisplay) {
        countDisplay.textContent = `${filtered.length} riwayat`;
    }

    if (filtered.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        filtered.forEach(set => {
            const isLancar = set.Predikat === 'Lancar';
            const isKurang = set.Predikat === 'Kurang Lancar';
            const bgLeft = isLancar ? 'bg-[#1c6b45]' : isKurang ? 'bg-amber-500' : 'bg-red-500';
            const predIcon = isLancar ? 'fa-circle-check text-[#1c6b45]' : isKurang ? 'fa-circle-exclamation text-amber-500' : 'fa-circle-xmark text-red-500';
            const isBaru = set.Jenis === 'Hafalan Baru';
            const badgeClass = isBaru ? 'bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]' : 'bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/40 dark:text-[#f29fa3]';

            listContainer.innerHTML += `
                <div class="bg-white dark:bg-darkcard rounded-2xl shadow-xs border border-gray-100 dark:border-darkborder p-4 overflow-hidden relative transition hover:shadow-sm">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 ${bgLeft}"></div>
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs font-bold flex items-center justify-center text-gray-700 dark:text-gray-300">
                                ${set.SurahNo || 'QS'}
                            </span>
                            <div>
                                <h4 class="font-bold text-gray-900 dark:text-white text-base leading-tight">${set.Surah}</h4>
                                <p class="text-[11px] text-gray-500 dark:text-gray-400">Juz ${set.Juz} &bull; Hal ${set.Halaman}</p>
                            </div>
                        </div>
                        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeClass}">
                            ${set.Jenis}
                        </span>
                    </div>

                    <div class="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-2.5 my-2.5 flex items-center justify-between text-xs">
                        <span class="text-gray-600 dark:text-gray-300 font-medium">
                            <i class="fa-solid fa-lines-leaning mr-1 text-gray-400"></i> Ayat ${set.Ayat}
                        </span>
                        <span class="font-bold flex items-center gap-1.5">
                            <i class="fa-solid ${predIcon}"></i> ${set.Predikat}
                        </span>
                    </div>

                    ${set.Catatan ? `
                    <div class="bg-[#edf7f2] dark:bg-[#12452c]/20 border border-[#b2dfc8]/50 dark:border-[#12452c]/50 rounded-xl p-2.5 mb-2 text-xs text-[#1c6b45] dark:text-[#83c9a6] flex items-start gap-2">
                        <i class="fa-solid fa-comment-dots mt-0.5"></i>
                        <span class="italic leading-relaxed">"${set.Catatan}"</span>
                    </div>
                    ` : ''}

                    <div class="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-100 dark:border-darkborder/50">
                        <span><i class="fa-regular fa-calendar mr-1"></i>${set.Tanggal}</span>
                        <span><i class="fa-solid fa-check-double text-[#1c6b45] mr-1"></i>Tersimpan di Sheets</span>
                    </div>
                </div>
            `;
        });
    }
}

function renderWaliKeuangan() {
    const myTagihan = state.tagihan || [];
    const listEl = document.getElementById('waliTagihanList');
    const badgeUnpaid = document.getElementById('badgeWaliTagihanCount');
    if (!listEl) return;

    const unpaidList = myTagihan.filter(t => t.Status !== 'Lunas');
    const paidList = myTagihan.filter(t => t.Status === 'Lunas');
    const totalUnpaid = unpaidList.reduce((sum, t) => sum + (Number(t.Nominal) || 0), 0);
    const totalPaid = paidList.reduce((sum, t) => sum + (Number(t.Nominal) || 0), 0);

    const elUnpaid = document.getElementById('waliKeuBelum');
    const elUnpaidCount = document.getElementById('waliKeuBelumCount');
    const elPaid = document.getElementById('waliKeuLunas');
    const elPaidCount = document.getElementById('waliKeuLunasCount');

    if (elUnpaid) elUnpaid.textContent = formatRupiah(totalUnpaid);
    if (elUnpaidCount) elUnpaidCount.textContent = `${unpaidList.length} Tagihan`;
    if (elPaid) elPaid.textContent = formatRupiah(totalPaid);
    if (elPaidCount) elPaidCount.textContent = `${paidList.length} Tagihan`;

    if (badgeUnpaid) {
        if (unpaidList.length > 0) {
            badgeUnpaid.textContent = unpaidList.length;
            badgeUnpaid.classList.remove('hidden');
            badgeUnpaid.classList.add('inline-flex');
        } else {
            badgeUnpaid.classList.add('hidden');
            badgeUnpaid.classList.remove('inline-flex');
        }
    }

    listEl.innerHTML = '';
    if (myTagihan.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-8 px-4 bg-white dark:bg-darkcard rounded-2xl border border-dashed border-gray-200 dark:border-darkborder text-xs text-gray-500">
                Alhamdulillah, belum ada tagihan aktif saat ini.
            </div>
        `;
    } else {
        myTagihan.forEach(t => {
            const isLunas = t.Status === 'Lunas';
            const borderLeft = isLunas ? 'bg-[#1c6b45]' : 'bg-[#9a2024]';
            const badge = isLunas
                ? `<span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]"><i class="fa-solid fa-circle-check mr-1"></i>LUNAS</span>`
                : `<span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/50 dark:text-[#f29fa3]"><i class="fa-solid fa-clock mr-1"></i>BELUM LUNAS</span>`;

            listEl.innerHTML += `
                <div class="bg-white dark:bg-darkcard rounded-2xl shadow-xs border border-gray-100 dark:border-darkborder p-4 overflow-hidden relative">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 ${borderLeft}"></div>
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">${t.Kategori || 'Administrasi'}</span>
                            <h4 class="font-bold text-gray-900 dark:text-white text-sm leading-snug">${t.Judul_Tagihan}</h4>
                        </div>
                        ${badge}
                    </div>
                    <div class="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-2.5 my-2 flex items-center justify-between">
                        <span class="text-xs text-gray-500">Nominal Tagihan</span>
                        <span class="text-sm font-extrabold text-gray-900 dark:text-white">${formatRupiah(t.Nominal)}</span>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                        <span><i class="fa-regular fa-calendar mr-1"></i>Jatuh Tempo: <b>${t.Jatuh_Tempo || '-'}</b></span>
                        ${isLunas
                            ? `<span class="text-[#1c6b45] dark:text-[#83c9a6] font-semibold"><i class="fa-solid fa-check-double mr-1"></i>Dibayar ${t.Tgl_Bayar || ''}</span>`
                            : `<button onclick="konfirmasiBayarWaliWa('${t.ID_Tagihan}')" class="text-[#1c6b45] dark:text-[#83c9a6] font-bold hover:underline flex items-center gap-1"><i class="fa-brands fa-whatsapp"></i> Konfirmasi Bayar</button>`
                        }
                    </div>
                </div>
            `;
        });
    }
}

function konfirmasiBayarWaliWa(idTagihan = null) {
    const s = state.santri;
    if (!s) return;
    const t = idTagihan ? (state.tagihan || []).find(x => x.ID_Tagihan === idTagihan) : null;
    let pesan = `Assalamu'alaikum Wr. Wb. Admin Bendahara *PPTQ Zadil Qur'an*.\n\nSaya Orang Tua/Wali dari:\n• *Nama Santri:* ${s.Nama_Santri}\n• *ID Santri:* ${s.ID_Santri}\n\n`;
    if (t) {
        pesan += `Ingin mengonfirmasi pembayaran tagihan:\n• *Tagihan:* ${t.Judul_Tagihan}\n• *Nominal:* ${formatRupiah(t.Nominal)}\n\n`;
    } else {
        pesan += `Ingin melakukan konfirmasi pembayaran Syahriyah (SPP) / Administrasi Pondok.\n\n`;
    }
    pesan += `Mohon informasi dan verifikasinya. Terima kasih.`;
    window.open(`https://wa.me/6285731804663?text=${encodeURIComponent(pesan)}`, '_blank');
}

function renderWaliProfil() {
    const s = state.santri;
    const card = document.getElementById('waliProfilCardContent');
    if (!s || !card) return;
    const ttl = [s.Tempat_Lahir, s.Tanggal_Lahir].filter(Boolean).join(', ') || '-';
    const rtRw = (s.RT || s.RW) ? `RT ${s.RT || '-'} / RW ${s.RW || '-'}` : '';
    const alamatFull = [s.Alamat, rtRw, s.Desa, s.Kecamatan, s.Kab_Kota, s.Provinsi].filter(Boolean).join(', ') || '-';

    card.innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-darkborder">
            <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#9a2024] dark:text-[#f29fa3]">Nomor Induk Santri (Kode ZQ)</span>
                <div class="font-mono font-extrabold text-sm text-gray-900 dark:text-white">${s.ID_Santri}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]">${s.Status || 'Aktif'}</span>
        </div>
        <div class="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div><span class="text-gray-400 block text-[11px]">Nama Lengkap</span><span class="font-bold text-gray-800 dark:text-white">${s.Nama_Santri || '-'}</span></div>
            <div><span class="text-gray-400 block text-[11px]">Nama Panggilan</span><span class="font-semibold text-gray-800 dark:text-white">${s.Nama_Panggilan || '-'}</span></div>
            <div><span class="text-gray-400 block text-[11px]">Jenis Kelamin</span><span class="font-semibold text-gray-800 dark:text-white">${s.Jenis_Kelamin || '-'}</span></div>
            <div><span class="text-gray-400 block text-[11px]">Tempat, Tanggal Lahir</span><span class="font-semibold text-gray-800 dark:text-white">${ttl}</span></div>
            <div><span class="text-gray-400 block text-[11px]">Pendidikan Terakhir</span><span class="font-semibold text-gray-800 dark:text-white">${s.Pendidikan_Terakhir || '-'} (${s.Tahun_Lulus || '-'})</span></div>
            <div><span class="text-gray-400 block text-[11px]">Sekolah Asal</span><span class="font-semibold text-gray-800 dark:text-white">${s.Sekolah_Asal || '-'}</span></div>
        </div>
        <div class="pt-2 border-t border-gray-100 dark:border-darkborder text-xs">
            <span class="text-gray-400 block text-[11px]">Alamat Lengkap Rumah</span>
            <span class="font-semibold text-gray-800 dark:text-white leading-relaxed">${alamatFull}</span>
        </div>
        <div class="pt-2 border-t border-gray-100 dark:border-darkborder grid grid-cols-2 gap-3 text-xs">
            <div><span class="text-gray-400 block text-[11px]">Nama Ayah</span><span class="font-semibold text-gray-800 dark:text-white">${s.Nama_Ayah || '-'}</span></div>
            <div><span class="text-gray-400 block text-[11px]">Pekerjaan Ayah</span><span class="font-semibold text-gray-800 dark:text-white">${s.Pekerjaan_Ayah || '-'}</span></div>
            <div><span class="text-gray-400 block text-[11px]">Nama Ibu</span><span class="font-semibold text-gray-800 dark:text-white">${s.Nama_Ibu || '-'}</span></div>
            <div><span class="text-gray-400 block text-[11px]">Pekerjaan Ibu</span><span class="font-semibold text-gray-800 dark:text-white">${s.Pekerjaan_Ibu || '-'}</span></div>
            <div><span class="text-gray-400 block text-[11px]">Nama Wali</span><span class="font-semibold text-gray-800 dark:text-white">${s.Nama_Wali || '-'}</span></div>
            <div><span class="text-gray-400 block text-[11px]">No. HP / WhatsApp Ortu</span><span class="font-semibold text-[#1c6b45] dark:text-[#83c9a6]">${s.No_HP_Wali || '-'}</span></div>
        </div>
        <div class="pt-3 border-t border-dashed border-gray-200 dark:border-darkborder text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
            <p class="font-bold text-gray-700 dark:text-gray-300"><i class="fa-solid fa-folder-open text-[#9a2024] mr-1"></i> Kelengkapan Berkas Fisik (Diserahkan ke Pondok):</p>
            <p>&bull; Pas Foto 3x4 berkopyah/berkerudung (3 lembar) &bull; FC Ijazah, Raport, KK, Akta Kelahiran (masing-masing 2 lembar).</p>
        </div>
    `;
}

function loadWaliData() {
    AppNotify.loading('Memuat Data Santri...');
    apiCall('fetchWaliData', sessionData.id).then(res => {
        AppNotify.close();
        if (res.status === 'success') {
            state = { ...state, ...res.data };
            updateBrandingDOM(state.appName);
            renderWali();
        } else {
            AppNotify.error('Gagal Memuat Data', res.message);
        }
    }).catch(() => AppNotify.close());
}

window.addEventListener('DOMContentLoaded', () => {
    initPwa();
    if (!checkExistingSession() || !sessionData || sessionData.role !== 'walisantri') {
        window.location.href = 'login.html?tab=wali';
        return;
    }
    loadWaliData();
});

