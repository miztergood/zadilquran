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

    const ziyadah = mySetoran.filter(x => x.Jenis === 'Ziyadah' || x.Jenis === 'Hafalan Baru').length;
    const murojaah = mySetoran.filter(x => x.Jenis === 'Murojaah' || x.Jenis === "Muroja'ah").length;
    const binnadhor = mySetoran.filter(x => x.Jenis === 'Binnadhor').length;
    const tasmi = mySetoran.filter(x => (x.Jenis || '').toLowerCase().includes('tasmi')).length;
    const last = mySetoran.length > 0 ? mySetoran[0] : null;

    let text = `*BUKU MUTABA'AH SETORAN HARIAN SANTRI*\n`;
    text += `*${state.appName || 'PPTQ Zadil Quran'}*\n\n`;
    text += `Nama Santri: *${s.Nama_Santri}*\n`;
    text += `ID Santri: *${s.ID_Santri}*\n`;
    text += `Pembimbing: *${u ? u.Nama : '-'}*\n\n`;
    text += `*Ringkasan Mutaba'ah:*\n`;
    text += `• Total Sesi: ${mySetoran.length}\n`;
    text += `• Ziyadah (Hafalan Baru): ${ziyadah}\n`;
    text += `• Muroja'ah (Pengulangan): ${murojaah}\n`;
    text += `• Binnadhor (Melihat Mushaf/Jilid): ${binnadhor}\n`;
    text += `• Tasmi' (Ujian Simakan Bil-Ghoib): ${tasmi}\n`;
    if (last) {
        const nilaiText = last.Nilai || last.Predikat || 'Mumtaz';
        const isJilid = last.Tingkatan === 'Jilid';
        text += `\n*Setoran Terakhir (${last.TM || 'TM'}):*\n`;
        text += `• Tingkatan: ${last.Tingkatan || "Al-Qur'an"}\n`;
        text += `• Materi: ${last.Surah} (${isJilid ? last.Juz : 'Juz ' + last.Juz}), ${isJilid ? 'Baris/Materi ' : 'Ayat '}${last.Ayat}, Hal ${last.Halaman}\n`;
        text += `• Kategori: ${last.Jenis}\n`;
        text += `• Nilai: ${nilaiText}\n`;
        text += `• Tanggal: ${last.Tanggal}\n`;
        text += `• Paraf Pengampu: ${last.ParafUstadz || (u ? u.Nama : 'Ustadz Pembimbing')}\n`;
        if (last.Catatan) text += `• Catatan Ustadz: "${last.Catatan}"\n`;
    }
    text += `\n_"Bacalah Al-Qur'an karena dia akan datang pada hari kiamat sebagai penolong bagi pembacanya." (HR. Muslim)_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function cetakMutabaahWali() {
    const s = state.santri;
    const u = state.ustadz;
    const mySetoran = state.setoran || [];
    if (!s) return;

    const logoUrl = new URL('logo.jpg', window.location.href).href;
    const rowsHtml = mySetoran.length === 0
        ? `<tr><td colspan="7" style="text-align:center;padding:20px;color:#64748b;">Belum ada catatan setoran harian.</td></tr>`
        : mySetoran.map((item, idx) => {
            const nilai = item.Nilai || item.Predikat || 'Mumtaz';
            const tm = item.TM || `TM-${mySetoran.length - idx}`;
            const tingkatan = item.Tingkatan || "Al-Qur'an";
            const suratJilid = tingkatan === 'Jilid'
                ? `${item.Surah || '-'} (${item.Juz || '-'})`
                : `QS. ${item.Surah || '-'} (Juz ${item.Juz || '-'})`;
            const ayatHal = `${tingkatan === 'Jilid' ? 'Baris ' : 'Ayat '}${item.Ayat || '-'} / Hal ${item.Halaman || '-'}`;
            const paraf = item.ParafUstadz || (u ? u.Nama : 'Disahkan');
            return `
                <tr>
                    <td style="text-align:center;font-weight:700;">${tm}</td>
                    <td>${item.Tanggal || '-'}</td>
                    <td style="text-align:center;font-weight:700;">${item.Jenis || '-'}</td>
                    <td><strong>${suratJilid}</strong><br><span style="font-size:10px;color:#475569;">${ item.Catatan ? 'Catatan: ' + item.Catatan : '' }</span></td>
                    <td style="text-align:center;">${ayatHal}</td>
                    <td style="text-align:center;font-weight:700;">${nilai}</td>
                    <td style="text-align:center;color:#1c6b45;font-weight:700;">&#10003; ${paraf}</td>
                </tr>
            `;
        }).join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Buku Mutaba'ah Harian - ${s.Nama_Santri}</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', Arial, sans-serif; }
  body { margin: 0; padding: 16px; color: #1e293b; background: #f8fafc; }
  .sheet { max-width: 780px; margin: 0 auto; background: #fff; border: 2px solid #1c6b45; border-radius: 12px; padding: 22px 26px; }
  .header { display: flex; align-items: center; gap: 14px; border-bottom: 3px double #1c6b45; padding-bottom: 12px; margin-bottom: 14px; }
  .header img { width: 58px; height: 58px; object-fit: contain; }
  .header-text h1 { margin: 0; font-size: 16px; color: #1c6b45; text-transform: uppercase; letter-spacing: 0.4px; }
  .header-text h2 { margin: 2px 0; font-size: 13px; color: #9a2024; font-weight: 800; }
  .header-text p { margin: 0; font-size: 10.5px; color: #475569; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  th { background: #1c6b45; color: #fff; padding: 8px 6px; text-transform: uppercase; font-size: 10.5px; border: 1px solid #155235; }
  td { padding: 7px 6px; border: 1px solid #cbd5e1; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafc; }
  .hadits { margin-top: 16px; padding: 10px 14px; background: #f8fafc; border-left: 4px solid #1c6b45; font-size: 11.5px; font-style: italic; color: #334155; }
  .no-print { text-align: center; margin-bottom: 14px; }
  .btn { display: inline-block; padding: 9px 18px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; border: none; margin: 0 4px; }
  .btn-primary { background: #1c6b45; color: #fff; }
  .btn-close { background: #e2e8f0; color: #334155; }
  @media print { body { background: #fff; padding: 0; } .no-print { display: none !important; } .sheet { border-width: 1.5px; } }
</style>
</head>
<body>
  <div class="no-print">
    <button class="btn btn-primary" onclick="window.print()">&#128424; Cetak / Simpan PDF Buku Mutaba'ah</button>
    <button class="btn btn-close" onclick="window.close()">Tutup</button>
  </div>
  <div class="sheet">
    <div class="header">
      <img src="${logoUrl}" alt="Logo Zadilcel" onerror="this.style.display='none'">
      <div class="header-text">
        <h1>Pondok Pesantren Tahfizh Zadil Qur'an</h1>
        <h2>Lembar Buku Mutaba'ah Setoran Harian Santri</h2>
        <p>Program: Ziyadah &bull; Muroja'ah &bull; Binnadhor (Al-Qur'an &amp; Jilid)</p>
      </div>
    </div>
    <div class="meta-grid">
      <div><strong>Nama Santri:</strong> ${s.Nama_Santri}</div>
      <div><strong>ID Santri:</strong> ${s.ID_Santri}</div>
      <div><strong>Ustadz Pengampu:</strong> ${u ? u.Nama : 'Belum Ditentukan'}</div>
      <div><strong>Total Pertemuan:</strong> ${mySetoran.length} Sesi Tatap Muka</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:9%;">TM</th>
          <th style="width:15%;">Tanggal</th>
          <th style="width:13%;">Kategori</th>
          <th style="width:27%;">Surat / Jilid &amp; Catatan</th>
          <th style="width:14%;">Ayat / Hal</th>
          <th style="width:10%;">Nilai</th>
          <th style="width:12%;">Paraf Ustadz</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    <div class="hadits">
      "Bacalah Al-Qur'an karena dia akan datang pada hari kiamat sebagai penolong bagi pembacanya." <strong>(HR. Muslim)</strong>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function(){ window.print(); }, 400); };</script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=860,height=720,scrollbars=yes');
    if (!win) {
        AppNotify.toast('Izinkan pop-up browser untuk mengunduh PDF Mutaba\'ah', 'warning');
        return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
}

function setWaliFilter(filterType) {
    waliFilter = filterType;
    const btnAll = document.getElementById('btnFilterAll');
    const btnBaru = document.getElementById('btnFilterBaru');
    const btnMurojaah = document.getElementById('btnFilterMurojaah');
    const btnBinnadhor = document.getElementById('btnFilterBinnadhor');
    const btnTasmi = document.getElementById('btnFilterTasmi');

    const inactiveClass = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition";

    if (btnAll) {
        btnAll.className = (filterType === 'all')
            ? "px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#9a2024] text-white shadow-xs transition"
            : inactiveClass;
    }
    if (btnBaru) {
        btnBaru.className = (filterType === 'ziyadah' || filterType === 'baru')
            ? "px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1c6b45] text-white shadow-xs transition"
            : inactiveClass;
    }
    if (btnMurojaah) {
        btnMurojaah.className = (filterType === 'murojaah')
            ? "px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#9a2024] text-white shadow-xs transition"
            : inactiveClass;
    }
    if (btnBinnadhor) {
        btnBinnadhor.className = (filterType === 'binnadhor')
            ? "px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 text-white shadow-xs transition"
            : inactiveClass;
    }
    if (btnTasmi) {
        btnTasmi.className = (filterType === 'tasmi')
            ? "px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-xs transition"
            : inactiveClass;
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
    const actBot = "bottom-nav-btn active text-[#9a2024] dark:text-[#f29fa3] font-bold";
    const inactBot = "bottom-nav-btn text-gray-500 dark:text-gray-400";
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

    const baru = mySetoran.filter(x => x.Jenis === 'Ziyadah' || x.Jenis === 'Hafalan Baru').length;
    const murojaah = mySetoran.filter(x => x.Jenis === 'Murojaah' || x.Jenis === "Muroja'ah").length;
    const binnadhor = mySetoran.filter(x => x.Jenis === 'Binnadhor').length;
    const tasmi = mySetoran.filter(x => (x.Jenis || '').toLowerCase().includes('tasmi')).length;

    const elTotal = document.getElementById('waliTotalSetoran');
    const elBaru = document.getElementById('waliTotalBaru');
    const elMurojaah = document.getElementById('waliTotalMurojaah');
    const elBinnadhor = document.getElementById('waliTotalBinnadhor');
    const elTasmi = document.getElementById('waliTotalTasmi');

    if (elTotal) elTotal.textContent = mySetoran.length;
    if (elBaru) elBaru.textContent = baru;
    if (elMurojaah) elMurojaah.textContent = murojaah;
    if (elBinnadhor) elBinnadhor.textContent = binnadhor;
    if (elTasmi) elTasmi.textContent = tasmi;

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
    if (waliFilter === 'ziyadah' || waliFilter === 'baru') {
        filtered = filtered.filter(x => x.Jenis === 'Ziyadah' || x.Jenis === 'Hafalan Baru');
    } else if (waliFilter === 'murojaah') {
        filtered = filtered.filter(x => x.Jenis === 'Murojaah' || x.Jenis === "Muroja'ah");
    } else if (waliFilter === 'binnadhor') {
        filtered = filtered.filter(x => x.Jenis === 'Binnadhor');
    } else if (waliFilter === 'tasmi') {
        filtered = filtered.filter(x => (x.Jenis || '').toLowerCase().includes('tasmi'));
    }

    if (waliSearchQuery) {
        filtered = filtered.filter(x =>
            (x.Surah || '').toLowerCase().includes(waliSearchQuery) ||
            String(x.Juz || '').toLowerCase().includes(waliSearchQuery) ||
            String(x.Ayat || '').toLowerCase().includes(waliSearchQuery) ||
            String(x.TM || '').toLowerCase().includes(waliSearchQuery)
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
            const nilaiText = set.Nilai || set.Predikat || 'Mumtaz';
            const isMumtaz = nilaiText === 'Mumtaz' || nilaiText === 'Lancar';
            const isJayyid = nilaiText === 'Jayyid' || nilaiText === 'Kurang Lancar';
            const bgLeft = isMumtaz ? 'bg-[#1c6b45]' : isJayyid ? 'bg-amber-500' : 'bg-red-500';
            const predIcon = isMumtaz ? 'fa-circle-check text-[#1c6b45]' : isJayyid ? 'fa-circle-exclamation text-amber-500' : 'fa-circle-xmark text-red-500';

            const isZiyadah = set.Jenis === 'Ziyadah' || set.Jenis === 'Hafalan Baru';
            const isBinnadhor = set.Jenis === 'Binnadhor';
            const isTasmi = (set.Jenis || '').toLowerCase().includes('tasmi');
            const badgeClass = isZiyadah
                ? 'bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]'
                : isBinnadhor
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : isTasmi
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/40 dark:text-[#f29fa3]';

            const isJilid = set.Tingkatan === 'Jilid';
            const tingkatanLabel = isJilid ? 'Jilid / Tahsin' : "Al-Qur'an";
            const tmLabel = set.TM || 'TM';
            const parafText = set.ParafUstadz || (state.ustadz ? state.ustadz.Nama : 'Ustadz Pembimbing');

            listContainer.innerHTML += `
                <div class="bg-white dark:bg-darkcard rounded-2xl shadow-xs border border-gray-100 dark:border-darkborder p-4 overflow-hidden relative transition hover:shadow-sm">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 ${bgLeft}"></div>
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <div class="flex items-center gap-2.5">
                            <span class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs font-bold flex items-center justify-center text-gray-700 dark:text-gray-300">
                                ${isJilid ? 'JLD' : (set.SurahNo || 'QS')}
                            </span>
                            <div>
                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">${tmLabel}</span>
                                    <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400">&bull; ${tingkatanLabel}</span>
                                </div>
                                <h4 class="font-bold text-gray-900 dark:text-white text-base leading-tight mt-0.5">${set.Surah}</h4>
                                <p class="text-[11px] text-gray-500 dark:text-gray-400">${isJilid ? set.Juz : 'Juz ' + set.Juz} &bull; Hal ${set.Halaman}</p>
                            </div>
                        </div>
                        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeClass}">
                            ${set.Jenis}
                        </span>
                    </div>

                    <div class="bg-gray-50 dark:bg-slate-800/60 rounded-xl p-2.5 my-2.5 flex items-center justify-between text-xs">
                        <span class="text-gray-600 dark:text-gray-300 font-medium">
                            <i class="fa-solid fa-lines-leaning mr-1 text-gray-400"></i> ${isJilid ? 'Baris / Materi:' : 'Ayat'} ${set.Ayat}
                        </span>
                        <span class="font-bold flex items-center gap-1.5">
                            <i class="fa-solid ${predIcon}"></i> Nilai: ${nilaiText}
                        </span>
                    </div>

                    ${set.Catatan ? `
                    <div class="bg-[#edf7f2] dark:bg-[#12452c]/20 border border-[#b2dfc8]/50 dark:border-[#12452c]/50 rounded-xl p-2.5 mb-2 text-xs text-[#1c6b45] dark:text-[#83c9a6] flex items-start gap-2">
                        <i class="fa-solid fa-comment-dots mt-0.5"></i>
                        <span class="italic leading-relaxed">"${set.Catatan}"</span>
                    </div>
                    ` : ''}

                    <div class="flex items-center justify-between text-[11px] text-gray-400 pt-1.5 border-t border-gray-100 dark:border-darkborder/50">
                        <span><i class="fa-regular fa-calendar mr-1"></i>${set.Tanggal}</span>
                        <span class="text-[#1c6b45] dark:text-[#83c9a6] font-semibold"><i class="fa-solid fa-signature mr-1"></i>Paraf: ${parafText}</span>
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
    if (elPaidCount) elPaidCount.textContent = `${paidList.length} Kwitansi Tersedia`;

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
                            ? `<button onclick="unduhKwitansiWali('${t.ID_Tagihan}')" class="px-2.5 py-1 rounded-lg bg-[#edf7f2] hover:bg-[#d8eedf] text-[#1c6b45] dark:bg-[#12452c]/50 dark:hover:bg-[#12452c] dark:text-[#83c9a6] font-bold text-xs flex items-center gap-1.5 transition shadow-xs" title="Unduh Kwitansi PDF">
                                <i class="fa-solid fa-file-invoice text-xs"></i>
                                <span>Unduh Kwitansi</span>
                               </button>`
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

function unduhKwitansiWali(idTagihan) {
    const t = (state.tagihan || []).find(x => x.ID_Tagihan === idTagihan);
    if (!t) {
        AppNotify.toast('Data tagihan tidak ditemukan', 'warning');
        return;
    }
    cetakKwitansiResmi(t, state.santri);
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

