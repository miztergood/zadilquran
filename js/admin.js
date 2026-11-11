/**
 * ============================================================================
 * ZADIL QURAN - SUPERADMIN MODULE (js/admin.js)
 * Digunakan oleh admin.html
 * Mencakup: Dashboard Global, Modul 1 (Buku Induk Santri ZQ-),
 * Modul 2 (Keuangan & Syahriyah SPP), Data Ustadz, dan Pengaturan.
 * ============================================================================
 */

// Fallback helper modal jika terpapar browser cache / perbedaan waktu muat core.js
if (typeof window !== 'undefined') {
    if (typeof window.openModal !== 'function') {
        window.openModal = function(modalId, contentId) {
            if (typeof document === 'undefined') return;
            const modal = document.getElementById(modalId);
            if (!modal) return;
            const content = document.getElementById(contentId || `${modalId}Content`);
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                if (content) content.classList.remove('scale-95');
            }, 10);
        };
    }
    if (typeof window.closeModal !== 'function') {
        window.closeModal = function(modalId, contentId) {
            if (typeof document === 'undefined') return;
            const modal = document.getElementById(modalId);
            if (!modal) return;
            const content = document.getElementById(contentId || `${modalId}Content`);
            modal.classList.add('opacity-0');
            if (content) content.classList.add('scale-95');
            setTimeout(() => { modal.classList.add('hidden'); }, 300);
        };
    }
}

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
const INDO_MONTHS_KEU = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const _initDateKeu = new Date();
let currentKeuanganPeriode = `${_initDateKeu.getFullYear()}-${String(_initDateKeu.getMonth() + 1).padStart(2, '0')}`;
let currentMatriksTahun = _initDateKeu.getFullYear();
let currentKeuanganTab = 'perlu-ditagih';
let filterKatPerluDitagih = 'ALL';
let filterStatusSemuaTagihan = 'ALL';

function formatPeriodeDisplay(periodeStr) {
    if (!periodeStr || typeof periodeStr !== 'string') return '';
    const parts = periodeStr.split('-');
    if (parts.length < 2) return periodeStr;
    const y = parts[0];
    const m = parseInt(parts[1], 10);
    const mName = INDO_MONTHS_KEU[m - 1] || parts[1];
    return `${mName} ${y}`;
}

function getTagihanPeriode(t) {
    if (!t) return '';
    if (t.Periode && /^\d{4}-\d{2}$/.test(String(t.Periode).trim())) {
        return String(t.Periode).trim();
    }
    // Coba tebak dari Judul_Tagihan (misal "Syahriyah (SPP) Bulan November 2026")
    if (t.Judul_Tagihan) {
        for (let i = 0; i < INDO_MONTHS_KEU.length; i++) {
            const mName = INDO_MONTHS_KEU[i];
            const regex = new RegExp(mName + '\\s+(\\d{4})', 'i');
            const match = String(t.Judul_Tagihan).match(regex);
            if (match) {
                const year = match[1];
                const month = String(i + 1).padStart(2, '0');
                return `${year}-${month}`;
            }
        }
    }
    // Coba tebak dari Jatuh_Tempo (misal "10 November 2026" atau "2026-11-10")
    if (t.Jatuh_Tempo) {
        const str = String(t.Jatuh_Tempo).trim();
        if (/^\d{4}-\d{2}/.test(str)) {
            return str.substring(0, 7);
        }
        for (let i = 0; i < INDO_MONTHS_KEU.length; i++) {
            const mName = INDO_MONTHS_KEU[i];
            const regex = new RegExp(mName + '\\s+(\\d{4})', 'i');
            const match = str.match(regex);
            if (match) {
                const year = match[1];
                const month = String(i + 1).padStart(2, '0');
                return `${year}-${month}`;
            }
        }
    }
    // Fallback dari Timestamp
    if (t.Timestamp) {
        try {
            const d = new Date(t.Timestamp);
            if (!isNaN(d.getTime())) {
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }
        } catch (e) {}
    }
    return '';
}

function parseTanggalJatuhTempo(tempoStr) {
    if (!tempoStr) return null;
    const str = String(tempoStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const parts = str.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    for (let i = 0; i < INDO_MONTHS_KEU.length; i++) {
        const mName = INDO_MONTHS_KEU[i];
        const regex = new RegExp('(\\d{1,2})\\s+' + mName + '\\s+(\\d{4})', 'i');
        const match = str.match(regex);
        if (match) {
            const d = parseInt(match[1], 10);
            const y = parseInt(match[2], 10);
            return new Date(y, i, d);
        }
    }
    try {
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d;
    } catch (e) {}
    return null;
}

function hitungKeterlambatan(t) {
    if (!t) return { status: 'normal', text: '-' };
    if (t.Status === 'Lunas') return { status: 'lunas', text: 'Lunas' };
    
    const dueDate = parseTanggalJatuhTempo(t.Jatuh_Tempo);
    if (!dueDate) {
        return { status: 'normal', text: t.Jatuh_Tempo || '-' };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
        return {
            status: 'overdue',
            days: diffDays,
            text: `Terlambat ${diffDays} hari`
        };
    } else if (diffDays >= -7) {
        const sisa = Math.abs(diffDays);
        return {
            status: 'due-soon',
            days: sisa,
            text: sisa === 0 ? 'Jatuh tempo hari ini' : `Jatuh tempo ${sisa} hari lagi`
        };
    } else {
        return {
            status: 'normal',
            text: `Tempo: ${t.Jatuh_Tempo}`
        };
    }
}

function geserPeriodeKeuangan(delta) {
    if (!currentKeuanganPeriode) {
        const _d = new Date();
        currentKeuanganPeriode = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}`;
    }
    const parts = currentKeuanganPeriode.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = new Date(y, m - 1 + delta, 1);
    currentKeuanganPeriode = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    renderKeuanganView();
}

function setPeriodeBulanIni() {
    const now = new Date();
    currentKeuanganPeriode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    renderKeuanganView();
}

function geserTahunMatriks(delta) {
    currentMatriksTahun += delta;
    renderTabMatriksSpp();
}

function switchTabKeuangan(tabId) {
    currentKeuanganTab = tabId;
    
    const btnPerlu = document.getElementById('tabBtnPerluDitagih');
    const btnMatriks = document.getElementById('tabBtnMatriksSpp');
    const btnSemua = document.getElementById('tabBtnSemuaTagihan');
    
    const contPerlu = document.getElementById('tabContentPerluDitagih');
    const contMatriks = document.getElementById('tabContentMatriksSpp');
    const contSemua = document.getElementById('tabContentSemuaTagihan');
    
    const activeBtnClass = "pb-3 text-xs sm:text-sm font-bold border-b-2 border-[#9a2024] text-[#9a2024] dark:text-[#f29fa3] flex items-center gap-2 whitespace-nowrap transition";
    const inactiveBtnClass = "pb-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2 whitespace-nowrap transition";
    
    if (btnPerlu) btnPerlu.className = tabId === 'perlu-ditagih' ? activeBtnClass : inactiveBtnClass;
    if (btnMatriks) btnMatriks.className = tabId === 'matriks-spp' ? activeBtnClass : inactiveBtnClass;
    if (btnSemua) btnSemua.className = tabId === 'semua-tagihan' ? activeBtnClass : inactiveBtnClass;
    
    if (contPerlu) contPerlu.classList.toggle('hidden', tabId !== 'perlu-ditagih');
    if (contMatriks) contMatriks.classList.toggle('hidden', tabId !== 'matriks-spp');
    if (contSemua) contSemua.classList.toggle('hidden', tabId !== 'semua-tagihan');
    
    if (tabId === 'perlu-ditagih') renderTabPerluDitagih();
    else if (tabId === 'matriks-spp') renderTabMatriksSpp();
    else if (tabId === 'semua-tagihan') renderTabSemuaTagihan();
}

function renderKeuanganView() {
    const elPeriode = document.getElementById('keuanganPeriodeDisplay');
    if (!elPeriode) return;
    
    if (!currentKeuanganPeriode) {
        const _d = new Date();
        currentKeuanganPeriode = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}`;
    }
    elPeriode.textContent = formatPeriodeDisplay(currentKeuanganPeriode);
    
    // Hitung KPI Periode Terpilih
    const allTagihan = state.tagihan || [];
    const tagihanPeriode = allTagihan.filter(t => getTagihanPeriode(t) === currentKeuanganPeriode);
    
    const lunasBills = tagihanPeriode.filter(t => t.Status === 'Lunas');
    const belumBills = tagihanPeriode.filter(t => t.Status !== 'Lunas');
    const menunggakBills = belumBills.filter(t => hitungKeterlambatan(t).status === 'overdue');
    
    const totalLunas = lunasBills.reduce((s, t) => s + (Number(t.Nominal) || 0), 0);
    const totalBelum = belumBills.reduce((s, t) => s + (Number(t.Nominal) || 0), 0);
    const totalMenunggak = menunggakBills.reduce((s, t) => s + (Number(t.Nominal) || 0), 0);
    const santriMenunggakSet = new Set(menunggakBills.map(t => t.ID_Santri));
    
    const elLunas = document.getElementById('keuStatLunas');
    const elLunasSub = document.getElementById('keuStatLunasSub');
    const elBelum = document.getElementById('keuStatBelum');
    const elBelumSub = document.getElementById('keuStatBelumSub');
    const elMenunggak = document.getElementById('keuStatMenunggak');
    const elMenunggakSub = document.getElementById('keuStatMenunggakSub');
    
    if (elLunas) elLunas.textContent = formatRupiah(totalLunas);
    if (elLunasSub) elLunasSub.textContent = `${lunasBills.length} pembayaran lunas`;
    if (elBelum) elBelum.textContent = formatRupiah(totalBelum);
    if (elBelumSub) elBelumSub.textContent = `${belumBills.length} tagihan belum lunas`;
    if (elMenunggak) elMenunggak.textContent = `${santriMenunggakSet.size} Santri`;
    if (elMenunggakSub) elMenunggakSub.textContent = `${menunggakBills.length} tagihan (${formatRupiah(totalMenunggak)})`;
    
    // Status SPP Card
    renderCardStatusSpp();
    
    // Tab aktif
    if (currentKeuanganTab === 'perlu-ditagih') {
        renderTabPerluDitagih();
    } else if (currentKeuanganTab === 'matriks-spp') {
        renderTabMatriksSpp();
    } else if (currentKeuanganTab === 'semua-tagihan') {
        renderTabSemuaTagihan();
    }
}

// Kompatibilitas untuk pemanggil lama & pagination
function renderTableTagihan() {
    renderKeuanganView();
}

// Helper normalisasi konfigurasi SPP agar kompatibel dua arah (frontend <-> backend GAS)
let _autoSppIssuingLock = false;

function normalizeSppConfig(raw = {}) {
    let isAktif = true;
    if (raw.aktif !== undefined) isAktif = Boolean(raw.aktif);
    else if (raw.otomatis !== undefined) isAktif = Boolean(raw.otomatis);

    const tglTerbit = Number(raw.tglTerbit !== undefined ? raw.tglTerbit : raw.hariTerbit) || 1;
    const tglJatuhTempo = Number(raw.tglJatuhTempo !== undefined ? raw.tglJatuhTempo : raw.hariTempo) || 10;
    const nominal = Number(raw.nominal) || 200000;
    const kategori = raw.kategori || 'Syahriyah (SPP)';
    const catatan = raw.catatan || 'SPP Bulanan Santri Mukim';

    return {
        aktif: isAktif,
        otomatis: isAktif,
        tglTerbit: tglTerbit,
        hariTerbit: tglTerbit,
        tglJatuhTempo: tglJatuhTempo,
        hariTempo: tglJatuhTempo,
        nominal: nominal,
        kategori: kategori,
        catatan: catatan
    };
}

function getLocalSppStatusForPeriode(periode) {
    const targetPeriode = periode || currentKeuanganPeriode;
    const activeSantris = (state.santri || []).filter(s => {
        const st = String(s.Status || 'Aktif').trim().toLowerCase();
        return st !== 'alumni' && st !== 'nonaktif' && st !== 'keluar';
    });
    const allTagihan = state.tagihan || [];
    const billedIds = new Set();

    allTagihan.forEach(t => {
        const kat = String(t.Kategori || '').toLowerCase();
        const jud = String(t.Judul_Tagihan || '').toLowerCase();
        const isSpp = kat.includes('spp') || kat.includes('syahriyah') || jud.includes('spp') || jud.includes('syahriyah');
        if (!isSpp) return;
        if (getTagihanPeriode(t) === targetPeriode) {
            billedIds.add(String(t.ID_Santri || '').trim().toUpperCase());
        }
    });

    const belumTerbitList = activeSantris.filter(s => !billedIds.has(String(s.ID_Santri || '').trim().toUpperCase()));
    const sudahTerbitCount = activeSantris.length - belumTerbitList.length;

    return {
        periode: targetPeriode,
        totalSantriAktif: activeSantris.length,
        santriSudahTerbit: sudahTerbitCount,
        santriBelumTerbit: belumTerbitList.length,
        belumTerbitSantris: belumTerbitList,
        isLengkap: activeSantris.length > 0 ? belumTerbitList.length === 0 : true
    };
}

async function ensureSppTerbitPeriode(periode, cfg, showToast = true) {
    if (_autoSppIssuingLock) return;
    _autoSppIssuingLock = true;
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    const sppCfg = normalizeSppConfig(cfg || {});
    const targetPeriode = periode || currentKeuanganPeriode;

    try {
        // 1. Panggil endpoint massal backend terlebih dahulu
        const res = await apiCall('terbitkanSppSekarang', token, targetPeriode);

        // 2. Muat ulang data terbaru untuk memastikan apakah masih ada santri aktif (misal status "Santri Aktif") yang terlewat
        const appRes = await apiCall('fetchAppData', token);
        if (appRes && appRes.status === 'success' && appRes.data) {
            state = { ...state, ...appRes.data };
        }

        const localCheck = getLocalSppStatusForPeriode(targetPeriode);
        if (localCheck.belumTerbitSantris.length > 0) {
            const parts = targetPeriode.split('-');
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const namaBulan = INDO_MONTHS_KEU[m - 1] || 'Bulan';
            const maxDays = new Date(y, m, 0).getDate();
            const tempoDay = Math.min(Number(sppCfg.tglJatuhTempo) || 10, maxDays);
            const jatuhTempoStr = `${tempoDay} ${namaBulan} ${y}`;
            const judulStr = `Syahriyah (SPP) Bulan ${namaBulan} ${y}`;

            for (const s of localCheck.belumTerbitSantris) {
                await apiCall('createTagihan', token, {
                    targetSantri: s.ID_Santri,
                    kategori: sppCfg.kategori || 'Syahriyah (SPP)',
                    judulTagihan: judulStr,
                    nominal: Number(sppCfg.nominal) || 200000,
                    jatuhTempo: jatuhTempoStr,
                    status: 'Belum Lunas',
                    metodeBayar: '',
                    catatan: sppCfg.catatan || 'SPP Bulanan Santri Mukim',
                    periode: targetPeriode
                });
            }
        }

        if (showToast) {
            AppNotify.toast('success', (res && res.message) ? res.message : `Tagihan SPP periode ${formatPeriodeDisplay(targetPeriode)} berhasil diterbitkan!`);
        }
        refreshAdminData();
    } catch (err) {
        if (showToast) {
            AppNotify.error('Gagal Menerbitkan SPP', err.message || 'Terjadi kesalahan jaringan');
        }
    } finally {
        _autoSppIssuingLock = false;
    }
}

function renderCardStatusSpp() {
    const card = document.getElementById('cardStatusSppOtomatis');
    if (!card) return;
    
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    if (!token) return;
    
    card.innerHTML = `<div class="py-3 text-center text-gray-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Memeriksa status penerbitan SPP periode ${formatPeriodeDisplay(currentKeuanganPeriode)}...</div>`;
    
    apiCall('getStatusSpp', token, currentKeuanganPeriode).then(res => {
        if (!card) return;
        if (res.status !== 'success') {
            card.className = "mb-5 bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 sm:p-5 border border-red-200 dark:border-red-900/40 shadow-xs";
            card.innerHTML = `<div class="p-2 text-xs text-red-600 dark:text-red-400"><i class="fa-solid fa-circle-exclamation mr-1.5"></i>Gagal memeriksa status SPP: ${res.message || 'Error'}</div>`;
            return;
        }
        
        const d = res.data || {};
        let cachedCfg = null;
        try {
            cachedCfg = JSON.parse(localStorage.getItem('zadil_spp_config_v4') || 'null');
        } catch (e) {}

        // Normalisasi config dari backend maupun cache lokal jika backend lama belum menyimpan key `otomatis`
        const rawCfg = d.config ? d.config : (cachedCfg ? { ...d, ...cachedCfg } : d);
        const cfg = normalizeSppConfig(rawCfg);
        const localStat = getLocalSppStatusForPeriode(currentKeuanganPeriode);

        const totalSantriAktif = localStat.totalSantriAktif > 0
            ? localStat.totalSantriAktif
            : (d.totalSantriAktif !== undefined ? d.totalSantriAktif : (d.totalAktif || 0));
        const santriSudahTerbit = localStat.totalSantriAktif > 0
            ? localStat.santriSudahTerbit
            : (d.santriSudahTerbit !== undefined ? d.santriSudahTerbit : (d.sudahDitagih || 0));
        const santriBelumTerbit = Math.max(0, totalSantriAktif - santriSudahTerbit);
        const isLengkap = totalSantriAktif === 0 || santriBelumTerbit === 0;

        const periodeDisplay = formatPeriodeDisplay(d.periode || currentKeuanganPeriode);
        const pct = totalSantriAktif > 0 ? Math.round((santriSudahTerbit / totalSantriAktif) * 100) : 100;

        // Jika aturan otomatis AKTIF, periode yang dibuka adalah bulan berjalan, dan tanggal hari ini >= tglTerbit,
        // otomatis terbitkan SPP untuk santri aktif yang belum punya tagihan bulan ini!
        const now = new Date();
        const curYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        if (cfg.aktif && currentKeuanganPeriode === curYearMonth && now.getDate() >= cfg.tglTerbit && santriBelumTerbit > 0 && !_autoSppIssuingLock) {
            card.className = "mb-5 bg-emerald-50/80 dark:bg-emerald-950/20 rounded-2xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-900/40 shadow-xs";
            card.innerHTML = `<div class="py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><i class="fa-solid fa-spinner fa-spin"></i> Otomasi SPP Aktif (Tgl Terbit ${cfg.tglTerbit}): Menerbitkan ${santriBelumTerbit} tagihan SPP periode ${periodeDisplay} secara otomatis...</div>`;
            ensureSppTerbitPeriode(currentKeuanganPeriode, cfg, true);
            return;
        }
        
        if (!cfg.aktif) {
            card.className = "mb-5 bg-amber-50/80 dark:bg-amber-950/20 rounded-2xl p-4 sm:p-5 border border-amber-200 dark:border-amber-900/40 shadow-xs";
            card.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                            <i class="fa-solid fa-clock-rotate-left text-lg"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Otomasi SPP Bulanan Nonaktif</h4>
                            <p class="text-xs text-amber-800 dark:text-amber-300 mt-0.5">Sistem tidak akan membuat tagihan SPP otomatis di awal bulan. Anda dapat mengaktifkannya pada menu Aturan SPP.</p>
                        </div>
                    </div>
                    <button onclick="openModalAturanSpp()" class="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center justify-center gap-1.5 shadow-2xs">
                        <i class="fa-solid fa-gear"></i> Aktifkan Aturan SPP
                    </button>
                </div>`;
        } else if (isLengkap) {
            card.className = "mb-5 bg-emerald-50/80 dark:bg-emerald-950/20 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs";
            card.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <i class="fa-solid fa-circle-check text-lg"></i>
                        </div>
                        <div>
                            <div class="flex flex-wrap items-center gap-2">
                                <h4 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Otomasi SPP Aktif &bull; Periode ${periodeDisplay} Lengkap</h4>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">Terbit Tgl ${cfg.tglTerbit} &bull; Tempo Tgl ${cfg.tglJatuhTempo}</span>
                            </div>
                            <p class="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">Seluruh ${totalSantriAktif} santri aktif telah diterbitkan tagihan SPP (${formatRupiah(cfg.nominal)}) untuk periode ini.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900 shrink-0 shadow-2xs">
                        <i class="fa-solid fa-users"></i> ${santriSudahTerbit} dari ${totalSantriAktif} Santri
                    </div>
                </div>`;
        } else {
            card.className = "mb-5 bg-yellow-50/90 dark:bg-yellow-950/20 rounded-2xl p-4 sm:p-5 border border-yellow-200 dark:border-yellow-900/40 shadow-xs";
            card.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 flex items-center justify-center shrink-0">
                            <i class="fa-solid fa-triangle-exclamation text-lg"></i>
                        </div>
                        <div class="space-y-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <h4 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white">SPP ${periodeDisplay} Belum Lengkap</h4>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800">Jadwal Terbit Tgl ${cfg.tglTerbit} &bull; Tempo Tgl ${cfg.tglJatuhTempo}</span>
                            </div>
                            <p class="text-xs text-yellow-800 dark:text-yellow-300">Ada <b>${santriBelumTerbit} santri aktif</b> yang belum memiliki tagihan SPP periode ini.</p>
                            <div class="w-full bg-yellow-200 dark:bg-yellow-900/40 rounded-full h-2 max-w-xs mt-1">
                                <div class="bg-yellow-600 h-2 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                            </div>
                            <span class="text-[10px] text-gray-500">${santriSudahTerbit} dari ${totalSantriAktif} santri terbit (${pct}%)</span>
                        </div>
                    </div>
                    <button onclick="konfirmasiTerbitkanSppSekarang()" class="px-4 py-2.5 bg-[#9a2024] hover:bg-[#871a1e] text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center justify-center gap-1.5 shadow-xs">
                        <i class="fa-solid fa-paper-plane"></i> Terbitkan Sekarang (${santriBelumTerbit} Santri)
                    </button>
                </div>`;
        }
    }).catch(err => {
        if (card) card.innerHTML = `<div class="p-3 text-xs text-gray-400">Status otomatisasi belum dapat dimuat.</div>`;
    });
}

async function konfirmasiTerbitkanSppSekarang() {
    const periodeDisplay = formatPeriodeDisplay(currentKeuanganPeriode);
    const confirmed = await AppNotify.confirm(
        'Terbitkan SPP Periode Ini?',
        `Sistem akan menerbitkan tagihan SPP untuk santri aktif yang belum memiliki tagihan periode ${periodeDisplay}. Idempoten dan aman dari duplikasi.`,
        'Ya, Terbitkan Sekarang',
        'Batal'
    );
    if (!confirmed) return;
    
    AppNotify.loading('Menerbitkan SPP...');
    let cachedCfg = {};
    try { cachedCfg = JSON.parse(localStorage.getItem('zadil_spp_config_v4') || '{}'); } catch (e) {}
    await ensureSppTerbitPeriode(currentKeuanganPeriode, cachedCfg, true);
    AppNotify.close();
}

// --- TAB 1: PERLU DITAGIH ---
function setFilterKatPerluDitagih(val) {
    filterKatPerluDitagih = val;
    const btnAll = document.getElementById('btnKatAll');
    const btnSpp = document.getElementById('btnKatSpp');
    const btnLain = document.getElementById('btnKatLain');
    
    const activeClass = "px-3 py-1.5 rounded-xl text-xs font-bold bg-[#9a2024] text-white transition whitespace-nowrap shadow-2xs";
    const inactiveClass = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition whitespace-nowrap";
    
    if (btnAll) btnAll.className = val === 'ALL' ? activeClass : inactiveClass;
    if (btnSpp) btnSpp.className = val === 'SPP' ? activeClass : inactiveClass;
    if (btnLain) btnLain.className = val === 'LAIN' ? activeClass : inactiveClass;
    
    renderTabPerluDitagih();
}

function renderTabPerluDitagih() {
    const listEl = document.getElementById('listPerluDitagih');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    const searchQuery = (document.getElementById('searchPerluDitagih')?.value || '').toLowerCase().trim();
    const allTagihan = state.tagihan || [];
    
    const enriched = allTagihan.map(t => {
        const s = (state.santri || []).find(san => san.ID_Santri === t.ID_Santri);
        return {
            ...t,
            Nama_Santri: s ? s.Nama_Santri : 'Santri Terhapus',
            No_HP_Wali: s ? s.No_HP_Wali : '',
            periodeCalculated: getTagihanPeriode(t)
        };
    });
    
    let filtered = enriched.filter(t => t.Status !== 'Lunas' && t.periodeCalculated === currentKeuanganPeriode);
    
    if (filterKatPerluDitagih === 'SPP') {
        filtered = filtered.filter(t => t.Kategori === 'Syahriyah (SPP)' || String(t.Judul_Tagihan).toLowerCase().includes('spp'));
    } else if (filterKatPerluDitagih === 'LAIN') {
        filtered = filtered.filter(t => t.Kategori !== 'Syahriyah (SPP)' && !String(t.Judul_Tagihan).toLowerCase().includes('spp'));
    }
    
    if (searchQuery) {
        filtered = filtered.filter(t => 
            t.Nama_Santri.toLowerCase().includes(searchQuery) ||
            t.ID_Santri.toLowerCase().includes(searchQuery) ||
            (t.Judul_Tagihan && t.Judul_Tagihan.toLowerCase().includes(searchQuery))
        );
    }
    
    const badgeEl = document.getElementById('badgeCountPerluDitagih');
    if (badgeEl) badgeEl.textContent = filtered.length;
    
    if (filtered.length === 0) {
        const periodeDisplay = formatPeriodeDisplay(currentKeuanganPeriode);
        listEl.innerHTML = `
            <div class="py-12 px-4 text-center">
                <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-3">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white text-base">Alhamdulillah, Tidak Ada Tagihan yang Perlu Ditagih!</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">Seluruh tagihan periode <b>${periodeDisplay}</b> telah lunas, atau belum ada tagihan yang diterbitkan.</p>
            </div>`;
        return;
    }
    
    // Sort: terlambat terbanyak di atas, lalu urutkan tempo
    filtered.sort((a, b) => {
        const ketA = hitungKeterlambatan(a);
        const ketB = hitungKeterlambatan(b);
        const daysA = ketA.status === 'overdue' ? ketA.days : -9999;
        const daysB = ketB.status === 'overdue' ? ketB.days : -9999;
        return daysB - daysA;
    });
    
    filtered.forEach(t => {
        const ket = hitungKeterlambatan(t);
        let dueBadge = '';
        if (ket.status === 'overdue') {
            dueBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                <i class="fa-solid fa-triangle-exclamation text-[10px]"></i> ${ket.text}
            </span>`;
        } else if (ket.status === 'due-soon') {
            dueBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                <i class="fa-solid fa-clock text-[10px]"></i> ${ket.text}
            </span>`;
        } else {
            dueBadge = `<span class="text-xs text-gray-500 dark:text-gray-400"><i class="fa-regular fa-calendar mr-1"></i>Tempo: <b>${t.Jatuh_Tempo || '-'}</b></span>`;
        }
        
        listEl.innerHTML += `
            <div class="p-4 rounded-xl border border-gray-200 dark:border-darkborder bg-white dark:bg-darkcard hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div class="space-y-1.5 flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="font-bold text-gray-900 dark:text-white text-sm sm:text-base">${t.Nama_Santri}</span>
                        <span class="font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-[#9a2024] dark:text-[#f29fa3] font-semibold">${t.ID_Santri}</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">${t.Kategori || 'Tagihan'}</span>
                    </div>
                    <div class="text-xs text-gray-700 dark:text-gray-300 font-medium">${t.Judul_Tagihan}</div>
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                        ${dueBadge}
                        ${t.Catatan ? `<span class="text-gray-400 italic text-[11px]">• ${t.Catatan}</span>` : ''}
                    </div>
                </div>
                <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-darkborder">
                    <div class="text-left sm:text-right">
                        <div class="text-[10px] text-gray-400 uppercase font-semibold">Total Tagihan</div>
                        <div class="text-base sm:text-lg font-extrabold text-[#9a2024] dark:text-[#f29fa3]">${formatRupiah(t.Nominal)}</div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button onclick="openModalBayar('${t.ID_Tagihan}')" class="px-3 py-1.5 bg-[#1c6b45] hover:bg-[#155436] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs">
                            <i class="fa-solid fa-check"></i> Sahkan Lunas
                        </button>
                        <button onclick="kirimWaTagihan('${t.ID_Tagihan}')" class="p-2 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg transition" title="Kirim Pengingat WhatsApp">
                            <i class="fa-brands fa-whatsapp text-sm"></i>
                        </button>
                        <button onclick="deleteTagihanAction('${t.ID_Tagihan}', '${t.Judul_Tagihan}')" class="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition" title="Hapus Tagihan">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    });
}

// --- TAB 2: MATRIKS SPP 12 BULAN ---
function renderTabMatriksSpp() {
    const tableBody = document.getElementById('bodyMatriksSpp');
    const tableFoot = document.getElementById('footMatriksSpp');
    const displayTahun = document.getElementById('matriksTahunDisplay');
    if (!tableBody) return;
    
    if (displayTahun) displayTahun.textContent = currentMatriksTahun;
    tableBody.innerHTML = '';
    if (tableFoot) tableFoot.innerHTML = '';
    
    const searchQuery = (document.getElementById('searchMatriksSantri')?.value || '').toLowerCase().trim();
    
    let santriList = (state.santri || []).filter(s => s.Status !== 'Alumni');
    if (searchQuery) {
        santriList = santriList.filter(s => 
            (s.Nama_Santri && s.Nama_Santri.toLowerCase().includes(searchQuery)) ||
            (s.ID_Santri && s.ID_Santri.toLowerCase().includes(searchQuery))
        );
    }
    
    santriList.sort((a, b) => (a.Nama_Santri || '').localeCompare(b.Nama_Santri || ''));
    
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthStats = months.map(() => ({ lunas: 0, belum: 0 }));
    const allTagihan = state.tagihan || [];
    
    if (santriList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="13" class="p-6 text-center text-gray-500">Tidak ada santri yang sesuai pencarian.</td></tr>`;
        return;
    }
    
    const now = new Date();
    const curYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    santriList.forEach(s => {
        let rowHtml = `<tr class="border-b dark:border-darkborder hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
            <td class="p-3 sticky left-0 bg-white dark:bg-darkcard border-r border-gray-200 dark:border-darkborder font-semibold text-gray-900 dark:text-white truncate max-w-[200px] z-10">
                <div class="truncate">${s.Nama_Santri}</div>
                <div class="font-mono text-[10px] text-gray-400 font-normal">${s.ID_Santri}</div>
            </td>`;
        
        months.forEach((mStr, idx) => {
            const pKey = `${currentMatriksTahun}-${mStr}`;
            const t = allTagihan.find(x => 
                x.ID_Santri === s.ID_Santri &&
                getTagihanPeriode(x) === pKey &&
                (x.Kategori === 'Syahriyah (SPP)' || String(x.Judul_Tagihan).toLowerCase().includes('spp'))
            );
            
            let cellContent = '';
            if (t) {
                if (t.Status === 'Lunas') {
                    monthStats[idx].lunas++;
                    cellContent = `<button onclick="cetakKwitansiAdmin('${t.ID_Tagihan}')" class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold inline-flex items-center justify-center text-xs transition hover:scale-110 shadow-2xs" title="Lunas: ${formatRupiah(t.Nominal)} - Klik untuk cetak kwitansi">✓</button>`;
                } else {
                    monthStats[idx].belum++;
                    const ket = hitungKeterlambatan(t);
                    const isOverdue = ket.status === 'overdue';
                    const colorClass = isOverdue
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-200'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-200';
                    cellContent = `<button onclick="openModalBayar('${t.ID_Tagihan}')" class="w-6 h-6 rounded-full ${colorClass} font-bold inline-flex items-center justify-center text-xs transition hover:scale-110 shadow-2xs" title="${isOverdue ? 'Lewat tempo: ' + ket.text : 'Belum lunas: ' + formatRupiah(t.Nominal)} - Klik untuk tandai lunas">●</button>`;
                }
            } else {
                const isPastOrCurrent = pKey <= curYearMonth;
                if (isPastOrCurrent) {
                    cellContent = `<button onclick="terbitkanSppSantriBulan('${s.ID_Santri}', '${pKey}')" class="w-6 h-6 rounded-full text-gray-300 dark:text-slate-600 hover:text-[#9a2024] hover:bg-red-50 dark:hover:bg-red-950/40 font-bold inline-flex items-center justify-center text-xs transition" title="Belum terbit. Klik untuk terbitkan SPP bulan ${INDO_MONTHS_KEU[idx]}">–</button>`;
                } else {
                    cellContent = `<span class="text-gray-300 dark:text-slate-700 text-xs select-none">–</span>`;
                }
            }
            
            rowHtml += `<td class="p-2 text-center border-r border-gray-100 dark:border-darkborder">${cellContent}</td>`;
        });
        
        rowHtml += `</tr>`;
        tableBody.innerHTML += rowHtml;
    });
    
    if (tableFoot) {
        let footHtml = `<tr>
            <td class="p-3 sticky left-0 bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-darkborder font-bold text-gray-700 dark:text-gray-300 z-10">
                <div>Total Lunas</div>
                <div class="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Belum Lunas</div>
            </td>`;
        monthStats.forEach(stat => {
            footHtml += `<td class="p-2 text-center text-xs">
                <div class="font-extrabold text-emerald-600 dark:text-emerald-400">${stat.lunas}</div>
                <div class="font-semibold text-amber-600 dark:text-amber-400 text-[11px]">${stat.belum}</div>
            </td>`;
        });
        footHtml += `</tr>`;
        tableFoot.innerHTML = footHtml;
    }
}

async function terbitkanSppSantriBulan(idSantri, periode) {
    const s = (state.santri || []).find(x => x.ID_Santri === idSantri);
    const namaSantri = s ? s.Nama_Santri : idSantri;
    const periodeDisplay = formatPeriodeDisplay(periode);
    
    const confirmed = await AppNotify.confirm(
        'Terbitkan SPP Satuan?',
        `Terbitkan tagihan SPP periode ${periodeDisplay} untuk ${namaSantri}?`,
        'Ya, Terbitkan',
        'Batal'
    );
    if (!confirmed) return;
    
    AppNotify.loading('Menerbitkan SPP...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    const parts = (periode || '').split('-');
    const y = parts[0];
    const m = parts[1];
    const mIdx = parseInt(m, 10) - 1;
    const mName = INDO_MONTHS_KEU[mIdx] || m;
    
    const payload = {
        targetSantri: idSantri,
        kategori: 'Syahriyah (SPP)',
        judulTagihan: `Syahriyah (SPP) Bulan ${mName} ${y}`,
        nominal: 200000,
        jatuhTempo: `10 ${mName} ${y}`,
        status: 'Belum Lunas',
        metodeBayar: '',
        catatan: 'SPP Bulanan Santri Mukim',
        periode: periode
    };
    
    apiCall('createTagihan', token, payload).then(res => {
        AppNotify.close();
        if (res.status === 'success') {
            AppNotify.toast('success', `SPP ${periodeDisplay} berhasil diterbitkan`);
            refreshAdminData();
        } else {
            AppNotify.error('Gagal Menerbitkan SPP', res.message);
        }
    });
}

// --- TAB 3: SEMUA TAGIHAN ---
function setFilterStatusSemuaTagihan(val) {
    filterStatusSemuaTagihan = val;
    const btnAll = document.getElementById('btnStatusAll');
    const btnBelum = document.getElementById('btnStatusBelum');
    const btnLunas = document.getElementById('btnStatusLunas');
    
    const activeClass = "px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#9a2024] text-white transition";
    const inactiveClass = "px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition";
    
    if (btnAll) btnAll.className = val === 'ALL' ? activeClass : inactiveClass;
    if (btnBelum) btnBelum.className = val === 'Belum Lunas' ? activeClass : inactiveClass;
    if (btnLunas) btnLunas.className = val === 'Lunas' ? activeClass : inactiveClass;
    
    renderTabSemuaTagihan();
}

function renderTabSemuaTagihan() {
    const tb = document.getElementById('tableTagihanBody');
    const cardsEl = document.getElementById('cardsTagihanMobile');
    if (!tb && !cardsEl) return;
    
    const allTagihan = state.tagihan || [];
    
    const badgeAll = document.getElementById('badgeCountSemuaTagihan');
    if (badgeAll) badgeAll.textContent = allTagihan.length;
    
    const enriched = allTagihan.map(t => {
        const s = (state.santri || []).find(san => san.ID_Santri === t.ID_Santri);
        return {
            ...t,
            Nama_Santri: s ? s.Nama_Santri : 'Santri Terhapus',
            No_HP_Wali: s ? s.No_HP_Wali : ''
        };
    });
    
    let filtered = enriched;
    if (filterStatusSemuaTagihan !== 'ALL') {
        filtered = filtered.filter(t => t.Status === filterStatusSemuaTagihan);
    }
    
    const paginationResult = getPaginatedData(filtered, ['Nama_Santri', 'ID_Santri', 'Judul_Tagihan', 'Kategori', 'ID_Tagihan'], 'tagihan');
    
    if (tb) {
        tb.innerHTML = '';
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
                        <td class="p-3.5">
                            <div class="font-bold text-gray-900 dark:text-white">${t.Nama_Santri}</div>
                            <div class="flex items-center gap-1.5 mt-0.5">
                                <span class="font-mono text-[11px] text-[#9a2024] dark:text-[#f29fa3] font-semibold">${t.ID_Santri}</span>
                                <span class="text-gray-300">•</span>
                                <span class="font-mono text-[10px] text-gray-400">${t.ID_Tagihan}</span>
                            </div>
                        </td>
                        <td class="p-3.5">
                            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">${t.Kategori || 'Tagihan'}</span>
                            <div class="font-semibold text-gray-800 dark:text-gray-200 mt-1">${t.Judul_Tagihan}</div>
                            ${t.Catatan ? `<div class="text-[11px] text-gray-400 italic">${t.Catatan}</div>` : ''}
                        </td>
                        <td class="p-3.5 font-bold text-gray-900 dark:text-white">${formatRupiah(t.Nominal)}</td>
                        <td class="p-3.5 text-xs text-gray-600 dark:text-gray-400">
                            <div>Tempo: <b>${t.Jatuh_Tempo || '-'}</b></div>
                            ${isLunas ? `<div class="text-[11px] text-[#1c6b45] dark:text-[#83c9a6] mt-0.5">Dibayar: ${t.Tgl_Bayar || '-'} (${t.Metode_Bayar || '-'})</div>` : ''}
                        </td>
                        <td class="p-3.5">${badge}</td>
                        <td class="p-3.5 text-center">
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
    }
    
    if (cardsEl) {
        cardsEl.innerHTML = '';
        if (paginationResult.pageData.length === 0) {
            cardsEl.innerHTML = '<div class="p-6 text-center text-gray-500 text-xs">Belum ada data tagihan.</div>';
        } else {
            paginationResult.pageData.forEach(t => {
                const isLunas = t.Status === 'Lunas';
                const badge = isLunas
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#edf7f2] text-[#1c6b45]"><i class="fa-solid fa-circle-check mr-1"></i>Lunas</span>`
                    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fdf2f2] text-[#9a2024]"><i class="fa-solid fa-clock mr-1"></i>Belum Lunas</span>`;
                cardsEl.innerHTML += `
                    <div class="p-3.5 rounded-xl border border-gray-200 dark:border-darkborder bg-white dark:bg-darkcard space-y-2.5 text-xs">
                        <div class="flex justify-between items-start gap-2">
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white text-sm">${t.Nama_Santri}</div>
                                <div class="font-mono text-[11px] text-[#9a2024]">${t.ID_Santri} • ${t.ID_Tagihan}</div>
                            </div>
                            <div>${badge}</div>
                        </div>
                        <div class="border-t border-b border-gray-100 dark:border-darkborder py-2 space-y-1">
                            <div class="text-[10px] uppercase font-bold text-gray-400">${t.Kategori || 'Tagihan'}</div>
                            <div class="font-semibold text-gray-800 dark:text-gray-200">${t.Judul_Tagihan}</div>
                            <div class="flex justify-between items-center pt-1">
                                <span class="text-gray-500">Nominal:</span>
                                <span class="font-extrabold text-sm text-[#9a2024]">${formatRupiah(t.Nominal)}</span>
                            </div>
                            <div class="flex justify-between items-center text-[11px]">
                                <span class="text-gray-500">Tempo:</span>
                                <span class="font-medium">${t.Jatuh_Tempo || '-'}</span>
                            </div>
                        </div>
                        <div class="flex justify-end gap-1.5 pt-1">
                            ${!isLunas ? `
                                <button onclick="openModalBayar('${t.ID_Tagihan}')" class="px-3 py-1.5 bg-[#1c6b45] text-white rounded-lg font-bold text-xs"><i class="fa-solid fa-check mr-1"></i> Lunas</button>
                                <button onclick="kirimWaTagihan('${t.ID_Tagihan}')" class="p-2 bg-green-50 text-green-700 rounded-lg"><i class="fa-brands fa-whatsapp"></i></button>
                            ` : `
                                <button onclick="cetakKwitansiAdmin('${t.ID_Tagihan}')" class="px-3 py-1.5 bg-[#edf7f2] text-[#1c6b45] rounded-lg font-bold text-xs"><i class="fa-solid fa-file-invoice mr-1"></i> Kwitansi</button>
                                <button onclick="batalLunasTagihan('${t.ID_Tagihan}')" class="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-xs"><i class="fa-solid fa-rotate-left"></i></button>
                            `}
                            <button onclick="deleteTagihanAction('${t.ID_Tagihan}', '${t.Judul_Tagihan}')" class="p-2 bg-red-50 text-red-600 rounded-lg"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>`;
            });
        }
    }
    
    const pagEl = document.getElementById('paginationTagihan');
    if (pagEl) pagEl.innerHTML = renderPaginationHtml('tagihan', paginationResult.totalPages);
}

// --- MODAL & OPERASI TAGIHAN ---
function openModalTagihan(mode = 'INDIVIDU') {
    const form = document.getElementById('formBuatTagihan');
    if (form) form.reset();
    
    const sel = document.getElementById('inputTagihanSantri');
    if (sel) {
        sel.innerHTML = '<option value="">-- Pilih Santri Penerima --</option>';
        const santriList = (state.santri || []).filter(s => s.Status !== 'Alumni');
        santriList.sort((a, b) => (a.Nama_Santri || '').localeCompare(b.Nama_Santri || ''));
        santriList.forEach(s => {
            sel.innerHTML += `<option value="${s.ID_Santri}">${s.Nama_Santri} (${s.ID_Santri})</option>`;
        });
        if (santriList.length > 0) sel.value = santriList[0].ID_Santri;
    }
    
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const defaultDateStr = `${curYear}-${curMonth}-10`;
    
    const inputDate = document.getElementById('inputTagihanTempoDate');
    if (inputDate) inputDate.value = defaultDateStr;
    
    const inputPeriode = document.getElementById('inputTagihanPeriode');
    if (inputPeriode) inputPeriode.value = currentKeuanganPeriode || `${curYear}-${curMonth}`;
    
    const inputKategori = document.getElementById('inputTagihanKategori');
    if (inputKategori) {
        inputKategori.value = 'Syahriyah (SPP)';
        autoFillTagihanPreset('Syahriyah (SPP)');
    }
    
    const modal = document.getElementById('modalBuatTagihan');
    const content = document.getElementById('modalBuatTagihanContent');
    if (modal && content) {
        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('scale-95'); }, 10);
    }
}

function autoFillTagihanPreset(val) {
    const now = new Date();
    const curMonthYear = `${INDO_MONTHS_KEU[now.getMonth()]} ${now.getFullYear()}`;
    
    const judulEl = document.getElementById('inputTagihanJudul');
    const nominalEl = document.getElementById('inputTagihanNominal');
    const catatanEl = document.getElementById('inputTagihanCatatan');
    
    if (val === 'Syahriyah (SPP)') {
        if (judulEl) judulEl.value = `Syahriyah (SPP) Bulan ${curMonthYear}`;
        if (nominalEl) nominalEl.value = 200000;
        if (catatanEl) catatanEl.value = 'SPP Bulanan Santri Mukim';
    } else if (val === 'Pendaftaran & Fasilitas') {
        if (judulEl) judulEl.value = 'Paket Biaya Pendaftaran Santri Mukim (Pendaftaran, Almari, Infaq Gedung, Kesehatan, Kitab)';
        if (nominalEl) nominalEl.value = 1800000;
        if (catatanEl) catatanEl.value = 'Pendaftaran 100rb, Almari 500rb, Gedung 1jt, Kesehatan 100rb, Kitab 100rb';
    } else if (val === 'Almari') {
        if (judulEl) judulEl.value = 'Biaya Almari Santri';
        if (nominalEl) nominalEl.value = 500000;
        if (catatanEl) catatanEl.value = 'Fasilitas almari santri baru';
    } else if (val === 'Infaq Gedung') {
        if (judulEl) judulEl.value = 'Infaq Gedung Pesantren';
        if (nominalEl) nominalEl.value = 1000000;
        if (catatanEl) catatanEl.value = 'Pengembangan sarana & prasarana pondok';
    } else if (val === 'Kitab & Buku') {
        if (judulEl) judulEl.value = 'Biaya Kitab dan Buku Panduan';
        if (nominalEl) nominalEl.value = 100000;
        if (catatanEl) catatanEl.value = 'Paket kitab matan & tajwid';
    } else if (val === 'Kesehatan') {
        if (judulEl) judulEl.value = 'Biaya Kesehatan Santri';
        if (nominalEl) nominalEl.value = 100000;
        if (catatanEl) catatanEl.value = 'Dana operasional poskestren';
    } else {
        if (judulEl) judulEl.value = '';
        if (nominalEl) nominalEl.value = 0;
        if (catatanEl) catatanEl.value = '';
    }
}

function saveTagihan(e) {
    e.preventDefault();
    AppNotify.loading('Menerbitkan Tagihan...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    
    const dateVal = document.getElementById('inputTagihanTempoDate')?.value;
    let jatuhTempoStr = dateVal || '';
    let periodeVal = document.getElementById('inputTagihanPeriode')?.value || '';
    
    if (dateVal && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        const parts = dateVal.split('-');
        const y = parts[0];
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        jatuhTempoStr = `${d} ${INDO_MONTHS_KEU[m - 1]} ${y}`;
        if (!periodeVal) periodeVal = `${y}-${parts[1]}`;
    }
    
    const payload = {
        targetSantri: document.getElementById('inputTagihanSantri').value,
        kategori: document.getElementById('inputTagihanKategori').value,
        judulTagihan: document.getElementById('inputTagihanJudul').value,
        nominal: Number(document.getElementById('inputTagihanNominal').value) || 0,
        jatuhTempo: jatuhTempoStr,
        status: 'Belum Lunas',
        metodeBayar: '',
        catatan: document.getElementById('inputTagihanCatatan').value,
        periode: periodeVal
    };
    
    apiCall('createTagihan', token, payload).then(res => handleRes(res, 'modalBuatTagihan'));
}

// --- MODAL ATURAN SPP ---
function openModalAturanSpp() {
    AppNotify.loading('Memuat Konfigurasi SPP...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    apiCall('getSppConfig', token).then(res => {
        AppNotify.close();
        let cachedCfg = null;
        try {
            cachedCfg = JSON.parse(localStorage.getItem('zadil_spp_config_v4') || 'null');
        } catch (e) {}

        const rawData = (res && res.status === 'success' && res.data) ? res.data : (cachedCfg || {});
        const conf = normalizeSppConfig(rawData);
        
        const elAktif = document.getElementById('aturanSppOtomatis');
        const elNominal = document.getElementById('aturanSppNominal');
        const elKategori = document.getElementById('aturanSppKategori');
        const elTerbit = document.getElementById('aturanSppHariTerbit');
        const elTempo = document.getElementById('aturanSppHariTempo');
        const elCatatan = document.getElementById('aturanSppCatatan');
        
        if (elAktif) elAktif.checked = conf.aktif !== false;
        if (elNominal) elNominal.value = conf.nominal || 200000;
        if (elKategori) elKategori.value = conf.kategori || 'Syahriyah (SPP)';
        if (elTerbit) elTerbit.value = conf.tglTerbit || 1;
        if (elTempo) elTempo.value = conf.tglJatuhTempo || 10;
        if (elCatatan) elCatatan.value = conf.catatan || 'SPP Bulanan Santri Mukim';
        
        const modal = document.getElementById('modalAturanSpp');
        const content = document.getElementById('modalAturanSppContent');
        if (modal && content) {
            modal.classList.remove('hidden');
            setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('scale-95'); }, 10);
        }
    }).catch(err => {
        AppNotify.close();
        AppNotify.error('Error', 'Gagal memuat aturan SPP: ' + (err.message || ''));
    });
}

function saveAturanSppAction(e) {
    e.preventDefault();
    AppNotify.loading('Menyimpan Aturan & Memeriksa Jadwal SPP...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    const isAktif = document.getElementById('aturanSppOtomatis')?.checked ?? true;
    const nominalVal = Number(document.getElementById('aturanSppNominal')?.value) || 200000;
    const kategoriVal = document.getElementById('aturanSppKategori')?.value || 'Syahriyah (SPP)';
    const tglTerbitVal = Number(document.getElementById('aturanSppHariTerbit')?.value) || 1;
    const tglTempoVal = Number(document.getElementById('aturanSppHariTempo')?.value) || 10;
    const catatanVal = document.getElementById('aturanSppCatatan')?.value || 'SPP Bulanan Santri Mukim';

    const payload = normalizeSppConfig({
        aktif: isAktif,
        otomatis: isAktif,
        nominal: nominalVal,
        kategori: kategoriVal,
        tglTerbit: tglTerbitVal,
        hariTerbit: tglTerbitVal,
        tglJatuhTempo: tglTempoVal,
        hariTempo: tglTempoVal,
        catatan: catatanVal
    });

    try {
        localStorage.setItem('zadil_spp_config_v4', JSON.stringify(payload));
    } catch (err) {}
    
    apiCall('saveSppConfig', token, payload).then(async (res) => {
        closeModal('modalAturanSpp', 'modalAturanSppContent');
        const now = new Date();
        const curYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const localStat = getLocalSppStatusForPeriode(curYearMonth);

        // Jika otomatisasi aktif dan tanggal hari ini sudah melewati/sama dengan Tgl Terbit, langsung terbitkan tagihan SPP bulan berjalan!
        if (payload.aktif && now.getDate() >= payload.tglTerbit && localStat.santriBelumTerbit > 0) {
            await ensureSppTerbitPeriode(curYearMonth, payload, true);
            AppNotify.close();
        } else {
            AppNotify.close();
            if (res && res.status === 'success') {
                AppNotify.toast('success', res.message || 'Aturan SPP berhasil disimpan');
            }
            refreshAdminData();
        }
    }).catch(() => {
        AppNotify.close();
    });
}

// --- AKSI PELUNASAN, KWITANSI, WA, & HAPUS ---
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
    if (typeof openModal === 'function') {
        openModal('modalImportSantri', 'modalImportSantriContent');
    } else if (typeof window !== 'undefined' && typeof window.openModal === 'function') {
        window.openModal('modalImportSantri', 'modalImportSantriContent');
    } else {
        const modal = document.getElementById('modalImportSantri');
        const content = document.getElementById('modalImportSantriContent');
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                if (content) content.classList.remove('scale-95');
            }, 10);
        }
    }
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

