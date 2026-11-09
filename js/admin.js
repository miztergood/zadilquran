/**
 * ============================================================================
 * ZADIL QURAN - SUPERADMIN MODULE (js/admin.js)
 * Digunakan oleh admin.html
 * Mencakup: Dashboard Global, Modul 1 (Buku Induk Santri ZQ-),
 * Modul 2 (Keuangan & Syahriyah SPP), Data Ustadz, dan Pengaturan.
 * ============================================================================
 */

let state = {
    ustadz: [],
    santri: [],
    setoran: [],
    tagihan: [],
    appName: "Zadil Quran",
    currentAdminMenu: 'dashboard'
};
let editModeId = null;

// --- SEARCH & PAGINATION STATE ---
let tableConfig = {
    ustadz: { page: 1, limit: 10, query: '' },
    santri: { page: 1, limit: 10, query: '' },
    tagihan: { page: 1, limit: 10, query: '' }
};

function getPaginatedData(data, searchKeys, configKey) {
    const conf = tableConfig[configKey];
    let filtered = data || [];
    if (conf.query) {
        const q = conf.query.toLowerCase();
        filtered = filtered.filter(row => searchKeys.some(key => String(row[key] || "").toLowerCase().includes(q)));
    }
    const totalPages = Math.ceil(filtered.length / conf.limit) || 1;
    if (conf.page > totalPages) conf.page = totalPages;

    const start = (conf.page - 1) * conf.limit;
    const pageData = filtered.slice(start, start + conf.limit);
    return { pageData, totalPages, currentPage: conf.page };
}

function renderPaginationHtml(configKey, totalPages) {
    const conf = tableConfig[configKey];
    return `
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 w-full">
            <span>Halaman ${conf.page} dari ${totalPages}</span>
            <div class="flex gap-2">
                <button onclick="changePage('${configKey}', -1, ${totalPages})" class="px-3 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-darkborder rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs" ${conf.page <= 1 ? 'disabled' : ''}>Prev</button>
                <button onclick="changePage('${configKey}', 1, ${totalPages})" class="px-3 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-darkborder rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs" ${conf.page >= totalPages ? 'disabled' : ''}>Next</button>
            </div>
        </div>
    `;
}

function changePage(configKey, direction, maxPage) {
    tableConfig[configKey].page += direction;
    if (configKey === 'ustadz') renderTableUstadz();
    if (configKey === 'santri') renderTableSantri();
    if (configKey === 'tagihan') renderTableTagihan();
}

function handleSearch(configKey, query) {
    tableConfig[configKey].query = query;
    tableConfig[configKey].page = 1;
    if (configKey === 'ustadz') renderTableUstadz();
    if (configKey === 'santri') renderTableSantri();
    if (configKey === 'tagihan') renderTableTagihan();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.toggle('hidden');
}

// --- SIDEBAR & MENU NAVIGATION ---
function detectInitialAdminMenu() {
    const params = new URLSearchParams(window.location.search);
    const menuParam = params.get('menu');
    if (menuParam && ['dashboard', 'santri', 'keuangan', 'ustadz', 'pengaturan'].includes(menuParam)) {
        return menuParam;
    }
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/santri')) return 'santri';
    if (path.includes('/keuangan') || path.includes('/spp')) return 'keuangan';
    if (path.includes('/ustadz')) return 'ustadz';
    if (path.includes('/pengaturan')) return 'pengaturan';
    return 'dashboard';
}

function switchAdmin(menuId, pushHistory = true) {
    state.currentAdminMenu = menuId;
    if (pushHistory) {
        const newUrl = menuId === 'dashboard' ? 'admin.html' : `admin.html?menu=${menuId}`;
        try {
            window.history.pushState({ menu: menuId }, '', newUrl);
        } catch (e) { }
    }
    buildSidebarMenu();
    updateBottomNavState();
    loadContent();
    if (window.innerWidth < 768 && !document.getElementById('sidebar').classList.contains('-translate-x-full')) {
        toggleSidebar();
    }
}

window.addEventListener('popstate', () => {
    state.currentAdminMenu = detectInitialAdminMenu();
    buildSidebarMenu();
    updateBottomNavState();
    loadContent();
});

function updateBottomNavState() {
    const menus = ['dashboard', 'santri', 'keuangan', 'ustadz', 'pengaturan'];
    menus.forEach(m => {
        const btn = document.getElementById(`bottomNav-${m}`);
        if (!btn) return;
        if (state.currentAdminMenu === m) {
            btn.className = "bottom-nav-btn active text-[#9a2024] dark:text-[#f29fa3] font-bold";
        } else {
            btn.className = "bottom-nav-btn text-gray-500 dark:text-gray-400";
        }
    });
}

function openModalTambahSantri() {
    if (state.currentAdminMenu !== 'santri') {
        switchAdmin('santri');
    }
    setTimeout(() => {
        if (typeof openModalSantri === 'function') openModalSantri();
    }, 120);
}

function bukaWhatsAppBantuan() {
    window.open('https://wa.me/6285731804663', '_blank');
}

function buildSidebarMenu() {
    const menu = document.getElementById('sidebarMenu');
    if (!menu) return;
    menu.innerHTML = '';
    const cItem = (id, icon, text) => {
        const isActive = state.currentAdminMenu === id;
        const activeClass = isActive ? "bg-[#9a2024] text-white shadow-inner font-semibold" : "text-white/80 hover:bg-white/10";
        return `<div onclick="switchAdmin('${id}')" class="flex items-center gap-3 w-full p-3 rounded-xl transition cursor-pointer text-sm ${activeClass}"><i class="fa-solid ${icon} w-5 text-center"></i> <span>${text}</span></div>`;
    };
    menu.innerHTML += cItem('dashboard', 'fa-gauge', 'Dashboard Global');
    menu.innerHTML += cItem('santri', 'fa-id-card', 'Buku Induk Santri');
    menu.innerHTML += cItem('keuangan', 'fa-file-invoice-dollar', 'Keuangan & SPP');
    menu.innerHTML += cItem('ustadz', 'fa-user-tie', 'Data Ustadz');
    menu.innerHTML += cItem('pengaturan', 'fa-gear', 'Pengaturan');
}

function loadContent() {
    const container = document.getElementById('contentArea');
    if (!container) return;
    container.innerHTML = '';

    const tplId = `tpl-superadmin-${state.currentAdminMenu}`;
    const tplElement = document.getElementById(tplId);
    if (tplElement) {
        container.appendChild(tplElement.content.cloneNode(true));
    } else {
        container.innerHTML = '<p class="text-red-500 p-4">Error: Layout tidak ditemukan.</p>';
        return;
    }

    updateBrandingDOM(state.appName);

    if (state.currentAdminMenu === 'dashboard') {
        document.getElementById('statSantri').textContent = state.santri.length;
        document.getElementById('statUstadz').textContent = state.ustadz.length;
        document.getElementById('statSetoran').textContent = state.setoran.length;
        const totalLunas = (state.tagihan || []).filter(t => t.Status === 'Lunas').reduce((sum, t) => sum + (Number(t.Nominal) || 0), 0);
        const elKeu = document.getElementById('statKeuanganMasuk');
        if (elKeu) elKeu.textContent = formatRupiah(totalLunas);
    } else if (state.currentAdminMenu === 'ustadz') {
        renderTableUstadz();
    } else if (state.currentAdminMenu === 'santri') {
        renderTableSantri();
    } else if (state.currentAdminMenu === 'keuangan') {
        renderTableTagihan();
    } else if (state.currentAdminMenu === 'pengaturan') {
        document.getElementById('inputPondokName').value = state.appName;
        initAdminPsbSettings();
    }
}

function refreshAdminData() {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    AppNotify.loading('Memuat Data Pesantren...');
    apiCall('fetchAppData', token).then(res => {
        AppNotify.close();
        if (res.status === 'success') {
            state = { ...state, ...res.data };
            updateBrandingDOM(state.appName);
            loadContent();
        } else {
            AppNotify.error('Gagal Memuat Data', res.message);
        }
    }).catch(() => AppNotify.close());
}

// ==================== CRUD USTADZ ====================
function generateUstadzCreds() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('inputUstadzUsername').value = 'ustadz' + randomNum;
    document.getElementById('inputUstadzPassword').value = Math.random().toString(36).slice(-6);
}

function openModalUstadz(idToEdit = null, isDuplicate = false) {
    document.getElementById('formTambahUstadz').reset();
    const title = document.getElementById('titleModalUstadz');

    if (idToEdit) {
        const u = state.ustadz.find(x => x.ID_Ustadz === idToEdit);
        if (u) {
            document.getElementById('inputUstadzName').value = u.Nama + (isDuplicate ? " (Copy)" : "");
            if (isDuplicate) {
                generateUstadzCreds();
                editModeId = null;
                title.textContent = 'Duplikasi Data Ustadz';
            } else {
                document.getElementById('inputUstadzUsername').value = u.Username;
                document.getElementById('inputUstadzPassword').value = u.Password;
                editModeId = idToEdit;
                title.textContent = 'Edit Data Ustadz';
            }
        }
    } else {
        editModeId = null;
        title.textContent = 'Tambah Ustadz Baru';
        generateUstadzCreds();
    }

    const modal = document.getElementById('modalUstadz');
    const content = document.getElementById('modalUstadzContent');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('scale-95'); }, 10);
}

function renderTableUstadz() {
    const tb = document.getElementById('tableUstadzBody');
    if (!tb) return;
    tb.innerHTML = '';
    const paginationResult = getPaginatedData(state.ustadz, ['Nama', 'Username'], 'ustadz');

    if (paginationResult.pageData.length === 0) {
        tb.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500">Data tidak ditemukan</td></tr>';
    } else {
        paginationResult.pageData.forEach(u => {
            const jmlSantri = state.santri.filter(s => s.ID_Ustadz === u.ID_Ustadz).length;
            tb.innerHTML += `
                <tr class="border-b dark:border-darkborder hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td class="p-4 font-bold text-gray-900 dark:text-white">${u.Nama}</td>
                    <td class="p-4 font-mono text-xs text-gray-600 dark:text-gray-400">${u.Username}</td>
                    <td class="p-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]">${jmlSantri} Santri</span></td>
                    <td class="p-4 text-center">
                        <div class="flex justify-center gap-2">
                            <button onclick="openModalUstadz('${u.ID_Ustadz}')" class="text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg transition shadow-xs" title="Edit"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="openModalUstadz('${u.ID_Ustadz}', true)" class="text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg transition shadow-xs" title="Duplicate"><i class="fa-solid fa-copy"></i></button>
                            <button onclick="deleteAction('Users_Ustadz', '${u.ID_Ustadz}', '${u.Nama}')" class="text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 p-2 rounded-lg transition shadow-xs" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('paginationUstadz').innerHTML = renderPaginationHtml('ustadz', paginationResult.totalPages);
}

function saveUstadz(e) {
    e.preventDefault();
    AppNotify.loading('Menyimpan Data Ustadz...');

    const n = document.getElementById('inputUstadzName').value;
    const u = document.getElementById('inputUstadzUsername').value;
    const p = document.getElementById('inputUstadzPassword').value;
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);

    if (editModeId) {
        apiCall('editUstadz', token, editModeId, n, u, p).then(res => handleRes(res, 'modalUstadz'));
    } else {
        apiCall('addUstadz', token, n, u, p).then(res => handleRes(res, 'modalUstadz'));
    }
}

// ==================== MODUL 1: BUKU INDUK SANTRI (ZQ-) ====================
function openModalSantri(idToEdit = null, isDuplicate = false) {
    document.getElementById('formTambahSantri').reset();
    const title = document.getElementById('titleModalSantri');
    const sel = document.getElementById('inputUstadzId');
    sel.innerHTML = '<option value="">-- Belum Ditentukan --</option>';
    state.ustadz.forEach(u => sel.innerHTML += `<option value="${u.ID_Ustadz}">${u.Nama}</option>`);

    const prepData = () => {
        const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        if (idToEdit) {
            const s = state.santri.find(x => x.ID_Santri === idToEdit);
            if (s) {
                document.getElementById('inputSantriName').value = (s.Nama_Santri || '') + (isDuplicate ? " (Copy)" : "");
                document.getElementById('inputSantriPanggilan').value = s.Nama_Panggilan || '';
                document.getElementById('inputSantriGender').value = s.Jenis_Kelamin || 'Laki-laki (Putra)';
                document.getElementById('inputSantriStatus').value = s.Status || 'Aktif';
                document.getElementById('inputTempatLahir').value = s.Tempat_Lahir || '';
                document.getElementById('inputTanggalLahir').value = s.Tanggal_Lahir || '';
                document.getElementById('inputAlamat').value = s.Alamat || '';
                document.getElementById('inputRt').value = s.RT || '';
                document.getElementById('inputRw').value = s.RW || '';
                document.getElementById('inputDesa').value = s.Desa || '';
                document.getElementById('inputKecamatan').value = s.Kecamatan || '';
                document.getElementById('inputKabKota').value = s.Kab_Kota || '';
                document.getElementById('inputProvinsi').value = s.Provinsi || '';
                document.getElementById('inputPendidikan').value = s.Pendidikan_Terakhir || '';
                document.getElementById('inputTahunLulus').value = s.Tahun_Lulus || '';
                document.getElementById('inputSekolahAsal').value = s.Sekolah_Asal || '';
                document.getElementById('inputNamaAyah').value = s.Nama_Ayah || '';
                document.getElementById('inputPekerjaanAyah').value = s.Pekerjaan_Ayah || '';
                document.getElementById('inputPendidikanAyah').value = s.Pendidikan_Ayah || '';
                document.getElementById('inputNamaIbu').value = s.Nama_Ibu || '';
                document.getElementById('inputPekerjaanIbu').value = s.Pekerjaan_Ibu || '';
                document.getElementById('inputPendidikanIbu').value = s.Pendidikan_Ibu || '';
                document.getElementById('inputWaliName').value = s.Nama_Wali || '';
                document.getElementById('inputNoHpWali').value = s.No_HP_Wali || '';
                document.getElementById('inputUstadzId').value = s.ID_Ustadz || "";
            }

            if (isDuplicate) {
                editModeId = null;
                title.innerHTML = '<i class="fa-solid fa-copy text-[#9a2024] mr-2"></i>Duplikasi Buku Induk Santri';
                apiCall('generateNewSantriId', token).then(res => {
                    if (res.status === 'success') document.getElementById('inputSantriId').value = res.data;
                });
            } else {
                editModeId = idToEdit;
                title.innerHTML = '<i class="fa-solid fa-user-pen text-[#9a2024] mr-2"></i>Edit Buku Induk Santri';
                document.getElementById('inputSantriId').value = s ? s.ID_Santri : idToEdit;
            }
        } else {
            editModeId = null;
            title.innerHTML = '<i class="fa-solid fa-id-card text-[#9a2024] mr-2"></i>Tambah Buku Induk Santri';
            document.getElementById('inputSantriStatus').value = 'Aktif';
            document.getElementById('inputSantriId').value = "Memuat ID ZQ...";
            apiCall('generateNewSantriId', token).then(res => {
                if (res.status === 'success') document.getElementById('inputSantriId').value = res.data;
            });
        }
    };

    const modal = document.getElementById('modalSantri');
    const content = document.getElementById('modalSantriContent');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('scale-95'); prepData(); }, 10);
}

function openDetailSantri(idSantri) {
    const s = state.santri.find(x => x.ID_Santri === idSantri);
    if (!s) return;
    const u = state.ustadz.find(x => x.ID_Ustadz === s.ID_Ustadz);
    const ttl = [s.Tempat_Lahir, s.Tanggal_Lahir].filter(Boolean).join(', ') || '-';
    const rtRw = (s.RT || s.RW) ? `RT ${s.RT || '-'} / RW ${s.RW || '-'}` : '';
    const alamatFull = [s.Alamat, rtRw, s.Desa, s.Kecamatan, s.Kab_Kota, s.Provinsi].filter(Boolean).join(', ') || '-';
    const waClean = formatWaNumber(s.No_HP_Wali);

    const btnEdit = document.getElementById('btnDetailEditSantri');
    if (btnEdit) {
        btnEdit.onclick = () => {
            closeModal('modalDetailSantri', 'modalDetailSantriContent');
            openModalSantri(s.ID_Santri);
        };
    }

    const body = document.getElementById('detailSantriBody');
    body.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-darkborder">
            <div class="flex items-center gap-3.5">
                <div class="w-14 h-14 rounded-2xl bg-[#9a2024] text-white font-bold text-2xl flex items-center justify-center shadow-sm">
                    ${(s.Nama_Santri || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/40 dark:text-[#f29fa3]">${s.ID_Santri}</span>
                        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]">${s.Status || 'Aktif'}</span>
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white mt-1">${s.Nama_Santri} ${s.Nama_Panggilan ? `<span class="text-sm font-normal text-gray-500">(${s.Nama_Panggilan})</span>` : ''}</h4>
                    <p class="text-xs text-gray-500">${s.Jenis_Kelamin || '-'} &bull; Pembimbing: <b>${u ? u.Nama : 'Belum Ditentukan'}</b></p>
                </div>
            </div>
            <div class="flex gap-2">
                ${waClean ? `<a href="https://wa.me/${waClean}" target="_blank" class="px-3.5 py-2 rounded-xl bg-[#1c6b45] hover:bg-[#155436] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"><i class="fa-brands fa-whatsapp"></i> Hubungi Wali</a>` : ''}
            </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="bg-gray-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-gray-100 dark:border-darkborder space-y-2">
                <p class="font-bold text-[#9a2024] dark:text-[#f29fa3] uppercase tracking-wider text-[11px]">A. Biodata & Pendidikan</p>
                <div><span class="text-gray-400 block">Tempat, Tanggal Lahir:</span><span class="font-semibold text-gray-800 dark:text-white">${ttl}</span></div>
                <div><span class="text-gray-400 block">Pendidikan Terakhir & Tahun Lulus:</span><span class="font-semibold text-gray-800 dark:text-white">${s.Pendidikan_Terakhir || '-'} (${s.Tahun_Lulus || '-'})</span></div>
                <div><span class="text-gray-400 block">Sekolah Asal:</span><span class="font-semibold text-gray-800 dark:text-white">${s.Sekolah_Asal || '-'}</span></div>
                <div><span class="text-gray-400 block">Alamat Lengkap:</span><span class="font-semibold text-gray-800 dark:text-white leading-relaxed">${alamatFull}</span></div>
            </div>
            <div class="bg-gray-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-gray-100 dark:border-darkborder space-y-2">
                <p class="font-bold text-[#1c6b45] dark:text-[#83c9a6] uppercase tracking-wider text-[11px]">B. Data Orang Tua & Wali</p>
                <div><span class="text-gray-400 block">Nama Ayah (Pekerjaan / Pendidikan):</span><span class="font-semibold text-gray-800 dark:text-white">${s.Nama_Ayah || '-'} (${s.Pekerjaan_Ayah || '-'} / ${s.Pendidikan_Ayah || '-'})</span></div>
                <div><span class="text-gray-400 block">Nama Ibu (Pekerjaan / Pendidikan):</span><span class="font-semibold text-gray-800 dark:text-white">${s.Nama_Ibu || '-'} (${s.Pekerjaan_Ibu || '-'} / ${s.Pendidikan_Ibu || '-'})</span></div>
                <div><span class="text-gray-400 block">Wali Penanggung Jawab:</span><span class="font-semibold text-gray-800 dark:text-white">${s.Nama_Wali || '-'}</span></div>
                <div><span class="text-gray-400 block">No. HP / WhatsApp Orang Tua:</span><span class="font-semibold text-[#1c6b45] dark:text-[#83c9a6]">${s.No_HP_Wali || '-'}</span></div>
            </div>
        </div>
    `;

    const modal = document.getElementById('modalDetailSantri');
    const content = document.getElementById('modalDetailSantriContent');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('scale-95'); }, 10);
}

function renderTableSantri() {
    const tb = document.getElementById('tableSantriBody');
    if (!tb) return;
    tb.innerHTML = '';
    const statusFilter = document.getElementById('filterSantriStatus') ? document.getElementById('filterSantriStatus').value : 'ALL';
    let sourceData = state.santri || [];
    if (statusFilter !== 'ALL' && statusFilter !== 'all') {
        sourceData = sourceData.filter(s => (s.Status || 'Aktif') === statusFilter);
    }

    const paginationResult = getPaginatedData(sourceData, ['Nama_Santri', 'Nama_Panggilan', 'Nama_Wali', 'Nama_Ayah', 'Nama_Ibu', 'ID_Santri', 'Kab_Kota', 'No_HP_Wali'], 'santri');

    if (paginationResult.pageData.length === 0) {
        tb.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-gray-500">Data santri tidak ditemukan</td></tr>';
    } else {
        paginationResult.pageData.forEach(s => {
            const u = state.ustadz.find(us => us.ID_Ustadz === s.ID_Ustadz);
            const ttl = [s.Tempat_Lahir, s.Tanggal_Lahir].filter(Boolean).join(', ') || '-';
            const kota = [s.Kecamatan, s.Kab_Kota].filter(Boolean).join(', ') || s.Alamat || '-';
            const statusText = s.Status || 'Aktif';
            const statusBadge = statusText === 'Aktif'
                ? 'bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]'
                : statusText === 'Calon Santri'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300';
            const waClean = formatWaNumber(s.No_HP_Wali);

            tb.innerHTML += `
                <tr class="border-b dark:border-darkborder hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td class="p-4">
                        <span class="font-mono text-xs text-[#9a2024] dark:text-[#f29fa3] font-bold bg-[#fdf2f2] dark:bg-[#731417]/30 px-2 py-1 rounded-md">${s.ID_Santri}</span>
                    </td>
                    <td class="p-4">
                        <div class="font-bold text-gray-900 dark:text-white">${s.Nama_Santri}</div>
                        <div class="text-[11px] text-gray-500">${s.Jenis_Kelamin || '-'} ${s.Pendidikan_Terakhir ? `&bull; ${s.Pendidikan_Terakhir}` : ''}</div>
                    </td>
                    <td class="p-4">
                        <div class="text-xs font-medium text-gray-700 dark:text-gray-300">${ttl}</div>
                        <div class="text-[11px] text-gray-400 truncate max-w-[180px]" title="${kota}">${kota}</div>
                    </td>
                    <td class="p-4">
                        <div class="text-xs font-semibold text-gray-800 dark:text-gray-200">${s.Nama_Wali || s.Nama_Ayah || '-'}</div>
                        <div class="text-[11px] text-gray-500">${s.No_HP_Wali || '-'}</div>
                    </td>
                    <td class="p-4">
                        <div class="text-xs text-gray-700 dark:text-gray-300 mb-1">${u ? u.Nama : '<span class="text-gray-400 italic">Belum diatur</span>'}</div>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}">${statusText}</span>
                    </td>
                    <td class="p-4 text-center">
                        <div class="flex justify-center gap-1.5">
                            <button onclick="openDetailSantri('${s.ID_Santri}')" class="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 p-2 rounded-lg transition shadow-xs" title="Lihat Buku Induk"><i class="fa-solid fa-eye"></i></button>
                            ${waClean ? `<a href="https://wa.me/${waClean}" target="_blank" class="text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 p-2 rounded-lg transition shadow-xs" title="Chat WA Wali"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
                            <button onclick="openModalSantri('${s.ID_Santri}')" class="text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg transition shadow-xs" title="Edit"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="openModalSantri('${s.ID_Santri}', true)" class="text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg transition shadow-xs" title="Duplicate"><i class="fa-solid fa-copy"></i></button>
                            <button onclick="deleteAction('Data_Santri', '${s.ID_Santri}', '${s.Nama_Santri}')" class="text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 p-2 rounded-lg transition shadow-xs" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('paginationSantri').innerHTML = renderPaginationHtml('santri', paginationResult.totalPages);
}

function saveSantri(e) {
    e.preventDefault();
    AppNotify.loading('Menyimpan Buku Induk Santri...');

    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    const payload = {
        isEdit: Boolean(editModeId),
        idSantri: editModeId || document.getElementById('inputSantriId').value,
        namaSantri: document.getElementById('inputSantriName').value,
        namaPanggilan: document.getElementById('inputSantriPanggilan').value,
        jenisKelamin: document.getElementById('inputSantriGender').value,
        status: document.getElementById('inputSantriStatus').value,
        tempatLahir: document.getElementById('inputTempatLahir').value,
        tanggalLahir: document.getElementById('inputTanggalLahir').value,
        alamat: document.getElementById('inputAlamat').value,
        rt: document.getElementById('inputRt').value,
        rw: document.getElementById('inputRw').value,
        desa: document.getElementById('inputDesa').value,
        kecamatan: document.getElementById('inputKecamatan').value,
        kabKota: document.getElementById('inputKabKota').value,
        provinsi: document.getElementById('inputProvinsi').value,
        pendidikanTerakhir: document.getElementById('inputPendidikan').value,
        tahunLulus: document.getElementById('inputTahunLulus').value,
        sekolahAsal: document.getElementById('inputSekolahAsal').value,
        namaAyah: document.getElementById('inputNamaAyah').value,
        pekerjaanAyah: document.getElementById('inputPekerjaanAyah').value,
        pendidikanAyah: document.getElementById('inputPendidikanAyah').value,
        namaIbu: document.getElementById('inputNamaIbu').value,
        pekerjaanIbu: document.getElementById('inputPekerjaanIbu').value,
        pendidikanIbu: document.getElementById('inputPendidikanIbu').value,
        namaWali: document.getElementById('inputWaliName').value || document.getElementById('inputNamaAyah').value,
        noHpWali: document.getElementById('inputNoHpWali').value,
        idUstadz: document.getElementById('inputUstadzId').value
    };

    apiCall('saveSantriData', token, payload).then(res => handleRes(res, 'modalSantri'));
}

// ==================== MODUL 2: KEUANGAN & SPP (ADMIN) ====================
function renderTableTagihan() {
    const tb = document.getElementById('tableTagihanBody');
    if (!tb) return;
    tb.innerHTML = '';

    const allTagihan = state.tagihan || [];
    const totalLunas = allTagihan.filter(t => t.Status === 'Lunas').reduce((sum, t) => sum + (Number(t.Nominal) || 0), 0);
    const totalPiutang = allTagihan.filter(t => t.Status !== 'Lunas').reduce((sum, t) => sum + (Number(t.Nominal) || 0), 0);

    const elLunas = document.getElementById('keuStatLunas');
    const elPiutang = document.getElementById('keuStatBelum');
    const elCount = document.getElementById('keuStatTotal');
    if (elLunas) elLunas.textContent = formatRupiah(totalLunas);
    if (elPiutang) elPiutang.textContent = formatRupiah(totalPiutang);
    if (elCount) elCount.textContent = `${allTagihan.length} Tagihan`;

    const filterStatus = document.getElementById('filterTagihanStatus') ? document.getElementById('filterTagihanStatus').value : 'ALL';
    const enriched = allTagihan.map(t => {
        const s = (state.santri || []).find(san => san.ID_Santri === t.ID_Santri);
        return {
            ...t,
            Nama_Santri: s ? s.Nama_Santri : 'Santri Terhapus',
            No_HP_Wali: s ? s.No_HP_Wali : ''
        };
    });

    let filtered = enriched;
    if (filterStatus !== 'ALL' && filterStatus !== 'all') {
        filtered = filtered.filter(t => t.Status === filterStatus);
    }

    const paginationResult = getPaginatedData(filtered, ['Nama_Santri', 'ID_Santri', 'Judul_Tagihan', 'Kategori', 'ID_Tagihan'], 'tagihan');

    if (paginationResult.pageData.length === 0) {
        tb.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-gray-500">Belum ada data tagihan yang sesuai filter.</td></tr>';
    } else {
        paginationResult.pageData.forEach(t => {
            const isLunas = t.Status === 'Lunas';
            const badge = isLunas
                ? `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]"><i class="fa-solid fa-circle-check mr-1"></i>Lunas</span>`
                : `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/50 dark:text-[#f29fa3]"><i class="fa-solid fa-clock mr-1"></i>Belum Lunas</span>`;

            tb.innerHTML += `
                <tr class="border-b dark:border-darkborder hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td class="p-4 font-mono text-xs text-gray-500">${t.ID_Tagihan}</td>
                    <td class="p-4">
                        <div class="font-bold text-gray-900 dark:text-white">${t.Nama_Santri}</div>
                        <div class="font-mono text-[11px] text-[#9a2024] dark:text-[#f29fa3]">${t.ID_Santri}</div>
                    </td>
                    <td class="p-4">
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">${t.Kategori || 'Tagihan'}</span>
                        <div class="font-semibold text-gray-800 dark:text-gray-200 mt-1">${t.Judul_Tagihan}</div>
                        ${t.Catatan ? `<div class="text-[11px] text-gray-400 italic">${t.Catatan}</div>` : ''}
                    </td>
                    <td class="p-4 font-bold text-gray-900 dark:text-white">${formatRupiah(t.Nominal)}</td>
                    <td class="p-4 text-xs text-gray-600 dark:text-gray-400">
                        <div class="mb-1">${badge}</div>
                        <div>Tempo: <b>${t.Jatuh_Tempo || '-'}</b></div>
                        ${isLunas ? `<div class="text-[11px] text-[#1c6b45] dark:text-[#83c9a6] mt-0.5">Dibayar: ${t.Tgl_Bayar || '-'} (${t.Metode_Bayar || '-'})</div>` : ''}
                    </td>
                    <td class="p-4 text-center">
                        <div class="flex justify-center gap-1.5">
                            ${!isLunas ? `
                                <button onclick="openModalBayar('${t.ID_Tagihan}')" class="px-2.5 py-1.5 bg-[#1c6b45] hover:bg-[#155436] text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1" title="Tandai Lunas"><i class="fa-solid fa-check"></i> Lunas</button>
                                <button onclick="kirimWaTagihan('${t.ID_Tagihan}')" class="p-2 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg transition shadow-xs" title="Kirim Pengingat WA"><i class="fa-brands fa-whatsapp"></i></button>
                            ` : `
                                <button onclick="cetakKwitansiAdmin('${t.ID_Tagihan}')" class="px-2.5 py-1.5 bg-[#edf7f2] hover:bg-[#d8eedf] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6] rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1" title="Cetak Kwitansi PDF"><i class="fa-solid fa-file-invoice"></i> Kwitansi</button>
                                <button onclick="batalLunasTagihan('${t.ID_Tagihan}')" class="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-gray-300 rounded-lg text-xs font-semibold transition" title="Batalkan Status Lunas"><i class="fa-solid fa-rotate-left"></i> Batal</button>
                            `}
                            <button onclick="deleteTagihanAction('${t.ID_Tagihan}', '${t.Judul_Tagihan}')" class="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition shadow-xs" title="Hapus Tagihan"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });
    }
    const pagEl = document.getElementById('paginationTagihan');
    if (pagEl) pagEl.innerHTML = renderPaginationHtml('tagihan', paginationResult.totalPages);
}

function openModalTagihan(mode = 'INDIVIDU') {
    document.getElementById('formBuatTagihan').reset();
    const sel = document.getElementById('inputTagihanSantri');
    sel.innerHTML = '<option value="ALL_ACTIVE">📢 SELURUH SANTRI AKTIF (Generate Massal)</option>';
    (state.santri || []).forEach(s => {
        sel.innerHTML += `<option value="${s.ID_Santri}">${s.Nama_Santri} (${s.ID_Santri})</option>`;
    });

    const now = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const curMonthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    document.getElementById('inputTagihanTempo').value = `10 ${curMonthYear}`;

    if (String(mode).toUpperCase() === 'MASSAL') {
        sel.value = 'ALL_ACTIVE';
        document.getElementById('inputTagihanKategori').value = 'Syahriyah (SPP)';
        document.getElementById('inputTagihanJudul').value = `Syahriyah (SPP) Bulan ${curMonthYear}`;
        document.getElementById('inputTagihanNominal').value = 200000;
        document.getElementById('inputTagihanCatatan').value = 'SPP Bulanan Santri Mukim';
    } else {
        if (state.santri && state.santri.length > 0) sel.value = state.santri[0].ID_Santri;
        autoFillTagihanPreset(document.getElementById('inputTagihanKategori').value);
    }

    const modal = document.getElementById('modalBuatTagihan');
    const content = document.getElementById('modalBuatTagihanContent');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('scale-95'); }, 10);
}

function autoFillTagihanPreset(val) {
    const now = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const curMonthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    if (val === 'Syahriyah (SPP)') {
        document.getElementById('inputTagihanJudul').value = `Syahriyah (SPP) Bulan ${curMonthYear}`;
        document.getElementById('inputTagihanNominal').value = 200000;
        document.getElementById('inputTagihanCatatan').value = 'SPP Bulanan Santri Mukim';
    } else if (val === 'Pendaftaran & Fasilitas') {
        document.getElementById('inputTagihanJudul').value = 'Paket Biaya Pendaftaran Santri Mukim (Pendaftaran, Almari, Infaq Gedung, Kesehatan, Kitab)';
        document.getElementById('inputTagihanNominal').value = 1800000;
        document.getElementById('inputTagihanCatatan').value = 'Pendaftaran 100rb, Almari 500rb, Gedung 1jt, Kesehatan 100rb, Kitab 100rb';
    } else if (val === 'Almari') {
        document.getElementById('inputTagihanJudul').value = 'Biaya Almari Santri';
        document.getElementById('inputTagihanNominal').value = 500000;
    } else if (val === 'Infaq Gedung') {
        document.getElementById('inputTagihanJudul').value = 'Infaq Gedung Pesantren';
        document.getElementById('inputTagihanNominal').value = 1000000;
    } else if (val === 'Kitab & Buku') {
        document.getElementById('inputTagihanJudul').value = 'Biaya Kitab dan Buku Panduan';
        document.getElementById('inputTagihanNominal').value = 100000;
    } else if (val === 'Kesehatan') {
        document.getElementById('inputTagihanJudul').value = 'Biaya Kesehatan Santri';
        document.getElementById('inputTagihanNominal').value = 100000;
    }
}

function saveTagihan(e) {
    e.preventDefault();
    AppNotify.loading('Menerbitkan Tagihan...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    const payload = {
        targetSantri: document.getElementById('inputTagihanSantri').value,
        kategori: document.getElementById('inputTagihanKategori').value,
        judulTagihan: document.getElementById('inputTagihanJudul').value,
        nominal: Number(document.getElementById('inputTagihanNominal').value) || 0,
        jatuhTempo: document.getElementById('inputTagihanTempo').value,
        status: 'Belum Lunas',
        metodeBayar: '',
        catatan: document.getElementById('inputTagihanCatatan').value
    };
    apiCall('createTagihan', token, payload).then(res => handleRes(res, 'modalBuatTagihan'));
}

function openModalBayar(idTagihan) {
    const t = (state.tagihan || []).find(x => x.ID_Tagihan === idTagihan);
    if (!t) return;
    const s = (state.santri || []).find(x => x.ID_Santri === t.ID_Santri);
    document.getElementById('bayarIdTagihan').value = t.ID_Tagihan;
    document.getElementById('bayarInfoSantri').textContent = s ? `${s.Nama_Santri} (${s.ID_Santri})` : t.ID_Santri;
    document.getElementById('bayarInfoJudul').textContent = t.Judul_Tagihan;
    document.getElementById('bayarInfoNominal').textContent = formatRupiah(t.Nominal);
    document.getElementById('bayarCatatan').value = t.Catatan || '';

    const modal = document.getElementById('modalBayarTagihan');
    const content = document.getElementById('modalBayarTagihanContent');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('scale-95'); }, 10);
}

function confirmBayarTagihan(e) {
    e.preventDefault();
    AppNotify.loading('Memverifikasi Pembayaran...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    const idTagihan = document.getElementById('bayarIdTagihan').value;
    const metode = document.getElementById('bayarMetode').value;
    const catatan = document.getElementById('bayarCatatan').value;
    apiCall('bayarTagihan', token, idTagihan, metode, catatan).then(res => handleRes(res, 'modalBayarTagihan'));
}

async function batalLunasTagihan(idTagihan) {
    const confirmed = await AppNotify.confirm('Batalkan Status Lunas?', 'Tagihan ini akan dikembalikan menjadi status Belum Lunas.', 'Ya, Batalkan', 'Tutup');
    if (confirmed) {
        AppNotify.loading('Memperbarui Status...');
        const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        apiCall('batalBayarTagihan', token, idTagihan).then(res => handleRes(res, null));
    }
}

async function deleteTagihanAction(idTagihan, judul) {
    const confirmed = await AppNotify.confirm('Hapus Tagihan?', `Hapus tagihan "${judul}"?`, 'Ya, Hapus', 'Batal');
    if (confirmed) {
        AppNotify.loading('Menghapus Tagihan...');
        const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        apiCall('deleteTagihan', token, idTagihan).then(res => handleRes(res, null));
    }
}

function cetakKwitansiAdmin(idTagihan) {
    const t = (state.tagihan || []).find(x => x.ID_Tagihan === idTagihan);
    if (!t) return;
    const s = (state.santri || []).find(x => x.ID_Santri === t.ID_Santri);
    cetakKwitansiResmi(t, s);
}

function kirimWaTagihan(idTagihan) {
    const t = (state.tagihan || []).find(x => x.ID_Tagihan === idTagihan);
    if (!t) return;
    const s = (state.santri || []).find(x => x.ID_Santri === t.ID_Santri);
    const waClean = s ? formatWaNumber(s.No_HP_Wali) : '';
    if (!waClean) {
        return AppNotify.warning('Nomor WA Kosong', 'Nomor WhatsApp Orang Tua/Wali belum diisi pada Buku Induk santri ini.');
    }
    const pesan = `Assalamu'alaikum Wr. Wb.\nBapak/Ibu Wali dari ananda *${s.Nama_Santri}* (${s.ID_Santri}).\n\nKami menginformasikan rincian tagihan administrasi *${state.appName || "PPTQ Zadil Qur'an"}*:\n• *Tagihan:* ${t.Judul_Tagihan}\n• *Nominal:* ${formatRupiah(t.Nominal)}\n• *Jatuh Tempo:* ${t.Jatuh_Tempo || '-'}\n• *Status:* *${t.Status}*\n\nPembayaran dapat dilakukan melalui Bendahara Pondok atau konfirmasi ke nomor ini. Jazakumullahu khairan katsiran.`;
    window.open(`https://wa.me/${waClean}?text=${encodeURIComponent(pesan)}`, '_blank');
}

// ==================== GLOBAL DELETE & PENGATURAN ====================
async function deleteAction(sheetName, id, textInfo) {
    const confirmed = await AppNotify.confirm('Hapus Data?', `Apakah Anda yakin ingin menghapus ${textInfo}? Tindakan ini tidak dapat dibatalkan.`, 'Ya, Hapus Data', 'Batal');
    if (confirmed) {
        AppNotify.loading('Menghapus Data...');
        const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        apiCall('deleteDataGlobal', token, sheetName, id).then(res => handleRes(res, null));
    }
}

function handleRes(res, modalId) {
    AppNotify.close();
    if (res.status === 'success') {
        if (modalId) closeModal(modalId, `${modalId}Content`);
        AppNotify.toast('success', res.message || 'Operasi berhasil disimpan');
        refreshAdminData();
    } else {
        AppNotify.error('Operasi Gagal', res.message || 'Terjadi kesalahan sistem.');
    }
}

function savePondokName(e) {
    e.preventDefault();
    AppNotify.loading('Menyimpan Nama Lembaga...');
    const newName = document.getElementById('inputPondokName').value;
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    apiCall('updatePondokName', token, newName).then(res => {
        if (res.status === 'success') {
            state.appName = newName;
            updateBrandingDOM(newName);
            AppNotify.success('Nama Lembaga Diperbarui', res.message);
        } else {
            AppNotify.error('Gagal Memperbarui', res.message);
        }
    });
}

function saveAdminPassword(e) {
    e.preventDefault();
    AppNotify.loading('Memverifikasi Kata Sandi...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    apiCall('updateAdminPassword', token, document.getElementById('oldPassword').value, document.getElementById('newPassword').value).then(res => {
        if (res.status === 'success') {
            document.getElementById('oldPassword').value = '';
            document.getElementById('newPassword').value = '';
            AppNotify.success('Kata Sandi Diperbarui', res.message);
        } else {
            AppNotify.error('Gagal Memperbarui Sandi', res.message);
        }
    });
}

async function testBackendConnection() {
    const badge = document.getElementById('apiStatusBadge');
    if (badge) {
        badge.textContent = 'Status API: Menguji koneksi...';
        badge.className = 'text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 font-medium';
    }
    AppNotify.loading('Menguji Koneksi Backend...');
    try {
        const res = await apiCall('ping');
        if (res.status === 'success') {
            if (badge) {
                badge.textContent = 'Status API: Terhubung (Online)';
                badge.className = 'text-xs px-2.5 py-1 rounded-full bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c] dark:text-[#83c9a6] font-bold';
            }
            AppNotify.success('Koneksi Berhasil!', `<p>Backend Google Apps Script merespons dengan normal.</p><p class="text-xs text-gray-500 mt-2">Waktu Server: ${res.data ? res.data.timestamp : new Date().toISOString()}</p>`);
        } else {
            throw new Error(res.message || 'Respons server tidak sukses.');
        }
    } catch (err) {
        if (badge) {
            badge.textContent = 'Status API: Terputus / Gagal';
            badge.className = 'text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-bold';
        }
    }
}

async function initSetupDatabaseFromUI() {
    const confirmed = await AppNotify.confirm('Jalankan Setup Database?', 'Sistem akan memeriksa dan membuat sheet/kolom yang belum ada (Users_Admin, Users_Ustadz, Data_Santri 27 Kolom, Data_Tagihan, Data_Setoran, Pengaturan). Data yang sudah ada tidak akan hilang.', 'Ya, Jalankan Setup', 'Batal');
    if (confirmed) {
        AppNotify.loading('Memproses Setup Database...');
        try {
            const res = await apiCall('setupDatabase');
            if (res.status === 'success') {
                AppNotify.success('Setup Database Berhasil', res.message);
                refreshAdminData();
            } else {
                AppNotify.error('Setup Gagal', res.message);
            }
        } catch (err) { }
    }
}

// ==================== KUSTOMISASI SYARAT & DETAIL BIAYA PSB (CRUD & TOTAL OTOMATIS) ====================
const DEFAULT_PSB_CONFIG = {
    syarat: [
        "Berkomitmen menghafal Al-Qur'an 30 Juz.",
        "Mengisi formulir pendaftaran lengkap.",
        "Pas Foto 3x4 (3 lembar): Putra berkopyah, Putri berkerudung.",
        "Fotokopi Ijazah terakhir, Raport, KK, & Akta Kelahiran (masing-masing 2 lembar).",
        "(Bagi Yatim/Piatu) Surat Keterangan Kematian Orang Tua.",
        "Sanggup menaati tata tertib Pesantren bagi santri & wali.",
        "Diantar langsung oleh Orang Tua / Wali ke Pesantren."
    ],
    catatanSyarat: "Berkas fisik diserahkan saat santri tiba di pondok.",
    biayaFasilitas: [
        { id: "bf_1", nama: "Pendaftaran Administrasi", nominal: 100000, kategori: "Pendaftaran" },
        { id: "bf_2", nama: "Almari Santri Pribadi", nominal: 500000, kategori: "Fasilitas" },
        { id: "bf_3", nama: "Infaq Gedung & Sarana Prasarana", nominal: 1000000, kategori: "Fasilitas" },
        { id: "bf_4", nama: "Layanan Kesehatan Santri", nominal: 100000, kategori: "Kesehatan" },
        { id: "bf_5", nama: "Kitab & Buku Panduan Tahfizh", nominal: 100000, kategori: "Kitab" }
    ],
    sppBulanan: 200000
};

function getAdminPsbConfig() {
    if (state.psbConfig && Array.isArray(state.psbConfig.syarat)) {
        return state.psbConfig;
    }
    try {
        const stored = localStorage.getItem('ZQ_PSB_CONFIG');
        if (stored) {
            state.psbConfig = JSON.parse(stored);
            return state.psbConfig;
        }
    } catch (e) {}
    state.psbConfig = JSON.parse(JSON.stringify(DEFAULT_PSB_CONFIG));
    return state.psbConfig;
}

function initAdminPsbSettings() {
    getAdminPsbConfig();
    renderAdminPsbSyarat();
    renderAdminPsbBiaya();

    const catatanEl = document.getElementById('adminPsbCatatanSyarat');
    if (catatanEl) catatanEl.value = state.psbConfig.catatanSyarat || '';

    const sppEl = document.getElementById('adminPsbSppBulanan');
    if (sppEl) sppEl.value = state.psbConfig.sppBulanan || 200000;

    recalcAdminPsbTotals();
}

function renderAdminPsbSyarat() {
    const container = document.getElementById('adminPsbSyaratList');
    if (!container) return;

    const list = state.psbConfig.syarat || [];
    if (list.length === 0) {
        container.innerHTML = `<div class="p-3 text-center text-xs text-gray-400 bg-gray-50 dark:bg-slate-800/40 rounded-xl">Belum ada poin syarat pendaftaran. Klik '+ Tambah Poin' di atas.</div>`;
        return;
    }

    container.innerHTML = list.map((item, idx) => `
        <div class="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-darkborder text-xs group">
            <div class="flex items-start gap-2 flex-1">
                <span class="w-5 h-5 rounded-md bg-[#9a2024]/10 text-[#9a2024] dark:bg-[#9a2024]/30 dark:text-[#f29fa3] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
                <span class="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">${item}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <button type="button" onclick="movePsbSyarat(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="w-6 h-6 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition" title="Pindah Naik"><i class="fa-solid fa-arrow-up text-[10px]"></i></button>
                <button type="button" onclick="movePsbSyarat(${idx}, 1)" ${idx === list.length - 1 ? 'disabled' : ''} class="w-6 h-6 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition" title="Pindah Turun"><i class="fa-solid fa-arrow-down text-[10px]"></i></button>
                <button type="button" onclick="openModalEditSyarat(${idx})" class="w-6 h-6 rounded-md hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-600 flex items-center justify-center transition" title="Edit Poin"><i class="fa-solid fa-pen text-[10px]"></i></button>
                <button type="button" onclick="deletePsbSyarat(${idx})" class="w-6 h-6 rounded-md hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 flex items-center justify-center transition" title="Hapus Poin"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
            </div>
        </div>
    `).join('');
}

function openModalTambahSyarat() {
    document.getElementById('titleModalSyarat').textContent = 'Tambah Poin Syarat PSB';
    document.getElementById('inputSyaratIndex').value = -1;
    document.getElementById('inputSyaratText').value = '';
    openModal('modalTambahEditSyarat', 'modalTambahEditSyaratContent');
}

function openModalEditSyarat(index) {
    document.getElementById('titleModalSyarat').textContent = `Edit Poin Syarat #${index + 1}`;
    document.getElementById('inputSyaratIndex').value = index;
    document.getElementById('inputSyaratText').value = state.psbConfig.syarat[index] || '';
    openModal('modalTambahEditSyarat', 'modalTambahEditSyaratContent');
}

function saveSyaratItem(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById('inputSyaratIndex').value, 10);
    const text = document.getElementById('inputSyaratText').value.trim();
    if (!text) return;

    if (!Array.isArray(state.psbConfig.syarat)) state.psbConfig.syarat = [];

    if (idx === -1) {
        state.psbConfig.syarat.push(text);
        AppNotify.toast('Poin syarat berhasil ditambahkan!', 'success');
    } else if (idx >= 0 && idx < state.psbConfig.syarat.length) {
        state.psbConfig.syarat[idx] = text;
        AppNotify.toast('Poin syarat berhasil diperbarui!', 'success');
    }

    closeModal('modalTambahEditSyarat', 'modalTambahEditSyaratContent');
    renderAdminPsbSyarat();
}

function deletePsbSyarat(index) {
    if (confirm('Hapus poin persyaratan ini?')) {
        state.psbConfig.syarat.splice(index, 1);
        renderAdminPsbSyarat();
        AppNotify.toast('Poin syarat telah dihapus.', 'info');
    }
}

function movePsbSyarat(index, direction) {
    const targetIdx = index + direction;
    const list = state.psbConfig.syarat;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    renderAdminPsbSyarat();
}

function renderAdminPsbBiaya() {
    const tbody = document.getElementById('adminPsbBiayaTableBody');
    if (!tbody) return;

    const list = state.psbConfig.biayaFasilitas || [];
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-400">Belum ada komponen biaya/fasilitas. Klik '+ Tambah Komponen' di atas.</td></tr>`;
        recalcAdminPsbTotals();
        return;
    }

    tbody.innerHTML = list.map((item, idx) => `
        <tr class="hover:bg-gray-50/60 dark:hover:bg-slate-800/40">
            <td class="p-2.5 font-semibold text-gray-800 dark:text-gray-200">${idx + 1}. ${item.nama}</td>
            <td class="p-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">${item.kategori || 'Fasilitas'}</span></td>
            <td class="p-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">${formatRupiah(Number(item.nominal) || 0)}</td>
            <td class="p-2.5 text-center">
                <div class="flex items-center justify-center gap-1">
                    <button type="button" onclick="openModalEditBiaya('${item.id}')" class="w-6 h-6 rounded hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-600 flex items-center justify-center transition" title="Edit Komponen"><i class="fa-solid fa-pen text-[10px]"></i></button>
                    <button type="button" onclick="deletePsbBiaya('${item.id}')" class="w-6 h-6 rounded hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 flex items-center justify-center transition" title="Hapus Komponen"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
                </div>
            </td>
        </tr>
    `).join('');

    recalcAdminPsbTotals();
}

function recalcAdminPsbTotals() {
    const subtotal = (state.psbConfig.biayaFasilitas || []).reduce((sum, item) => sum + (Number(item.nominal) || 0), 0);
    const sppInput = document.getElementById('adminPsbSppBulanan');
    const spp = sppInput ? (Number(sppInput.value) || 0) : (Number(state.psbConfig.sppBulanan) || 200000);
    state.psbConfig.sppBulanan = spp;
    const grandTotal = subtotal + spp;

    const elSubtotal = document.getElementById('adminPsbSubtotalBiaya');
    if (elSubtotal) elSubtotal.textContent = formatRupiah(subtotal);

    const elSpp = document.getElementById('adminPsbSppDisplay');
    if (elSpp) elSpp.textContent = formatRupiah(spp);

    const elTotal = document.getElementById('adminPsbTotalMasuk');
    if (elTotal) elTotal.textContent = formatRupiah(grandTotal);
}

function openModalTambahBiaya() {
    document.getElementById('titleModalBiaya').textContent = 'Tambah Komponen Biaya / Fasilitas';
    document.getElementById('inputBiayaId').value = '';
    document.getElementById('inputBiayaNama').value = '';
    document.getElementById('inputBiayaKategori').value = 'Fasilitas';
    document.getElementById('inputBiayaNominal').value = '';
    openModal('modalTambahEditBiaya', 'modalTambahEditBiayaContent');
}

function openModalEditBiaya(id) {
    const item = (state.psbConfig.biayaFasilitas || []).find(b => b.id === id);
    if (!item) return;

    document.getElementById('titleModalBiaya').textContent = 'Edit Komponen Biaya / Fasilitas';
    document.getElementById('inputBiayaId').value = item.id;
    document.getElementById('inputBiayaNama').value = item.nama;
    document.getElementById('inputBiayaKategori').value = item.kategori || 'Fasilitas';
    document.getElementById('inputBiayaNominal').value = item.nominal;
    openModal('modalTambahEditBiaya', 'modalTambahEditBiayaContent');
}

function saveBiayaItem(e) {
    e.preventDefault();
    const id = document.getElementById('inputBiayaId').value;
    const nama = document.getElementById('inputBiayaNama').value.trim();
    const kategori = document.getElementById('inputBiayaKategori').value;
    const nominal = Number(document.getElementById('inputBiayaNominal').value) || 0;

    if (!nama) return;
    if (!Array.isArray(state.psbConfig.biayaFasilitas)) state.psbConfig.biayaFasilitas = [];

    if (id) {
        const item = state.psbConfig.biayaFasilitas.find(b => b.id === id);
        if (item) {
            item.nama = nama;
            item.kategori = kategori;
            item.nominal = nominal;
            AppNotify.toast('Komponen biaya berhasil diperbarui!', 'success');
        }
    } else {
        state.psbConfig.biayaFasilitas.push({
            id: 'bf_' + Date.now(),
            nama: nama,
            kategori: kategori,
            nominal: nominal
        });
        AppNotify.toast('Komponen biaya baru ditambahkan!', 'success');
    }

    closeModal('modalTambahEditBiaya', 'modalTambahEditBiayaContent');
    renderAdminPsbBiaya();
}

function deletePsbBiaya(id) {
    if (confirm('Hapus komponen biaya / fasilitas ini?')) {
        state.psbConfig.biayaFasilitas = (state.psbConfig.biayaFasilitas || []).filter(b => b.id !== id);
        renderAdminPsbBiaya();
        AppNotify.toast('Komponen biaya telah dihapus.', 'info');
    }
}

async function savePsbConfigSettings() {
    AppNotify.loading('Menyimpan Pengaturan Syarat & Biaya PSB...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);

    const catatanEl = document.getElementById('adminPsbCatatanSyarat');
    if (catatanEl) state.psbConfig.catatanSyarat = catatanEl.value.trim();

    const sppEl = document.getElementById('adminPsbSppBulanan');
    if (sppEl) state.psbConfig.sppBulanan = Number(sppEl.value) || 200000;

    localStorage.setItem('ZQ_PSB_CONFIG', JSON.stringify(state.psbConfig));

    try {
        const res = await apiCall('savePsbConfig', token, state.psbConfig);
        AppNotify.close();
        if (res && res.status === 'success') {
            AppNotify.toast('Pengaturan PSB & Rincian Biaya berhasil disimpan ke Cloud!', 'success');
        } else {
            AppNotify.toast('Tersimpan di penyimpanan lokal browser.', 'info');
        }
    } catch (err) {
        AppNotify.close();
        AppNotify.toast('Tersimpan di browser lokal.', 'info');
    }

    recalcAdminPsbTotals();
}

async function resetPsbConfigSettings() {
    const confirmed = await AppNotify.confirm('Reset ke Pengaturan Standar?', 'Seluruh syarat dan komponen biaya akan dikembalikan ke standar awal yayasan (7 syarat & paket Rp 2.000.000).', 'Ya, Reset', 'Batal');
    if (confirmed) {
        state.psbConfig = JSON.parse(JSON.stringify(DEFAULT_PSB_CONFIG));
        localStorage.setItem('ZQ_PSB_CONFIG', JSON.stringify(state.psbConfig));
        initAdminPsbSettings();
        savePsbConfigSettings();
    }
}

// ==================== TEMPLATE & IMPORT EXCEL BUKU INDUK SANTRI ====================
let parsedImportRows = [];

function downloadExcelTemplate() {
    try {
        if (typeof XLSX !== 'undefined') {
            const wb = XLSX.utils.book_new();

            const headers = [
                "No", "Nama_Santri", "Nama_Panggilan", "Jenis_Kelamin", "Tempat_Lahir", "Tanggal_Lahir",
                "Alamat", "RT", "RW", "Desa", "Kecamatan", "Kab_Kota", "Provinsi",
                "Pendidikan_Terakhir", "Tahun_Lulus", "Sekolah_Asal",
                "Nama_Ayah", "Pekerjaan_Ayah", "Pendidikan_Ayah",
                "Nama_Ibu", "Pekerjaan_Ibu", "Pendidikan_Ibu",
                "Nama_Wali", "No_HP_Wali", "ID_Ustadz", "Status", "ID_Santri"
            ];

            const sampleRows = [
                [
                    1, "Muhammad Fatih Al-Ayyubi", "Fatih", "Putra", "Tuban", "2013-05-14",
                    "Jl. KH. Hasyim Asyari No. 45", "02", "04", "Kutorejo", "Tuban", "Kabupaten Tuban", "Jawa Timur",
                    "SD", "2025", "SDN Kutorejo 1",
                    "Ahmad Fauzi", "Wiraswasta", "S1", "Siti Aminah", "Ibu Rumah Tangga", "SMA",
                    "Ahmad Fauzi", "081234567890", "", "Aktif", ""
                ],
                [
                    2, "Aisyah Humaira Azzahra", "Aisyah", "Putri", "Bojonegoro", "2014-08-22",
                    "Dusun Krajan RT 01 RW 02", "01", "02", "Pancur", "Temayang", "Kabupaten Bojonegoro", "Jawa Timur",
                    "MI", "2026", "MI Manbaul Ulum",
                    "H. Ridwan Mansyur", "PNS", "S2", "Hj. Fatimah", "Guru", "S1",
                    "H. Ridwan Mansyur", "082198765432", "", "Aktif", ""
                ],
                [
                    3, "Zaid bin Haritsah", "Zaid", "Putra", "Lamongan", "2012-11-03",
                    "Jl. Raya Babat No. 12", "03", "01", "Babat", "Babat", "Kabupaten Lamongan", "Jawa Timur",
                    "SD", "2024", "SD Islam Terpadu",
                    "Supriyadi", "Petani", "SMA", "Nur Halimah", "Pedagang", "SMP",
                    "Supriyadi", "085712348899", "", "Aktif", ""
                ]
            ];

            const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
            XLSX.utils.book_append_sheet(wb, ws, "DATA_SANTRI");

            const guide = [
                ["Nama Kolom", "Wajib / Opsional", "Contoh Format", "Keterangan"],
                ["Nama_Santri", "WAJIB", "Muhammad Fatih", "Nama lengkap calon santri"],
                ["Jenis_Kelamin", "WAJIB", "Putra / Putri", "Pilihan: 'Putra' atau 'Putri'"],
                ["Tanggal_Lahir", "Opsional", "2013-05-14", "Format tanggal: YYYY-MM-DD atau DD/MM/YYYY"],
                ["No_HP_Wali", "WAJIB (Disarankan)", "081234567890", "Nomor WhatsApp aktif wali untuk login & laporan"],
                ["Status", "Opsional", "Aktif / Calon Santri", "Status santri (default: Aktif)"],
                ["ID_Santri", "Opsional", "ZQ-2026-X8K9", "Kosongkan agar dibuat otomatis oleh sistem"]
            ];
            const wsGuide = XLSX.utils.aoa_to_sheet(guide);
            XLSX.utils.book_append_sheet(wb, wsGuide, "PETUNJUK_PENGISIAN");

            XLSX.writeFile(wb, "Template_Biodata_Santri_PPTQ_Zadil_Quran.xlsx");
            AppNotify.toast("Template Excel berhasil diunduh!", "success");
            return;
        }
    } catch (e) {
        console.warn("SheetJS download fallback:", e);
    }

    const link = document.createElement("a");
    link.href = "Template_Biodata_Santri_PPTQ_Zadil_Quran.xlsx";
    link.download = "Template_Biodata_Santri_PPTQ_Zadil_Quran.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    AppNotify.toast("Mengunduh Template Excel...", "info");
}

function openModalImportSantri() {
    const selUstadz = document.getElementById('importSelectUstadz');
    if (selUstadz) {
        selUstadz.innerHTML = '<option value="">-- Tanpa Ustadz (Bisa Diatur Nanti) --</option>' +
            (state.ustadz || []).map(u => `<option value="${u.ID_Ustadz}">${u.Nama} (${u.ID_Ustadz})</option>`).join('');
    }
    resetExcelFileSelection();
    openModal('modalImportSantri', 'modalImportSantriContent');
}

function resetExcelFileSelection() {
    parsedImportRows = [];
    const inputFile = document.getElementById('inputExcelFile');
    if (inputFile) inputFile.value = '';
    const badge = document.getElementById('fileInfoBadge');
    if (badge) badge.classList.add('hidden');
    const preview = document.getElementById('previewImportSection');
    if (preview) preview.classList.add('hidden');
    const prog = document.getElementById('importProgressContainer');
    if (prog) prog.classList.add('hidden');
    const btn = document.getElementById('btnExecuteImport');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-file-import mr-1.5"></i> <span>Mulai Impor Data</span>`;
    }
}

function handleExcelDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('dropzoneExcel');
    if (dropzone) dropzone.classList.add('border-emerald-500', 'bg-emerald-50/50');
}

function handleExcelDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('dropzoneExcel');
    if (dropzone) dropzone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
}

function handleExcelDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('dropzoneExcel');
    if (dropzone) dropzone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) processExcelFile(file);
}

function handleExcelFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (file) processExcelFile(file);
}

function processExcelFile(file) {
    if (!file) return;
    const validExts = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => fileName.endsWith(ext));
    if (!hasValidExt) {
        AppNotify.toast('Format file tidak didukung. Harap pilih .xlsx, .xls, atau .csv', 'warning');
        return;
    }

    document.getElementById('fileNameDisplay').textContent = file.name;
    document.getElementById('fileSizeDisplay').textContent = (file.size / 1024).toFixed(1) + ' KB';
    document.getElementById('fileInfoBadge').classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            if (typeof XLSX === 'undefined') {
                throw new Error("Pustaka SheetJS (XLSX) belum dimuat. Pastikan terhubung internet.");
            }
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const sheetName = workbook.SheetNames.find(s => s.toUpperCase().includes('SANTRI')) || workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (!rawJson || rawJson.length === 0) {
                AppNotify.toast('File Excel kosong atau tidak memiliki baris data.', 'warning');
                return;
            }

            parsedImportRows = rawJson.map(row => normalizeSantriImportRow(row)).filter(r => r !== null);
            renderImportPreview(rawJson.length, parsedImportRows);
        } catch (err) {
            AppNotify.error('Gagal Membaca File Excel', err.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function normalizeSantriImportRow(raw) {
    const keys = Object.keys(raw);
    const getVal = (aliases) => {
        for (const alias of aliases) {
            const foundKey = keys.find(k => k.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === alias.toLowerCase().replace(/[^a-z0-9]/g, ''));
            if (foundKey && String(raw[foundKey]).trim() !== '') {
                return String(raw[foundKey]).trim();
            }
        }
        return '';
    };

    const namaSantri = getVal(['nama_santri', 'namasantri', 'nama lengkap santri', 'nama lengkap', 'nama', 'santri']);
    if (!namaSantri) return null;

    let jenisKelamin = getVal(['jenis_kelamin', 'jeniskelamin', 'jk', 'gender']);
    if (!jenisKelamin) jenisKelamin = 'Putra';
    else if (jenisKelamin.toLowerCase().startsWith('p') && jenisKelamin.toLowerCase().includes('u') && !jenisKelamin.toLowerCase().includes('t')) {
        jenisKelamin = 'Putri';
    } else if (jenisKelamin.toLowerCase().startsWith('l') || jenisKelamin.toLowerCase().includes('putra')) {
        jenisKelamin = 'Putra';
    } else if (jenisKelamin.toLowerCase().startsWith('p')) {
        jenisKelamin = 'Putri';
    }

    return {
        namaSantri: namaSantri,
        namaPanggilan: getVal(['nama_panggilan', 'namapanggilan', 'panggilan', 'alias']),
        jenisKelamin: jenisKelamin,
        tempatLahir: getVal(['tempat_lahir', 'tempatlahir', 'kota lahir', 'tempat']),
        tanggalLahir: getVal(['tanggal_lahir', 'tanggallahir', 'tgl_lahir', 'tgl', 'ttl']),
        alamat: getVal(['alamat', 'jalan', 'dusun']),
        rt: getVal(['rt']) || '-',
        rw: getVal(['rw']) || '-',
        desa: getVal(['desa', 'kelurahan', 'desa kelurahan']) || '-',
        kecamatan: getVal(['kecamatan', 'kec']) || '-',
        kabKota: getVal(['kab_kota', 'kabkota', 'kabupaten', 'kota']) || '-',
        provinsi: getVal(['provinsi', 'prov']) || 'Jawa Timur',
        pendidikanTerakhir: getVal(['pendidikan_terakhir', 'pendidikan']) || '-',
        tahunLulus: getVal(['tahun_lulus', 'tahunlulus', 'lulus']) || '-',
        sekolahAsal: getVal(['sekolah_asal', 'sekolahasal', 'asal sekolah']) || '-',
        namaAyah: getVal(['nama_ayah', 'namaayah', 'ayah']),
        pekerjaanAyah: getVal(['pekerjaan_ayah', 'pekerjaanayah']) || '-',
        pendidikanAyah: getVal(['pendidikan_ayah', 'pendidikanayah']) || '-',
        namaIbu: getVal(['nama_ibu', 'namaibu', 'ibu']),
        pekerjaanIbu: getVal(['pekerjaan_ibu', 'pekerjaanibu']) || '-',
        pendidikanIbu: getVal(['pendidikan_ibu', 'pendidikanibu']) || '-',
        namaWali: getVal(['nama_wali', 'namawali', 'wali']),
        noHpWali: getVal(['no_hp_wali', 'nohpwali', 'no hp', 'whatsapp', 'no wa', 'no telp', 'telepon', 'hp']),
        idUstadz: getVal(['id_ustadz', 'idustadz', 'ustadz', 'pembimbing']),
        status: getVal(['status']) || 'Aktif',
        idSantri: getVal(['id_santri', 'idsantri', 'kode_zq', 'kode zq', 'kode'])
    };
}

function renderImportPreview(totalRaw, validRows) {
    document.getElementById('previewImportSection').classList.remove('hidden');
    document.getElementById('previewTotalCount').textContent = totalRaw;
    document.getElementById('previewValidCount').textContent = validRows.length;
    document.getElementById('previewSkipCount').textContent = Math.max(0, totalRaw - validRows.length);

    const tbody = document.getElementById('importPreviewTableBody');
    if (!tbody) return;

    if (validRows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-red-500 font-medium">Tidak ada baris data santri yang valid (Kolom Nama Santri kosong).</td></tr>`;
        document.getElementById('btnExecuteImport').disabled = true;
        return;
    }

    const previewList = validRows.slice(0, 5);
    tbody.innerHTML = previewList.map((r, i) => `
        <tr class="hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <td class="p-2 font-mono text-gray-400">${i + 1}</td>
            <td class="p-2 font-bold text-gray-900 dark:text-white">${r.namaSantri}</td>
            <td class="p-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${r.jenisKelamin === 'Putri' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${r.jenisKelamin}</span></td>
            <td class="p-2 text-gray-600 dark:text-gray-300">${r.tempatLahir ? r.tempatLahir + ', ' : ''}${r.tanggalLahir || '-'}</td>
            <td class="p-2 text-gray-600 dark:text-gray-300">${r.namaAyah || r.namaWali || r.namaIbu || '-'}</td>
            <td class="p-2 font-mono text-emerald-600 dark:text-emerald-400">${r.noHpWali || '-'}</td>
        </tr>
    `).join('');

    document.getElementById('btnExecuteImport').disabled = false;
    document.getElementById('btnExecuteImport').innerHTML = `<i class="fa-solid fa-file-import mr-1.5"></i> Mulai Impor ${validRows.length} Santri`;
}

async function executeSantriImport() {
    if (!parsedImportRows || parsedImportRows.length === 0) {
        AppNotify.toast('Tidak ada data santri yang siap diimpor.', 'warning');
        return;
    }

    const defaultUstadz = document.getElementById('importSelectUstadz').value;
    const defaultStatus = document.getElementById('importSelectStatus').value || 'Aktif';

    const finalRows = parsedImportRows.map(r => ({
        ...r,
        idUstadz: r.idUstadz || defaultUstadz || '',
        status: r.status || defaultStatus,
        namaWali: r.namaWali || r.namaAyah || ''
    }));

    const progressContainer = document.getElementById('importProgressContainer');
    const progressBar = document.getElementById('importProgressBar');
    const progressText = document.getElementById('importProgressText');
    const progressPercent = document.getElementById('importProgressPercent');
    const btnExecute = document.getElementById('btnExecuteImport');

    progressContainer.classList.remove('hidden');
    btnExecute.disabled = true;
    progressBar.style.width = '20%';
    progressPercent.textContent = '20%';
    progressText.textContent = `Menghubungkan ke server untuk mengimpor ${finalRows.length} santri...`;

    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);

    try {
        progressBar.style.width = '60%';
        progressPercent.textContent = '60%';
        const res = await apiCall('saveSantriBatch', token, finalRows);

        progressBar.style.width = '100%';
        progressPercent.textContent = '100%';
        progressText.textContent = 'Selesai!';

        if (res && res.status === 'success') {
            refreshAdminData();
            closeModal('modalImportSantri', 'modalImportSantriContent');
            AppNotify.success('Impor Santri Berhasil!', `<p>Alhamdulillah, sebanyak <b>${finalRows.length} santri</b> berhasil dimasukkan ke Buku Induk.</p>`);
        } else {
            throw new Error(res && res.message ? res.message : 'Gagal impor batch');
        }
    } catch (err) {
        // Fallback: Kirim satu per satu
        progressText.textContent = 'Menyimpan santri satu per satu...';
        let successCount = 0;
        for (let idx = 0; idx < finalRows.length; idx++) {
            const item = finalRows[idx];
            const pct = Math.round(((idx + 1) / finalRows.length) * 100);
            progressBar.style.width = `${pct}%`;
            progressPercent.textContent = `${pct}%`;
            progressText.textContent = `Menyimpan ${idx + 1} dari ${finalRows.length}: ${item.namaSantri}...`;

            try {
                const year = new Date().getFullYear();
                const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
                const singlePayload = {
                    isEdit: false,
                    idSantri: item.idSantri || `ZQ-${year}-${rnd}`,
                    ...item
                };
                await apiCall('saveSantriData', token, singlePayload);
                successCount++;
            } catch (e) {
                console.error('Error importing single row:', item.namaSantri, e);
            }
        }

        refreshAdminData();
        closeModal('modalImportSantri', 'modalImportSantriContent');
        AppNotify.success('Impor Santri Selesai!', `<p>Berhasil mengimpor <b>${successCount} dari ${finalRows.length} santri</b> ke Buku Induk.</p>`);
    } finally {
        resetExcelFileSelection();
    }
}

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
    initPwa();
    if (!checkExistingSession() || !sessionData || sessionData.role !== 'superadmin') {
        window.location.href = 'login.html';
        return;
    }

    const name = sessionData.name || 'Admin';
    document.getElementById('userNameDisplay').textContent = name;
    document.getElementById('userRoleDisplay').textContent = sessionData.role;
    document.getElementById('userInitial').textContent = name.charAt(0).toUpperCase();

    state.currentAdminMenu = detectInitialAdminMenu();
    buildSidebarMenu();
    updateBottomNavState();
    refreshAdminData();
});

