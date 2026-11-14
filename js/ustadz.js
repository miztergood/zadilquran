/**
 * ============================================================================
 * ZADIL QURAN - USTADZ WORKSPACE & KOMPREHENSIF MUTABA'AH (js/ustadz.js)
 * Mendukung: Dashboard Utama Halaqah, Input Cepat Anti-Dropdown Berbelit,
 * 4 Pilar Setoran (Ziyadah, Muroja'ah, Binnadhor, Tasmi'),
 * Buku Rekapan Mandiri dengan Multi-Filter & Cetak Rapor Mutaba'ah Digital,
 * serta Manajemen Santri Binaan & Koordinasi WhatsApp Wali Santri.
 * ============================================================================
 */

let state = {
    ustadz: [],
    santri: [],
    setoran: [],
    appName: "Zadil Quran"
};

let currentSection = 'dashboard';
let tsSantri = null, tsSurat = null, lastPinData = null;
let activeSelectedSantriId = null;

// --- QURAN DB (114 SURAT LENGKAP DENGAN JUMLAH AYAT & JUZ YANG DICAKUP) ---
const rawQuran = [
    [1,"Al-Fatihah",7,[1]],[2,"Al-Baqarah",286,[1,2,3]],[3,"Ali 'Imran",200,[3,4]],[4,"An-Nisa'",176,[4,5,6]],[5,"Al-Ma'idah",120,[6,7]],
    [6,"Al-An'am",165,[7,8]],[7,"Al-A'raf",206,[8,9]],[8,"Al-Anfal",75,[9,10]],[9,"At-Taubah",129,[10,11]],[10,"Yunus",109,[11]],
    [11,"Hud",123,[11,12]],[12,"Yusuf",111,[12,13]],[13,"Ar-Ra'd",43,[13]],[14,"Ibrahim",52,[13]],[15,"Al-Hijr",99,[14]],
    [16,"An-Nahl",128,[14]],[17,"Al-Isra'",111,[15]],[18,"Al-Kahf",110,[15,16]],[19,"Maryam",98,[16]],[20,"Taha",135,[16]],
    [21,"Al-Anbiya'",112,[17]],[22,"Al-Hajj",78,[17]],[23,"Al-Mu'minun",118,[18]],[24,"An-Nur",64,[18]],[25,"Al-Furqan",77,[18,19]],
    [26,"Asy-Syu'ara'",227,[19]],[27,"An-Naml",93,[19,20]],[28,"Al-Qasas",88,[20]],[29,"Al-'Ankabut",69,[20,21]],[30,"Ar-Rum",60,[21]],
    [31,"Luqman",34,[21]],[32,"As-Sajdah",30,[21]],[33,"Al-Ahzab",73,[21,22]],[34,"Saba'",54,[22]],[35,"Fatir",45,[22]],
    [36,"Yasin",83,[22,23]],[37,"As-Saffat",182,[23]],[38,"Sad",88,[23]],[39,"Az-Zumar",75,[23,24]],[40,"Ghafir",85,[24]],
    [41,"Fussilat",54,[24,25]],[42,"Asy-Syura",53,[25]],[43,"Az-Zukhruf",89,[25]],[44,"Ad-Dukhan",59,[25]],[45,"Al-Jasiyah",37,[25]],
    [46,"Al-Ahqaf",35,[26]],[47,"Muhammad",38,[26]],[48,"Al-Fath",29,[26]],[49,"Al-Hujurat",18,[26]],[50,"Qaf",45,[26]],
    [51,"Az-Zariyat",60,[26,27]],[52,"At-Tur",49,[27]],[53,"An-Najm",62,[27]],[54,"Al-Qamar",55,[27]],[55,"Ar-Rahman",78,[27]],
    [56,"Al-Waqi'ah",96,[27]],[57,"Al-Hadid",29,[27]],[58,"Al-Mujadilah",22,[28]],[59,"Al-Hasyr",24,[28]],[60,"Al-Mumtahanah",13,[28]],
    [61,"As-Saff",14,[28]],[62,"Al-Jumu'ah",11,[28]],[63,"Al-Munafiqun",11,[28]],[64,"At-Tagabun",18,[28]],[65,"At-Talaq",12,[28]],
    [66,"At-Tahrim",12,[28]],[67,"Al-Mulk",30,[29]],[68,"Al-Qalam",52,[29]],[69,"Al-Haqqah",52,[29]],[70,"Al-Ma'arij",44,[29]],
    [71,"Nuh",28,[29]],[72,"Al-Jinn",28,[29]],[73,"Al-Muzzammil",20,[29]],[74,"Al-Muddassir",56,[29]],[75,"Al-Qiyamah",40,[29]],
    [76,"Al-Insan",31,[29]],[77,"Al-Mursalat",50,[29]],[78,"An-Naba'",40,[30]],[79,"An-Nazi'at",46,[30]],[80,"'Abasa",42,[30]],
    [81,"At-Takwir",29,[30]],[82,"Al-Infitar",19,[30]],[83,"Al-Mutaffifin",36,[30]],[84,"Al-Insyiqaq",25,[30]],[85,"Al-Buruj",22,[30]],
    [86,"At-Tariq",17,[30]],[87,"Al-A'la",19,[30]],[88,"Al-Gasyiyah",26,[30]],[89,"Al-Fajr",30,[30]],[90,"Al-Balad",20,[30]],
    [91,"Asy-Syams",15,[30]],[92,"Al-Lail",21,[30]],[93,"Ad-Duha",11,[30]],[94,"Asy-Syarh",8,[30]],[95,"At-Tin",8,[30]],
    [96,"Al-'Alaq",19,[30]],[97,"Al-Qadr",5,[30]],[98,"Al-Bayyinah",8,[30]],[99,"Az-Zalzalah",8,[30]],[100,"Al-'Adiyat",11,[30]],
    [101,"Al-Qari'ah",11,[30]],[102,"At-Takasur",8,[30]],[103,"Al-'Asr",3,[30]],[104,"Al-Humazah",9,[30]],[105,"Al-Fil",5,[30]],
    [106,"Quraisy",4,[30]],[107,"Al-Ma'un",7,[30]],[108,"Al-Kausar",3,[30]],[109,"Al-Kafirun",6,[30]],[110,"An-Nasr",3,[30]],
    [111,"Al-Lahab",5,[30]],[112,"Al-Ikhlas",4,[30]],[113,"Al-Falaq",5,[30]],[114,"An-Nas",6,[30]]
];
const quranDB = rawQuran.map(q => ({
    no: q[0],
    nama: q[1],
    ayat: q[2],
    juz: Array.isArray(q[3]) ? q[3] : [q[3]],
    juzPrimary: Array.isArray(q[3]) ? q[3][0] : q[3]
}));

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.toggle('hidden');
}

// ==================== NAVIGASI MULTI-MENU KOMPREHENSIF ====================
function switchUstadzSection(sectionId) {
    currentSection = sectionId;

    // Sembunyikan semua section
    const sections = ['dashboard', 'input', 'rekapan', 'santri'];
    sections.forEach(sec => {
        const el = document.getElementById(`ustadzView${sec.charAt(0).toUpperCase() + sec.slice(1)}`);
        if (el) el.classList.toggle('hidden', sec !== sectionId);

        // Sidebar active styling
        const menuBtn = document.getElementById(`menu-ustadz-${sec}`);
        if (menuBtn) {
            if (sec === sectionId) {
                menuBtn.className = "flex items-center gap-3 w-full p-2.5 rounded-xl transition cursor-pointer text-sm font-semibold bg-[#9a2024] text-white shadow-inner";
            } else {
                menuBtn.className = "flex items-center gap-3 w-full p-2.5 rounded-xl transition cursor-pointer text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white";
            }
        }

        // Mobile bottom nav active styling
        const bNavBtn = document.getElementById(`bottomNav-ustadz-${sec}`);
        if (bNavBtn) {
            if (sec === sectionId) {
                bNavBtn.className = "bottom-nav-btn active text-[#9a2024] dark:text-[#f29fa3] font-bold";
            } else {
                bNavBtn.className = "bottom-nav-btn text-gray-500 dark:text-gray-400";
            }
        }
    });

    // Tutup sidebar di ponsel
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
    }
    if (overlay && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
    }

    // Scroll konten ke atas
    const contentArea = document.getElementById('contentArea');
    if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });

    // Render data spesifik per section
    if (sectionId === 'dashboard') {
        renderUstadzDashboard();
    } else if (sectionId === 'input') {
        renderQuickSantriChips();
        renderUstadzRiwayat();
    } else if (sectionId === 'rekapan') {
        populateRekapFilterSantri();
        renderUstadzRekapanTable();
    } else if (sectionId === 'santri') {
        renderUstadzSantriList();
    }
}

// ==================== VIEW 1: DASHBOARD UTAMA HALAQAH ====================
function renderUstadzDashboard() {
    const mySantri = state.santri.filter(s => s.ID_Ustadz === (sessionData ? sessionData.id : ''));
    const mySetoran = state.setoran.filter(set => set.ID_Ustadz === (sessionData ? sessionData.id : ''));

    // Tanggal Hari Ini (Format Indonesia)
    const today = new Date();
    const todayStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const elDate = document.getElementById('dashTodayDate');
    if (elDate) elDate.textContent = todayStr;

    // Santri yang sudah setor hari ini
    const todaySetoran = mySetoran.filter(set => (set.Tanggal || '').includes(todayStr));
    const uniqueSantriSudahSetorIds = new Set(todaySetoran.map(s => s.ID_Santri));
    const sudahSetorCount = uniqueSantriSudahSetorIds.size;
    const belumSetorCount = Math.max(0, mySantri.length - sudahSetorCount);

    // Bulan Ini
    const currentMonthYear = today.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    const monthSetoran = mySetoran.filter(set => (set.Tanggal || '').includes(currentMonthYear));

    // Update KPI Card DOM
    const elTotal = document.getElementById('kpiTotalSantri');
    const elSudah = document.getElementById('kpiSudahSetor');
    const elBelum = document.getElementById('kpiBelumSetor');
    const elBulan = document.getElementById('kpiTotalBulanIni');

    if (elTotal) elTotal.textContent = mySantri.length;
    if (elSudah) elSudah.textContent = sudahSetorCount;
    if (elBelum) elBelum.textContent = belumSetorCount;
    if (elBulan) elBulan.textContent = monthSetoran.length;

    // 4 Pilar Capaian (Ziyadah, Murojaah, Binnadhor, Tasmi')
    const countZiyadah = mySetoran.filter(s => s.Jenis === 'Ziyadah' || s.Jenis === 'Hafalan Baru').length;
    const countMurojaah = mySetoran.filter(s => s.Jenis === 'Murojaah' || s.Jenis === "Muroja'ah").length;
    const countBinnadhor = mySetoran.filter(s => s.Jenis === 'Binnadhor').length;
    const countTasmi = mySetoran.filter(s => (s.Jenis || '').toLowerCase().includes('tasmi')).length;

    const elZ = document.getElementById('dashCountZiyadah');
    const elM = document.getElementById('dashCountMurojaah');
    const elB = document.getElementById('dashCountBinnadhor');
    const elT = document.getElementById('dashCountTasmi');

    if (elZ) elZ.textContent = countZiyadah;
    if (elM) elM.textContent = countMurojaah;
    if (elB) elB.textContent = countBinnadhor;
    if (elT) elT.textContent = countTasmi;

    // Render Daftar Halaqah Hari Ini (Presensi & Status Setor)
    const listContainer = document.getElementById('dashHalaqahList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (mySantri.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-8 text-gray-400 text-xs">
                Belum ada data santri yang dialokasikan di bawah bimbingan Anda.
            </div>
        `;
        return;
    }

    mySantri.forEach((santri, idx) => {
        const santriTodaySetor = todaySetoran.filter(s => isSameSantriId(s.ID_Santri, santri.ID_Santri));
        const hasSetor = santriTodaySetor.length > 0;
        const lastEntry = hasSetor ? santriTodaySetor[santriTodaySetor.length - 1] : null;

        const isJilid = (santri.Tingkatan || '').toLowerCase() === 'jilid';

        listContainer.innerHTML += `
            <div class="p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                hasSetor 
                    ? 'bg-[#edf7f2]/60 dark:bg-[#12452c]/20 border-[#b2dfc8] dark:border-[#12452c]' 
                    : 'bg-white dark:bg-slate-800/80 border-gray-200 dark:border-darkborder hover:border-[#9a2024]/50'
            }">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        hasSetor ? 'bg-[#1c6b45] text-white shadow-xs' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }">
                        ${idx + 1}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">${santri.Nama_Santri}</h4>
                            <span class="text-[10px] font-mono text-gray-400">(${santri.ID_Santri})</span>
                        </div>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            Tingkatan: <span class="font-semibold text-gray-700 dark:text-gray-300">${isJilid ? 'Jilid / Tahsin' : "Al-Qur'an 30 Juz"}</span>
                            ${hasSetor ? ` &bull; <strong class="text-[#1c6b45] dark:text-[#83c9a6]">Tercatat: ${lastEntry.Surah} (${lastEntry.Jenis}, Hal ${lastEntry.Halaman})</strong>` : ''}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                    ${hasSetor ? `
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#1c6b45] text-white shadow-xs">
                            <i class="fa-solid fa-check"></i>
                            <span>Sudah Setor (${santriTodaySetor.length}x)</span>
                        </span>
                        <button onclick="openInputForSantri('${santri.ID_Santri}')" class="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-gray-100 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-darkborder text-xs font-semibold rounded-xl transition active:scale-95" title="Tambah setoran lagi untuk santri ini">
                            + Tambah
                        </button>
                    ` : `
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                            <i class="fa-regular fa-clock"></i> Belum
                        </span>
                        <button onclick="openInputForSantri('${santri.ID_Santri}')" class="px-3.5 py-1.5 bg-[#9a2024] hover:bg-[#871a1e] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5">
                            <i class="fa-solid fa-pen-nib"></i>
                            <span>Catat Setoran</span>
                        </button>
                    `}
                </div>
            </div>
        `;
    });
}

// Buka Input Setoran untuk Santri Tertentu secara Langsung (Bebas Dropdown Lambat)
function openInputForSantri(santriId) {
    activeSelectedSantriId = santriId;
    switchUstadzSection('input');

    if (tsSantri) {
        tsSantri.setValue(santriId);
    }
    checkSmartPin(santriId);
    highlightActiveSantriChip(santriId);

    // Auto-scroll halus ke form
    const formEl = document.getElementById('formSmartSetoran');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== VIEW 2: LEMBAR MUTABA'AH & INPUT CEPAT ====================
function renderQuickSantriChips() {
    const chipContainer = document.getElementById('smartSantriChips');
    if (!chipContainer) return;
    chipContainer.innerHTML = '';

    const mySantri = state.santri.filter(s => s.ID_Ustadz === (sessionData ? sessionData.id : ''));
    if (mySantri.length === 0) return;

    mySantri.forEach(santri => {
        const isSelected = activeSelectedSantriId === santri.ID_Santri;
        chipContainer.innerHTML += `
            <button type="button" onclick="selectSantriViaChip('${santri.ID_Santri}')" id="chip-santri-${santri.ID_Santri}" class="santri-chip px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isSelected 
                    ? 'bg-[#9a2024] text-white border-[#9a2024] shadow-xs' 
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-darkborder hover:border-[#9a2024]'
            }">
                ${santri.Nama_Santri}
            </button>
        `;
    });
}

function selectSantriViaChip(santriId) {
    activeSelectedSantriId = santriId;
    highlightActiveSantriChip(santriId);
    if (tsSantri) {
        tsSantri.setValue(santriId);
    }
    checkSmartPin(santriId);
}

function highlightActiveSantriChip(santriId) {
    document.querySelectorAll('.santri-chip').forEach(el => {
        el.className = "santri-chip px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-darkborder hover:border-[#9a2024]";
    });
    const activeChip = document.getElementById(`chip-santri-${santriId}`);
    if (activeChip) {
        activeChip.className = "santri-chip px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border bg-[#9a2024] text-white border-[#9a2024] shadow-xs";
        activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

function initSmartForm() {
    const now = new Date();
    document.getElementById('smartDate').value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    const selSantri = document.getElementById('smartSantri');
    if (tsSantri) {
        tsSantri.destroy();
    }
    selSantri.innerHTML = '<option value="">🔍 Ketik atau pilih nama santri...</option>';
    
    const myId = sessionData ? sessionData.id : '';
    const mySantri = state.santri.filter(s => s.ID_Ustadz === myId);
    const otherSantri = state.santri.filter(s => s.ID_Ustadz !== myId);

    if (mySantri.length > 0) {
        let optMy = `<optgroup label="Halaqah Saya (${mySantri.length} Santri)">`;
        mySantri.forEach(s => {
            optMy += `<option value="${s.ID_Santri}">${s.Nama_Santri} (${s.ID_Santri})</option>`;
        });
        optMy += `</optgroup>`;
        selSantri.innerHTML += optMy;
    }
    if (otherSantri.length > 0) {
        let optOther = `<optgroup label="Santri Lintas Halaqah (${otherSantri.length} Santri)">`;
        otherSantri.forEach(s => {
            const ust = (state.ustadz || []).find(u => u.ID_Ustadz === s.ID_Ustadz);
            const uName = ust ? ` - Binaan ${ust.Nama}` : '';
            optOther += `<option value="${s.ID_Santri}">${s.Nama_Santri} (${s.ID_Santri})${uName}</option>`;
        });
        optOther += `</optgroup>`;
        selSantri.innerHTML += optOther;
    }

    tsSantri = new TomSelect('#smartSantri', {
        create: false,
        sortField: { field: "text", direction: "asc" },
        onChange: function(val) {
            activeSelectedSantriId = val;
            highlightActiveSantriChip(val);
            checkSmartPin(val);
        }
    });

    const selJuz = document.getElementById('smartJuz');
    selJuz.innerHTML = '<option value="all">Semua</option>';
    for (let i = 1; i <= 30; i++) selJuz.innerHTML += `<option value="${i}">Juz ${i}</option>`;
    populateSurat();

    initTasmiPanel();
    renderQuickSantriChips();
}

// ==================== LOGIKA PANEL PENILAIAN KHUSUS TASMI' ====================
let tasmiScores = {};
let tasmiTajwid = {};

function getSelectedTasmiJuz() {
    const sel = document.getElementById('tasmiJuz');
    return sel && sel.value ? String(sel.value) : '30';
}

function initTasmiPanel() {
    const selTasmiJuz = document.getElementById('tasmiJuz');
    if (selTasmiJuz) {
        selTasmiJuz.innerHTML = '';
        for (let i = 1; i <= 30; i++) {
            const jmlHal = i === 30 ? '23 Halaman' : '20 Halaman';
            selTasmiJuz.innerHTML += `<option value="${i}" ${i === 30 ? 'selected' : ''}>Juz ${i} (${jmlHal})</option>`;
        }
    }
    renderTasmiPagesGrid();
    renderTasmiTajwidGrid();
    updateTasmiLiveSummary();
}

function onTasmiJuzChange() {
    const cfg = getTasmiConfigByJuz(getSelectedTasmiJuz());
    // Hapus nilai halaman melebihi batas halaman Juz baru (misal 21-23 saat pindah dari Juz 30 ke Juz 1-29)
    Object.keys(tasmiScores).forEach(p => {
        if (Number(p) > cfg.totalPages) delete tasmiScores[p];
    });
    renderTasmiPagesGrid();
    updateTasmiLiveSummary();
}

function renderTasmiPagesGrid() {
    const grid = document.getElementById('tasmiPagesGrid');
    if (!grid || typeof getTasmiConfigByJuz !== 'function') return;

    const cfg = getTasmiConfigByJuz(getSelectedTasmiJuz());
    const headingEl = document.getElementById('tasmiTableHeading');
    if (headingEl) {
        headingEl.textContent = `A. Tabel Penilaian Kelancaran (Hal 1–${cfg.totalPages})`;
    }

    grid.innerHTML = cfg.blocks.map(blk => {
        let rowsHtml = '';
        for (let p = blk.start; p <= blk.end; p++) {
            const curScore = tasmiScores[p];
            const btnsHtml = TASMI_VALID_SCORES.map(sc => {
                const isActive = Number(curScore) === sc;
                const activeCls = sc === 5 ? 'bg-[#1c6b45] text-white border-[#1c6b45]'
                    : sc === 4 ? 'bg-blue-600 text-white border-blue-600'
                    : sc === 3 ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-red-600 text-white border-red-600';
                const baseCls = 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkborder hover:border-indigo-400';
                return `<button type="button" onclick="setTasmiPageScore(${p}, ${sc})" id="btnTasmiP${p}S${sc}" class="w-7 h-7 rounded-lg text-[11px] font-bold border transition ${isActive ? activeCls : baseCls}">${sc}</button>`;
            }).join('');

            rowsHtml += `
                <div class="flex items-center justify-between py-1 px-2 border-b border-gray-100 dark:border-darkborder last:border-none">
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-200 w-12">Hal ${p}</span>
                    <div class="flex items-center gap-1">${btnsHtml}</div>
                </div>
            `;
        }
        return `
            <div class="bg-white dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-xl overflow-hidden">
                <div class="bg-gray-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-darkborder">
                    ${blk.title}
                </div>
                <div>${rowsHtml}</div>
            </div>
        `;
    }).join('');
}

function setTasmiPageScore(pageNum, score) {
    tasmiScores[pageNum] = score;
    TASMI_VALID_SCORES.forEach(sc => {
        const btn = document.getElementById(`btnTasmiP${pageNum}S${sc}`);
        if (!btn) return;
        const isActive = sc === score;
        const activeCls = sc === 5 ? 'bg-[#1c6b45] text-white border-[#1c6b45] shadow-xs'
            : sc === 4 ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
            : sc === 3 ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
            : 'bg-red-600 text-white border-red-600 shadow-xs';
        const baseCls = 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkborder hover:border-indigo-400';
        btn.className = `w-7 h-7 rounded-lg text-[11px] font-bold border transition ${isActive ? activeCls : baseCls}`;
    });
    updateTasmiLiveSummary();
}

function fillAllTasmiScore(score) {
    const cfg = getTasmiConfigByJuz(getSelectedTasmiJuz());
    for (let p = 1; p <= cfg.totalPages; p++) {
        tasmiScores[p] = score;
    }
    renderTasmiPagesGrid();
    updateTasmiLiveSummary();
    AppNotify.toast('info', `Seluruh ${cfg.totalPages} halaman diisi skor ${score}`);
}

function resetTasmiScores() {
    tasmiScores = {};
    renderTasmiPagesGrid();
    updateTasmiLiveSummary();
}

function renderTasmiTajwidGrid() {
    const container = document.getElementById('tasmiTajwidGrid');
    if (!container || typeof TASMI_TAJWID_ASPEK === 'undefined') return;

    container.innerHTML = TASMI_TAJWID_ASPEK.map((asp, idx) => {
        const curGrade = tasmiTajwid[asp.key];
        const btnsHtml = TASMI_VALID_GRADES.map(gr => {
            const isActive = curGrade === gr;
            const activeCls = gr === 'A' ? 'bg-[#1c6b45] text-white border-[#1c6b45]'
                : gr === 'B' ? 'bg-blue-600 text-white border-blue-600'
                : gr === 'C' ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-red-600 text-white border-red-600';
            const baseCls = 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkborder hover:border-indigo-400';
            return `<button type="button" onclick="setTasmiTajwidGrade('${asp.key}', '${gr}')" id="btnTajwid_${asp.key}_${gr}" class="w-7 h-7 rounded-lg text-[11px] font-bold border transition ${isActive ? activeCls : baseCls}">${gr}</button>`;
        }).join('');

        return `
            <div class="flex items-center justify-between gap-2 bg-white dark:bg-darkcard px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-darkborder">
                <span class="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">${idx + 1}. ${asp.label}</span>
                <div class="flex items-center gap-1 shrink-0">${btnsHtml}</div>
            </div>
        `;
    }).join('');
}

function setTasmiTajwidGrade(key, grade) {
    tasmiTajwid[key] = grade;
    TASMI_VALID_GRADES.forEach(gr => {
        const btn = document.getElementById(`btnTajwid_${key}_${gr}`);
        if (!btn) return;
        const isActive = gr === grade;
        const activeCls = gr === 'A' ? 'bg-[#1c6b45] text-white border-[#1c6b45] shadow-xs'
            : gr === 'B' ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
            : gr === 'C' ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
            : 'bg-red-600 text-white border-red-600 shadow-xs';
        const baseCls = 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkborder hover:border-indigo-400';
        btn.className = `w-7 h-7 rounded-lg text-[11px] font-bold border transition ${isActive ? activeCls : baseCls}`;
    });
}

function fillAllTasmiTajwid(grade) {
    TASMI_TAJWID_ASPEK.forEach(asp => { tasmiTajwid[asp.key] = grade; });
    renderTasmiTajwidGrid();
    AppNotify.toast('info', `Seluruh aspek Tajwid diatur ke nilai ${grade}`);
}

function resetTasmiTajwid() {
    tasmiTajwid = {};
    renderTasmiTajwidGrid();
}

function updateTasmiLiveSummary() {
    if (typeof hitungHasilTasmi !== 'function') return;
    const hasil = hitungHasilTasmi(tasmiScores, getSelectedTasmiJuz());

    const elCount = document.getElementById('tasmiFilledCountText');
    const elTotal = document.getElementById('tasmiTotalSkorDisplay');
    const elBadge = document.getElementById('tasmiStatusBadgeDisplay');

    if (elCount) elCount.textContent = `Terisi: ${hasil.filledCount} / ${hasil.totalPages} halaman`;
    if (elTotal) {
        elTotal.textContent = `${hasil.totalSkor} / ${hasil.maksimalSkor}`;
        elTotal.className = `text-xl font-black ${
            !hasil.isComplete ? 'text-gray-900 dark:text-white'
            : hasil.lulus ? 'text-[#1c6b45] dark:text-[#83c9a6]'
            : 'text-red-600 dark:text-red-400'
        }`;
    }
    if (elBadge) {
        if (!hasil.isComplete) {
            elBadge.textContent = `Kurang ${hasil.totalPages - hasil.filledCount} Halaman`;
            elBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200';
        } else if (hasil.lulus) {
            elBadge.textContent = "✅ LULUS TASMI' (≥ 80)";
            elBadge.className = 'px-3 py-1 rounded-full text-xs font-extrabold bg-[#edf7f2] text-[#1c6b45] border border-[#b2dfc8]';
        } else {
            elBadge.textContent = '🔁 TIDAK LULUS — Wajib Mengulang (< 80)';
            elBadge.className = 'px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 text-red-700 border border-red-200';
        }
    }
}

function switchTingkatan(tingkat) {
    document.getElementById('smartTingkatan').value = tingkat;
    const isQuran = tingkat === "Al-Qur'an";

    const btnQuran = document.getElementById('btnTingkatQuran');
    const btnJilid = document.getElementById('btnTingkatJilid');
    const panelQuran = document.getElementById('panelInputQuran');
    const panelJilid = document.getElementById('panelInputJilid');

    const activeClass = "py-2 px-3 rounded-lg text-xs font-bold transition bg-[#9a2024] text-white shadow-xs flex items-center justify-center gap-1.5";
    const inactiveClass = "py-2 px-3 rounded-lg text-xs font-bold transition text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5";

    if (btnQuran) btnQuran.className = isQuran ? activeClass : inactiveClass;
    if (btnJilid) btnJilid.className = !isQuran ? activeClass : inactiveClass;

    // Jika sedang mode Tasmi', jangan tampilkan panel Quran/Jilid standar
    const currentType = document.getElementById('smartType') ? document.getElementById('smartType').value : 'Ziyadah';
    if (currentType === 'Tasmi') {
        if (panelQuran) panelQuran.classList.add('hidden');
        if (panelJilid) panelJilid.classList.add('hidden');
        return;
    }

    if (panelQuran) panelQuran.classList.toggle('hidden', !isQuran);
    if (panelJilid) panelJilid.classList.toggle('hidden', isQuran);
}

function syncJilidDefaultName() {
    const level = document.getElementById('smartJilidLevel').value;
    const inputNama = document.getElementById('smartJilidNama');
    if (inputNama) {
        if (level === 'Ghorib') inputNama.value = 'Materi Ghorib Al-Qur\'an';
        else if (level === 'Tajwid') inputNama.value = 'Materi Tajwid Dasar';
        else inputNama.value = `Metode Ummi ${level}`;
    }
}

// 4 PILAR SETORAN: Ziyadah, Murojaah, Binnadhor, Tasmi'
function switchSmartTab(type) {
    document.getElementById('smartType').value = type;
    const btnZiyadah = document.getElementById('btnTabZiyadah');
    const btnMurojaah = document.getElementById('btnTabMurojaah');
    const btnBinnadhor = document.getElementById('btnTabBinnadhor');
    const btnTasmi = document.getElementById('btnTabTasmi');

    const inactive = "py-2 px-1 rounded-lg text-xs font-bold transition text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 text-center";

    if (btnZiyadah) {
        btnZiyadah.className = (type === 'Ziyadah')
            ? "py-2 px-1 rounded-lg text-xs font-bold transition bg-[#1c6b45] text-white shadow-xs text-center"
            : inactive;
    }
    if (btnMurojaah) {
        btnMurojaah.className = (type === 'Murojaah')
            ? "py-2 px-1 rounded-lg text-xs font-bold transition bg-[#9a2024] text-white shadow-xs text-center"
            : inactive;
    }
    if (btnBinnadhor) {
        btnBinnadhor.className = (type === 'Binnadhor')
            ? "py-2 px-1 rounded-lg text-xs font-bold transition bg-amber-600 text-white shadow-xs text-center"
            : inactive;
    }
    if (btnTasmi) {
        btnTasmi.className = (type === 'Tasmi')
            ? "py-2 px-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-xs text-center"
            : inactive;
    }

    // Toggle Panel Khusus Tasmi' vs Form Mutaba'ah Harian Standar
    const isTasmiMode = type === 'Tasmi';
    const secTingkatan = document.getElementById('sectionTingkatanBacaan');
    const panelQuran = document.getElementById('panelInputQuran');
    const panelJilid = document.getElementById('panelInputJilid');
    const panelStandar = document.getElementById('panelStandarHalPredikat');
    const panelTasmi = document.getElementById('panelInputTasmi');

    if (isTasmiMode) {
        if (secTingkatan) secTingkatan.classList.add('hidden');
        if (panelQuran) panelQuran.classList.add('hidden');
        if (panelJilid) panelJilid.classList.add('hidden');
        if (panelStandar) panelStandar.classList.add('hidden');
        if (panelTasmi) panelTasmi.classList.remove('hidden');
    } else {
        if (secTingkatan) secTingkatan.classList.remove('hidden');
        if (panelStandar) panelStandar.classList.remove('hidden');
        if (panelTasmi) panelTasmi.classList.add('hidden');
        switchTingkatan(document.getElementById('smartTingkatan').value || "Al-Qur'an");
    }
}

function populateSurat() {
    const juzVal = document.getElementById('smartJuz').value;
    const selSurat = document.getElementById('smartSurat');
    if (tsSurat) {
        tsSurat.destroy();
    }
    selSurat.innerHTML = '<option value="">🔍 Ketik atau pilih surat...</option>';

    let filteredSurat = juzVal !== 'all' 
        ? quranDB.filter(q => Array.isArray(q.juz) ? q.juz.includes(parseInt(juzVal)) : q.juz == parseInt(juzVal)) 
        : quranDB;
    filteredSurat.forEach(s => {
        selSurat.innerHTML += `<option value="${s.no}" data-ayat="${s.ayat}">${s.no}. ${s.nama} (${s.ayat} Ayat)</option>`;
    });

    tsSurat = new TomSelect('#smartSurat', {
        create: false,
        sortField: { field: "value", direction: "asc" },
        onChange: function(val) { populateAyatMax(val); }
    });

    document.getElementById('smartAyatStart').disabled = true;
    document.getElementById('smartAyatStart').value = '';
    document.getElementById('smartAyatEnd').disabled = true;
    document.getElementById('smartAyatEnd').value = '';
    document.getElementById('chkFullSurat').disabled = true;
    document.getElementById('chkFullSurat').checked = false;
}

function populateAyatMax(suratNo) {
    if (!suratNo) return;
    const suratData = quranDB.find(q => q.no == suratNo);
    if (!suratData) return;
    const start = document.getElementById('smartAyatStart'),
          end = document.getElementById('smartAyatEnd'),
          chk = document.getElementById('chkFullSurat');
    start.disabled = false;
    start.value = '1';
    end.disabled = false;
    end.value = suratData.ayat;
    chk.disabled = false;
    chk.checked = false;
    end.setAttribute('max', suratData.ayat);
}

function toggleFullSurat() {
    const isChecked = document.getElementById('chkFullSurat').checked,
          start = document.getElementById('smartAyatStart'),
          end = document.getElementById('smartAyatEnd');
    if (isChecked) {
        start.value = '1';
        end.value = end.getAttribute('max');
        start.readOnly = true;
        end.readOnly = true;
        start.classList.add('bg-gray-100', 'dark:bg-slate-700');
        end.classList.add('bg-gray-100', 'dark:bg-slate-700');
    } else {
        start.readOnly = false;
        end.readOnly = false;
        start.classList.remove('bg-gray-100', 'dark:bg-slate-700');
        end.classList.remove('bg-gray-100', 'dark:bg-slate-700');
    }
}

function checkSmartPin(santriId) {
    const pinContainer = document.getElementById('smartPinContainer');
    const tmInput = document.getElementById('smartTM');
    if (!santriId) {
        if (pinContainer) pinContainer.classList.add('hidden');
        lastPinData = null;
        if (tmInput) tmInput.value = 'TM-1';
        return;
    }

    const history = state.setoran.filter(s => isSameSantriId(s.ID_Santri, santriId));
    const nextTmNumber = history.length + 1;
    if (tmInput) tmInput.value = `TM-${nextTmNumber}`;

    const dailyHistory = history.filter(s => !(s.Jenis || '').toLowerCase().includes('tasmi'));
    const pinCandidate = dailyHistory.length > 0 ? dailyHistory[dailyHistory.length - 1] : (history.length > 0 ? history[history.length - 1] : null);

    if (pinCandidate) {
        lastPinData = pinCandidate;
        const jenisLabel = lastPinData.Jenis || 'Ziyadah';
        const halLabel = formatHalamanDisplay(lastPinData.Halaman);
        document.getElementById('smartPinText').textContent = `Terakhir (${lastPinData.TM || 'TM'}): ${lastPinData.Surah} (${lastPinData.Juz})${halLabel ? ', ' + halLabel : ''} [${jenisLabel}]`;
        if (pinContainer) pinContainer.classList.remove('hidden');
    } else {
        if (pinContainer) pinContainer.classList.add('hidden');
        lastPinData = null;
    }
}

function applySmartPin() {
    if (!lastPinData) return;
    if ((lastPinData.Jenis || '').toLowerCase().includes('tasmi')) {
        switchSmartTab('Tasmi');
        const selTasmiJuz = document.getElementById('tasmiJuz');
        if (selTasmiJuz && lastPinData.Juz) selTasmiJuz.value = lastPinData.Juz;
        onTasmiJuzChange();
        AppNotify.toast('info', 'Mode Penilaian Tasmi\' diterapkan!');
        return;
    }

    const curType = document.getElementById('smartType') ? document.getElementById('smartType').value : 'Ziyadah';
    if (curType === 'Tasmi') switchSmartTab('Ziyadah');

    const tingkat = lastPinData.Tingkatan || "Al-Qur'an";
    switchTingkatan(tingkat);

    if (tingkat === 'Jilid') {
        document.getElementById('smartJilidLevel').value = lastPinData.Juz || 'Jilid 1';
        document.getElementById('smartJilidNama').value = lastPinData.Surah || 'Metode Ummi Jilid 1';
        document.getElementById('smartJilidBaris').value = lastPinData.Ayat || '';
    } else {
        document.getElementById('smartJuz').value = lastPinData.Juz || 'all';
        populateSurat();
        if (tsSurat && lastPinData.SurahNo) {
            tsSurat.setValue(lastPinData.SurahNo);
        }
    }
    document.getElementById('smartHal').value = lastPinData.Halaman || '';
    AppNotify.toast('info', 'Data Hafalan Terakhir Berhasil Diterapkan!');
}

function saveSetoran(e) {
    e.preventDefault();
    const santriId = tsSantri ? tsSantri.getValue() : activeSelectedSantriId;
    if (!santriId) return AppNotify.warning('Pilih Santri', 'Silakan pilih santri binaan terlebih dahulu.');

    const tmVal = document.getElementById('smartTM').value || "TM-1";
    const typeVal = document.getElementById('smartType').value || "Ziyadah";
    const rawDate = document.getElementById('smartDate').value;
    const displayDate = new Date(rawDate).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let payload;

    // MODE KHUSUS PENILAIAN TASMI'
    if (typeVal === 'Tasmi') {
        const tasmiJuz = getSelectedTasmiJuz();
        const hasil = hitungHasilTasmi(tasmiScores, tasmiJuz);
        if (!hasil.isComplete) {
            return AppNotify.warning(
                'Skor Halaman Belum Lengkap',
                `Penilaian Tasmi' Juz ${tasmiJuz} mewajibkan ${hasil.totalPages} halaman diisi. Halaman yang belum dinilai: <strong>${hasil.missingPages.join(', ')}</strong>`
            );
        }

        const tajwidRes = validasiTajwidTasmi(tasmiTajwid);
        if (!tajwidRes.isValid) {
            return AppNotify.warning(
                'Nilai Praktik Tajwid Belum Lengkap',
                'Silakan lengkapi nilai huruf (A, B, C, atau D) untuk seluruh 9 aspek Praktik Tajwid terlebih dahulu.'
            );
        }

        payload = {
            santriId: santriId,
            tingkatan: "Al-Qur'an",
            tm: tmVal,
            type: "Tasmi'",
            juz: tasmiJuz,
            surah: `Penilaian Tasmi' Juz ${tasmiJuz}`,
            surahNo: '',
            ayat: `${hasil.totalPages} Halaman`,
            halaman: `Skor: ${hasil.totalSkor}/${hasil.maksimalSkor}`,
            predikat: `${hasil.status} (${hasil.totalSkor})`,
            catatan: document.getElementById('smartCatatan').value,
            date: displayDate,
            parafUstadz: sessionData ? sessionData.name : 'Ustadz Pembimbing',
            detailTasmi: {
                juz: tasmiJuz,
                totalPages: hasil.totalPages,
                maksimalSkor: hasil.maksimalSkor,
                skorPerHalaman: hasil.skorPerHalaman,
                totalSkor: hasil.totalSkor,
                passingScore: TASMI_PASSING_SCORE,
                statusKelulusan: hasil.status,
                tajwid: tajwidRes.tajwid
            }
        };
    } else {
        // MODE HARIAN STANDAR (Ziyadah, Muroja'ah, Binnadhor)
        const tingkatan = document.getElementById('smartTingkatan').value || "Al-Qur'an";
        let juzVal = '', surahVal = '', surahNoVal = '', ayatVal = '';

        if (tingkatan === "Al-Qur'an") {
            const suratNo = tsSurat ? tsSurat.getValue() : '';
            if (!suratNo) return AppNotify.warning('Pilih Surat', 'Silakan pilih surat Al-Qur\'an terlebih dahulu.');
            const suratData = quranDB.find(q => q.no == suratNo);
            const startAyat = document.getElementById('smartAyatStart').value || '1';
            const endAyat = document.getElementById('smartAyatEnd').value || (suratData ? suratData.ayat : '1');

            juzVal = document.getElementById('smartJuz').value === 'all' 
                ? String(suratData ? (suratData.juzPrimary || (Array.isArray(suratData.juz) ? suratData.juz[0] : suratData.juz)) : '1') 
                : String(document.getElementById('smartJuz').value);
            surahVal = suratData ? suratData.nama : 'Al-Baqarah';
            surahNoVal = suratData ? suratData.no : '2';
            ayatVal = `${startAyat} - ${endAyat}`;
        } else {
            juzVal = document.getElementById('smartJilidLevel').value || 'Jilid 1';
            surahVal = document.getElementById('smartJilidNama').value || juzVal;
            surahNoVal = juzVal;
            ayatVal = document.getElementById('smartJilidBaris').value || '-';
        }

        payload = {
            santriId: santriId,
            tingkatan: tingkatan,
            tm: tmVal,
            type: typeVal,
            juz: juzVal,
            surah: surahVal,
            surahNo: surahNoVal,
            ayat: ayatVal,
            halaman: document.getElementById('smartHal').value || '-',
            predikat: document.querySelector('input[name="smartPredikat"]:checked').value,
            catatan: document.getElementById('smartCatatan').value,
            date: displayDate,
            parafUstadz: sessionData ? sessionData.name : 'Ustadz Pembimbing'
        };
    }

    AppNotify.loading(typeVal === 'Tasmi' ? 'Menyimpan Penilaian Tasmi\'...' : 'Menyimpan Penilaian Harian...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    apiCall('saveSetoran', token, payload).then(res => {
        if (res.status === 'success') {
            AppNotify.toast('success', typeVal === 'Tasmi' ? 'Penilaian Tasmi\' berhasil disimpan!' : 'Setoran & penilaian harian santri berhasil disimpan!');
            document.getElementById('smartHal').value = '';
            document.getElementById('smartCatatan').value = '';
            if (typeVal === 'Tasmi') {
                resetTasmiScores();
                resetTasmiTajwid();
            }
            loadUstadzData();
        } else {
            AppNotify.error('Gagal Menyimpan Setoran', res.message);
        }
    });
}

function openUstadzTasmiDetail(setId) {
    const set = state.setoran.find(x => x.ID_Setoran === setId);
    if (!set) return;
    const s = findSantriById(state.santri, set.ID_Santri);
    tampilkanDetailTasmiModal(set, s, set.ParafUstadz || (sessionData ? sessionData.name : 'Ustadz Penguji'));
}

function renderUstadzRiwayat() {
    const container = document.getElementById('listSetoranUstadz');
    if (!container) return;
    container.innerHTML = '';

    const mySetoran = state.setoran.filter(set => set.ID_Ustadz === (sessionData ? sessionData.id : '')).slice().reverse().slice(0, 8);

    if (mySetoran.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-6 text-xs">Belum ada catatan penilaian harian di sesi ini.</p>`;
        return;
    }

    mySetoran.forEach(set => {
        const s = findSantriById(state.santri, set.ID_Santri);
        const santriNama = s ? s.Nama_Santri : getSantriDisplayName(state.santri, set.ID_Santri);
        const jenis = set.Jenis || 'Ziyadah';
        const isZiyadah = jenis === 'Ziyadah' || jenis === 'Hafalan Baru';
        const isBinnadhor = jenis === 'Binnadhor';
        const isTasmi = (jenis || '').toLowerCase().includes('tasmi');
        const detailTasmi = isTasmi ? parseDetailTasmi(set.Detail_Tasmi) : null;

        const borderLeft = isZiyadah
            ? 'border-l-4 border-[#1c6b45]'
            : isBinnadhor
            ? 'border-l-4 border-amber-500'
            : isTasmi
            ? 'border-l-4 border-indigo-600'
            : 'border-l-4 border-[#9a2024]';

        const typeBadge = isZiyadah
            ? 'bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]'
            : isBinnadhor
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
            : isTasmi
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
            : 'bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/40 dark:text-[#f29fa3]';

        const nilai = set.Predikat || set.Nilai || 'Mumtaz';
        const isLulusTasmi = detailTasmi ? detailTasmi.statusKelulusan === 'LULUS' : String(nilai).toUpperCase().startsWith('LULUS');
        const isMumtaz = nilai === 'Mumtaz' || nilai === 'Lancar' || isLulusTasmi;
        const isJayyid = nilai === 'Jayyid' || nilai === 'Kurang Lancar';
        const predIcon = isTasmi && detailTasmi ? (isLulusTasmi ? '✅' : '🔁') : (isMumtaz ? '🌟' : isJayyid ? '👍' : '🔁');
        const predColor = isMumtaz ? 'text-[#1c6b45] dark:text-[#83c9a6]' : isJayyid ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

        let tmText = set.TM;
        if (!tmText || tmText === '-') {
            const m = String(set.Catatan || '').match(/TM:\s*([^\s|]+)/i);
            tmText = m ? `TM-${m[1]}` : (set.TM || 'TM');
        }

        let displaySurat = set.Surah && set.Surah !== '-' ? set.Surah : '';
        const juzLabel = set.Tingkatan === 'Jilid' ? (set.Juz || '') : (set.Juz ? `Juz ${set.Juz}` : '');
        const materiText = displaySurat ? `${displaySurat} (${juzLabel})` : (juzLabel ? `(${juzLabel})` : '-');

        let ayatHalText = '-';
        if (isTasmi && detailTasmi) {
            ayatHalText = `Skor: ${detailTasmi.totalSkor}/${detailTasmi.maksimalSkor || (String(detailTasmi.juz || set.Juz) === '30' ? 115 : 100)}`;
        } else {
            const aVal = set.Ayat && set.Ayat !== '-' ? set.Ayat : '';
            const hVal = formatHalamanDisplay(set.Halaman);
            if (aVal && hVal) ayatHalText = `${aVal} &bull; ${hVal}`;
            else if (aVal) ayatHalText = aVal;
            else if (hVal) ayatHalText = hVal;
        }

        container.innerHTML += `
            <div class="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 sm:p-3.5 border border-gray-100 dark:border-darkborder ${borderLeft}">
                <div class="flex justify-between items-start gap-2 mb-1.5">
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-[10px] font-mono font-bold text-gray-700 dark:text-gray-200">${escapeHtml(tmText)}</span>
                            <h4 class="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">${escapeHtml(santriNama)}</h4>
                        </div>
                        <p class="text-[10px] text-gray-400 mt-0.5">${set.Tanggal}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeBadge}">${jenis}</span>
                </div>
                <div class="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-darkcard p-2 rounded-xl border border-gray-100 dark:border-darkborder mb-1.5 flex justify-between items-center">
                    <span class="font-bold truncate">${escapeHtml(materiText)}</span>
                    <span class="text-gray-500 font-medium shrink-0 ml-2">${escapeHtml(ayatHalText)}</span>
                </div>
                <div class="flex items-center justify-between gap-2 text-[11px]">
                    <span class="font-bold ${predColor}">${predIcon} Nilai: ${nilai}</span>
                    ${detailTasmi ? `
                        <button type="button" onclick="openUstadzTasmiDetail('${set.ID_Setoran}')" class="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition shadow-2xs shrink-0">
                            <i class="fa-solid fa-table-list mr-1"></i>Lihat Kartu Tasmi'
                        </button>
                    ` : (cleanCatatan(set.Catatan) ? `<span class="text-gray-400 truncate max-w-[150px] italic">"${escapeHtml(cleanCatatan(set.Catatan))}"</span>` : '')}
                </div>
            </div>
        `;
    });
}

// ==================== VIEW 3: BUKU REKAPAN MANDIRI (REKAPAN SENDIRI) ====================
function populateRekapFilterSantri() {
    const sel = document.getElementById('rekapFilterSantri');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="all">Semua Santri Binaan</option>';
    const myId = sessionData ? sessionData.id : '';
    const mySantri = (state.santri || []).filter(s => String(s.ID_Ustadz || '').trim() === String(myId).trim());
    const list = mySantri.length > 0 ? mySantri : (state.santri || []);
    list.forEach(s => {
        sel.innerHTML += `<option value="${s.ID_Santri}">${s.Nama_Santri} (${s.ID_Santri})</option>`;
    });
    if (currentVal) sel.value = currentVal;
}

function renderUstadzRekapanTable() {
    const tbody = document.getElementById('rekapTableBody');
    const emptyState = document.getElementById('rekapEmptyState');
    const countDisplay = document.getElementById('rekapTableCount');
    if (!tbody) return;
    tbody.innerHTML = '';

    const mySetoran = state.setoran.filter(set => set.ID_Ustadz === (sessionData ? sessionData.id : '')).slice().reverse();

    // Ambil nilai filter
    const santriFilter = document.getElementById('rekapFilterSantri') ? document.getElementById('rekapFilterSantri').value : 'all';
    const waktuFilter = document.getElementById('rekapFilterWaktu') ? document.getElementById('rekapFilterWaktu').value : 'all';
    const kategoriFilter = document.getElementById('rekapFilterKategori') ? document.getElementById('rekapFilterKategori').value : 'all';
    const nilaiFilter = document.getElementById('rekapFilterNilai') ? document.getElementById('rekapFilterNilai').value : 'all';
    const searchQuery = document.getElementById('rekapSearchInput') ? (document.getElementById('rekapSearchInput').value || '').toLowerCase().trim() : '';

    const now = new Date();
    const todayStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const monthStr = now.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

    let filtered = mySetoran.filter(set => {
        // Filter Santri
        if (santriFilter !== 'all' && !isSameSantriId(set.ID_Santri, santriFilter)) return false;

        // Filter Waktu
        if (waktuFilter === 'today' && !(set.Tanggal || '').includes(todayStr)) return false;
        if (waktuFilter === 'month' && !(set.Tanggal || '').includes(monthStr)) return false;

        // Filter Kategori
        if (kategoriFilter !== 'all') {
            const j = (set.Jenis || '').toLowerCase();
            if (kategoriFilter === 'Ziyadah' && !j.includes('ziyadah') && !j.includes('baru')) return false;
            if (kategoriFilter === 'Murojaah' && !j.includes('muroja')) return false;
            if (kategoriFilter === 'Binnadhor' && !j.includes('binnadhor')) return false;
            if (kategoriFilter === 'Tasmi' && !j.includes('tasmi')) return false;
        }

        // Filter Nilai
        if (nilaiFilter !== 'all') {
            const p = (set.Predikat || set.Nilai || '').toLowerCase();
            if (nilaiFilter.toLowerCase() !== p) return false;
        }

        // Search Query
        if (searchQuery) {
            const sObj = findSantriById(state.santri, set.ID_Santri);
            const sName = sObj ? (sObj.Nama_Santri || '').toLowerCase() : '';
            const match = (
                (set.Surah || '').toLowerCase().includes(searchQuery) ||
                (set.TM || '').toLowerCase().includes(searchQuery) ||
                (set.Catatan || '').toLowerCase().includes(searchQuery) ||
                sName.includes(searchQuery)
            );
            if (!match) return false;
        }

        return true;
    });

    if (countDisplay) countDisplay.textContent = `Menampilkan ${filtered.length} dari ${mySetoran.length} Catatan`;

    if (filtered.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    filtered.forEach((set, idx) => {
        const s = findSantriById(state.santri, set.ID_Santri);
        const sNama = s ? s.Nama_Santri : getSantriDisplayName(state.santri, set.ID_Santri);
        const jenis = set.Jenis || 'Ziyadah';
        const isZiyadah = jenis === 'Ziyadah' || jenis === 'Hafalan Baru';
        const isBinnadhor = jenis === 'Binnadhor';
        const isTasmi = (jenis || '').toLowerCase().includes('tasmi');

        const typeBadge = isZiyadah
            ? 'bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]'
            : isBinnadhor
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
            : isTasmi
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
            : 'bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/40 dark:text-[#f29fa3]';

        const detailTasmi = isTasmi ? parseDetailTasmi(set.Detail_Tasmi) : null;
        const nilai = set.Predikat || set.Nilai || 'Mumtaz';
        const isLulusTasmi = detailTasmi ? detailTasmi.statusKelulusan === 'LULUS' : String(nilai).toUpperCase().startsWith('LULUS');
        const isMumtaz = nilai === 'Mumtaz' || nilai === 'Lancar' || isLulusTasmi;
        const isJayyid = nilai === 'Jayyid' || nilai === 'Kurang Lancar';
        const nilaiColor = isMumtaz ? 'text-[#1c6b45]' : isJayyid ? 'text-amber-600' : 'text-red-500';

        let tmRekap = set.TM;
        if (!tmRekap || tmRekap === '-') {
            const m = String(set.Catatan || '').match(/TM:\s*([^\s|]+)/i);
            tmRekap = m ? `TM-${m[1]}` : (set.TM || 'TM');
        }

        let displaySuratRekap = set.Surah && set.Surah !== '-' ? set.Surah : '';
        const juzLabelRekap = set.Tingkatan === 'Jilid' ? (set.Juz || '') : (set.Juz ? `Juz ${set.Juz}` : '');
        const materiRekapText = displaySuratRekap 
            ? `${displaySuratRekap} (${juzLabelRekap})` 
            : (juzLabelRekap ? `(${juzLabelRekap})` : '-');

        let ayatHalRekapHtml = '-';
        if (isTasmi && detailTasmi) {
            ayatHalRekapHtml = `${detailTasmi.totalPages || (String(detailTasmi.juz || set.Juz) === '30' ? 23 : 20)} Halaman <br><span class="text-[10px] font-bold text-indigo-600">Skor: ${detailTasmi.totalSkor}/${detailTasmi.maksimalSkor || (String(detailTasmi.juz || set.Juz) === '30' ? 115 : 100)}</span>`;
        } else {
            const aVal = set.Ayat && set.Ayat !== '-' ? set.Ayat : '';
            const hRaw = formatHalamanDisplay(set.Halaman);
            const hVal = hRaw ? `<span class="text-[10px] text-gray-400">${hRaw}</span>` : '';
            if (aVal && hVal) ayatHalRekapHtml = `${escapeHtml(aVal)} <br>${hVal}`;
            else if (aVal) ayatHalRekapHtml = escapeHtml(aVal);
            else if (hVal) ayatHalRekapHtml = hVal;
        }

        tbody.innerHTML += `
            <tr class="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition">
                <td class="py-3 px-4">
                    <span class="font-bold text-gray-900 dark:text-white block">${escapeHtml(tmRekap)}</span>
                    <span class="text-[10px] text-gray-400 block">${set.Tanggal}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="font-bold text-gray-900 dark:text-white block">${escapeHtml(sNama)}</span>
                    <span class="text-[10px] text-gray-400 block">${set.Tingkatan || "Al-Qur'an"}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeBadge}">${jenis}</span>
                </td>
                <td class="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">
                    ${escapeHtml(materiRekapText)}
                </td>
                <td class="py-3 px-4 text-gray-600 dark:text-gray-300">
                    ${ayatHalRekapHtml}
                </td>
                <td class="py-3 px-4 font-bold ${nilaiColor}">
                    ${nilai}
                </td>
                <td class="py-3 px-4 text-gray-500 italic text-xs max-w-xs truncate">
                    ${cleanCatatan(set.Catatan) ? `"${escapeHtml(cleanCatatan(set.Catatan))}"` : '-'}
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap space-x-1">
                    <button onclick="openViewSetoran('${set.ID_Setoran}')" class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition text-xs shadow-2xs" title="Lihat Detail Setoran">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button onclick="openEditSetoran('${set.ID_Setoran}')" class="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition text-xs shadow-2xs" title="Edit Catatan Setoran">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="deleteSetoranUstadz('${set.ID_Setoran}')" class="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 transition text-xs shadow-2xs" title="Hapus Catatan Setoran">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    ${detailTasmi ? `
                        <button onclick="openUstadzTasmiDetail('${set.ID_Setoran}')" class="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 transition text-xs shadow-2xs" title="Lihat & Cetak Kartu Tasmi'">
                            <i class="fa-solid fa-table-list"></i>
                        </button>
                    ` : ''}
                    <button onclick="cetakRekapanUstadz('${set.ID_Santri}')" class="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 text-[#9a2024] dark:text-[#f29fa3] transition text-xs shadow-2xs" title="Cetak Rapor Santri Ini">
                        <i class="fa-solid fa-file-pdf"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// ==================== VIEW, EDIT, & DELETE SETORAN ====================
function openViewSetoran(idSetoran) {
    const set = (state.setoran || []).find(x => String(x.ID_Setoran).trim() === String(idSetoran).trim());
    if (!set) return AppNotify.warning('Data Tidak Ditemukan', 'Catatan setoran tidak ditemukan di riwayat.');
    const s = findSantriById(state.santri, set.ID_Santri) || {};
    const santriNama = s.Nama_Santri || getSantriDisplayName(state.santri, set.ID_Santri);

    const jenis = set.Jenis || 'Ziyadah';
    const isZiyadah = jenis === 'Ziyadah' || jenis === 'Hafalan Baru';
    const isBinnadhor = jenis === 'Binnadhor';
    const isTasmi = (jenis || '').toLowerCase().includes('tasmi');
    const detailTasmi = isTasmi ? parseDetailTasmi(set.Detail_Tasmi) : null;

    const typeBadge = isZiyadah
        ? 'bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6] border border-[#b2dfc8]'
        : isBinnadhor
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200'
        : isTasmi
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200'
        : 'bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/40 dark:text-[#f29fa3] border border-[#f9c5c7]';

    const nilai = set.Predikat || set.Nilai || 'Mumtaz';
    const isLulusTasmi = detailTasmi ? detailTasmi.statusKelulusan === 'LULUS' : String(nilai).toUpperCase().startsWith('LULUS');
    const isMumtaz = nilai === 'Mumtaz' || nilai === 'Lancar' || isLulusTasmi;
    const isJayyid = nilai === 'Jayyid' || nilai === 'Kurang Lancar';
    const nilaiColor = isMumtaz ? 'text-[#1c6b45]' : isJayyid ? 'text-amber-600' : 'text-red-500';

    const subTitleEl = document.getElementById('viewSetoranSubtitle');
    if (subTitleEl) subTitleEl.textContent = `ID: ${set.ID_Setoran || '-'} • Waktu: ${set.Tanggal || '-'}`;

    const bodyEl = document.getElementById('viewSetoranBody');
    if (bodyEl) {
        bodyEl.innerHTML = `
            <!-- Kartu Santri -->
            <div class="bg-gray-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-gray-100 dark:border-darkborder flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-2xl bg-[#9a2024] text-white flex items-center justify-center font-black text-sm uppercase shadow-xs">
                        ${escapeHtml((santriNama || 'S').charAt(0))}
                    </div>
                    <div>
                        <h4 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white">${escapeHtml(santriNama)}</h4>
                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            <span>ID: <strong>${escapeHtml(set.ID_Santri)}</strong></span>
                            <span>&bull;</span>
                            <span>Tingkatan: <strong>${escapeHtml(set.Tingkatan || "Al-Qur'an")}</strong></span>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${typeBadge}">${escapeHtml(jenis)}</span>
                </div>
            </div>

            <!-- Rincian Setoran -->
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-white dark:bg-darkcard p-3.5 rounded-2xl border border-gray-200 dark:border-darkborder">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Materi / Surah</span>
                    <span class="font-bold text-gray-900 dark:text-white text-sm block">${escapeHtml(set.Surah || '-')}</span>
                    <span class="text-xs text-gray-500">${set.Tingkatan === 'Jilid' ? escapeHtml(set.Juz || '-') : 'Juz ' + escapeHtml(set.Juz || '-')}</span>
                </div>
                <div class="bg-white dark:bg-darkcard p-3.5 rounded-2xl border border-gray-200 dark:border-darkborder">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Ayat & Halaman</span>
                    <span class="font-bold text-gray-900 dark:text-white text-sm block">${escapeHtml(set.Ayat || '-')}</span>
                    <span class="text-xs text-gray-500">${isTasmi && detailTasmi ? `Skor: ${detailTasmi.totalSkor}/${detailTasmi.maksimalSkor || 100}` : escapeHtml(formatHalamanDisplay(set.Halaman) || '-')}</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="bg-white dark:bg-darkcard p-3.5 rounded-2xl border border-gray-200 dark:border-darkborder">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Sesi Tatap Muka (TM)</span>
                    <span class="font-bold text-gray-900 dark:text-white text-sm block">${escapeHtml(set.TM || '-')}</span>
                    <span class="text-xs text-gray-500">${escapeHtml(set.Tanggal || '-')}</span>
                </div>
                <div class="bg-white dark:bg-darkcard p-3.5 rounded-2xl border border-gray-200 dark:border-darkborder">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Nilai Evaluasi</span>
                    <span class="font-extrabold text-base block ${nilaiColor}">${escapeHtml(nilai)}</span>
                    <span class="text-[10px] text-gray-400">Pengampu: ${escapeHtml(set.ParafUstadz || 'Ustadz')}</span>
                </div>
            </div>

            <!-- Catatan Evaluasi -->
            <div class="bg-white dark:bg-darkcard p-4 rounded-2xl border border-gray-200 dark:border-darkborder">
                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5 flex items-center gap-1.5">
                    <i class="fa-solid fa-comment-dots text-gray-400"></i>
                    Catatan Evaluasi Ustadz
                </span>
                <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-200 italic leading-relaxed">
                    ${cleanCatatan(set.Catatan) ? `"${escapeHtml(cleanCatatan(set.Catatan))}"` : '<span class="text-gray-400 not-italic">(Tidak ada catatan tambahan untuk setoran ini)</span>'}
                </p>
            </div>

            ${detailTasmi ? `
            <!-- Kartu Ringkasan Tasmi' -->
            <div class="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between">
                <div>
                    <span class="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">Ujian Tasmi' Juz ${escapeHtml(detailTasmi.juz || set.Juz)}</span>
                    <span class="text-[11px] text-indigo-700 dark:text-indigo-300">Total Skor: <strong>${detailTasmi.totalSkor}/${detailTasmi.maksimalSkor || 100}</strong> &bull; Status: <strong>${detailTasmi.statusKelulusan || 'LULUS'}</strong></span>
                </div>
                <button type="button" onclick="closeModalViewSetoran(); openUstadzTasmiDetail('${set.ID_Setoran}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5">
                    <i class="fa-solid fa-table-list"></i>
                    <span>Buka Kartu Tasmi'</span>
                </button>
            </div>
            ` : ''}
        `;
    }

    const footerEl = document.getElementById('viewSetoranFooter');
    if (footerEl) {
        footerEl.innerHTML = `
            <div class="flex items-center gap-2">
                <button type="button" onclick="closeModalViewSetoran(); cetakRekapanUstadz('${set.ID_Santri}')" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5">
                    <i class="fa-solid fa-file-pdf text-[#9a2024]"></i>
                    <span>Cetak Rapor Santri</span>
                </button>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" onclick="closeModalViewSetoran(); openEditSetoran('${set.ID_Setoran}')" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5">
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span>Edit Catatan</span>
                </button>
                <button type="button" onclick="closeModalViewSetoran()" class="px-3.5 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition">
                    Tutup
                </button>
            </div>
        `;
    }

    const modal = document.getElementById('modalViewSetoran');
    if (modal) modal.classList.remove('hidden');
}

function closeModalViewSetoran() {
    const modal = document.getElementById('modalViewSetoran');
    if (modal) modal.classList.add('hidden');
}

function openEditSetoran(idSetoran) {
    const set = (state.setoran || []).find(x => String(x.ID_Setoran).trim() === String(idSetoran).trim());
    if (!set) return AppNotify.warning('Data Tidak Ditemukan', 'Catatan setoran tidak ditemukan.');

    const selSantri = document.getElementById('editSetoranSantri');
    if (selSantri) {
        selSantri.innerHTML = '';
        const mySantri = (state.santri || []).filter(s => s.ID_Ustadz === (sessionData ? sessionData.id : ''));
        const santriList = mySantri.length > 0 ? mySantri : (state.santri || []);
        santriList.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.ID_Santri;
            opt.textContent = `${s.Nama_Santri} (${s.ID_Santri})`;
            if (isSameSantriId(s.ID_Santri, set.ID_Santri)) opt.selected = true;
            selSantri.appendChild(opt);
        });
        if (!Array.from(selSantri.options).some(o => isSameSantriId(o.value, set.ID_Santri))) {
            const opt = document.createElement('option');
            opt.value = set.ID_Santri;
            const foundS = findSantriById(state.santri, set.ID_Santri);
            opt.textContent = foundS ? `${foundS.Nama_Santri} (${set.ID_Santri})` : set.ID_Santri;
            opt.selected = true;
            selSantri.appendChild(opt);
        }
    }

    document.getElementById('editSetoranId').value = set.ID_Setoran || '';
    document.getElementById('editSetoranTanggal').value = set.Tanggal || '';

    // Deteksi TM cerdas jika bernilai '-' tapi ada di Catatan
    let editTm = set.TM || '';
    if (!editTm || editTm === '-') {
        const m = String(set.Catatan || '').match(/TM:\s*([^\s|]+)/i);
        if (m) editTm = m[1];
    }
    document.getElementById('editSetoranTM').value = editTm;

    const jenis = set.Jenis || 'Ziyadah';
    const selJenis = document.getElementById('editSetoranJenis');
    if (selJenis) {
        const found = Array.from(selJenis.options).some(o => o.value.toLowerCase() === jenis.toLowerCase());
        if (found) {
            selJenis.value = jenis;
        } else {
            selJenis.value = 'Ziyadah';
        }
    }

    const tingkatan = set.Tingkatan || "Al-Qur'an";
    document.getElementById('editSetoranTingkatan').value = tingkatan;
    document.getElementById('editSetoranJuz').value = set.Juz || '';
    document.getElementById('editSetoranSurah').value = (set.Surah && set.Surah !== '-') ? set.Surah : '';
    document.getElementById('editSetoranAyat').value = (set.Ayat && set.Ayat !== '-') ? set.Ayat : '';
    document.getElementById('editSetoranHalaman').value = (set.Halaman && set.Halaman !== '-') ? set.Halaman : '';

    const nilai = set.Predikat || set.Nilai || 'Mumtaz';
    const selPredikat = document.getElementById('editSetoranPredikat');
    if (selPredikat) {
        let matched = false;
        Array.from(selPredikat.options).forEach(opt => {
            if (opt.value.toLowerCase() === nilai.toLowerCase()) {
                opt.selected = true;
                matched = true;
            }
        });
        if (!matched) {
            const newOpt = document.createElement('option');
            newOpt.value = nilai;
            newOpt.textContent = nilai;
            newOpt.selected = true;
            selPredikat.appendChild(newOpt);
        }
    }

    document.getElementById('editSetoranCatatan').value = cleanCatatan(set.Catatan);
    toggleEditTingkatanFields();

    const subTitleEl = document.getElementById('editSetoranSubtitle');
    if (subTitleEl) subTitleEl.textContent = `ID Setoran: ${set.ID_Setoran}`;

    const modal = document.getElementById('modalEditSetoran');
    if (modal) modal.classList.remove('hidden');
}

function closeModalEditSetoran() {
    const modal = document.getElementById('modalEditSetoran');
    if (modal) modal.classList.add('hidden');
}

function toggleEditTingkatanFields() {
    const tingkatan = document.getElementById('editSetoranTingkatan').value;
    const lblJuz = document.getElementById('editSetoranJuz') ? document.getElementById('editSetoranJuz').previousElementSibling : null;
    if (lblJuz) {
        lblJuz.textContent = tingkatan === 'Jilid' ? 'JILID / LEVEL JILID' : 'JUZ';
    }
}

async function saveEditedSetoran(event) {
    event.preventDefault();
    const idSetoran = document.getElementById('editSetoranId').value;
    const existingIndex = (state.setoran || []).findIndex(x => String(x.ID_Setoran).trim() === String(idSetoran).trim());
    if (existingIndex === -1) {
        return AppNotify.error('Error', 'Catatan setoran tidak ditemukan.');
    }

    const existingSet = state.setoran[existingIndex];
    const santriId = document.getElementById('editSetoranSantri').value;
    const jenis = document.getElementById('editSetoranJenis').value;
    const tanggal = document.getElementById('editSetoranTanggal').value;
    const tm = document.getElementById('editSetoranTM').value;
    const tingkatan = document.getElementById('editSetoranTingkatan').value;
    const juz = document.getElementById('editSetoranJuz').value;
    const surah = document.getElementById('editSetoranSurah').value;
    const ayat = document.getElementById('editSetoranAyat').value;
    const halaman = document.getElementById('editSetoranHalaman').value;
    const predikat = document.getElementById('editSetoranPredikat').value;
    const catatan = document.getElementById('editSetoranCatatan').value;

    const payload = {
        idSetoran: idSetoran,
        santriId: santriId,
        tingkatan: tingkatan,
        tm: tm,
        type: jenis,
        juz: juz,
        surah: surah,
        surahNo: existingSet.SurahNo || '',
        ayat: ayat,
        halaman: halaman,
        predikat: predikat,
        catatan: catatan,
        date: tanggal,
        parafUstadz: existingSet.ParafUstadz || (sessionData ? sessionData.name : 'Ustadz Pembimbing'),
        detailTasmi: existingSet.Detail_Tasmi ? (typeof existingSet.Detail_Tasmi === 'string' ? JSON.parse(existingSet.Detail_Tasmi) : existingSet.Detail_Tasmi) : undefined
    };

    // Optimistic local update
    state.setoran[existingIndex] = {
        ...existingSet,
        ID_Santri: santriId,
        Jenis: jenis,
        Tanggal: tanggal,
        TM: tm,
        Tingkatan: tingkatan,
        Juz: juz,
        Surah: surah,
        Ayat: ayat,
        Halaman: halaman,
        Predikat: predikat,
        Nilai: predikat,
        Catatan: catatan
    };

    closeModalEditSetoran();
    renderUstadzRekapanTable();
    renderUstadzRiwayat();
    renderUstadzDashboard();

    AppNotify.loading('Menyimpan Perubahan ke Database...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    apiCall('saveSetoran', token, payload).then(res => {
        AppNotify.close();
        if (res && res.status === 'success') {
            AppNotify.toast('success', 'Catatan setoran berhasil diperbarui!');
        } else {
            AppNotify.toast('info', 'Perubahan diperbarui di tabel lokal.');
        }
    }).catch(err => {
        AppNotify.close();
        AppNotify.toast('info', 'Perubahan tersimpan secara lokal.');
    });
}

async function deleteSetoranUstadz(idSetoran) {
    const set = (state.setoran || []).find(x => String(x.ID_Setoran).trim() === String(idSetoran).trim());
    if (!set) return AppNotify.warning('Data Tidak Ditemukan', 'Catatan setoran tidak ditemukan.');
    const s = findSantriById(state.santri, set.ID_Santri);
    const santriName = s ? s.Nama_Santri : getSantriDisplayName(state.santri, set.ID_Santri);

    const confirmed = await AppNotify.confirm(
        'Hapus Catatan Setoran?',
        `Apakah Anda yakin ingin menghapus catatan setoran <strong>${escapeHtml(set.TM || 'TM')}</strong> (${escapeHtml(set.Surah || '')}) untuk santri <strong>${escapeHtml(santriName)}</strong>?<br><br><span class="text-xs text-red-500 font-semibold">Tindakan ini tidak dapat dibatalkan.</span>`,
        'Ya, Hapus Setoran',
        'Batal'
    );

    if (!confirmed) return;

    AppNotify.loading('Menghapus Catatan Setoran...');

    // Optimistically remove from state
    state.setoran = (state.setoran || []).filter(x => String(x.ID_Setoran).trim() !== String(idSetoran).trim());
    renderUstadzRekapanTable();
    renderUstadzRiwayat();
    renderUstadzDashboard();

    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    apiCall('deleteDataGlobal', token, 'Data_Setoran', idSetoran).then(res => {
        AppNotify.close();
        if (res && res.status === 'success') {
            AppNotify.toast('success', 'Catatan setoran berhasil dihapus.');
        } else {
            AppNotify.toast('info', 'Catatan dihapus dari tampilan.');
        }
    }).catch(err => {
        AppNotify.close();
        AppNotify.toast('info', 'Catatan dihapus secara lokal.');
    });
}

// ==================== VIEW 4: DATA SANTRI BINAAN ====================
function renderUstadzSantriList() {
    const grid = document.getElementById('ustadzSantriCardsGrid');
    const badge = document.getElementById('santriListTotalBadge');
    if (!grid) return;
    grid.innerHTML = '';

    const mySantri = state.santri.filter(s => s.ID_Ustadz === (sessionData ? sessionData.id : ''));
    if (badge) badge.textContent = `${mySantri.length} Santri Binaan Aktif`;

    if (mySantri.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-400 text-xs">
                Belum ada data santri yang terhubung dengan akun Ustadz Anda.
            </div>
        `;
        return;
    }

    mySantri.forEach(santri => {
        const santriSetoran = state.setoran.filter(s => isSameSantriId(s.ID_Santri, santri.ID_Santri));
        const zCount = santriSetoran.filter(s => s.Jenis === 'Ziyadah' || s.Jenis === 'Hafalan Baru').length;
        const mCount = santriSetoran.filter(s => s.Jenis === 'Murojaah' || s.Jenis === "Muroja'ah").length;
        const bCount = santriSetoran.filter(s => s.Jenis === 'Binnadhor').length;
        const tCount = santriSetoran.filter(s => (s.Jenis || '').toLowerCase().includes('tasmi')).length;

        const lastSet = santriSetoran.length > 0 ? santriSetoran[santriSetoran.length - 1] : null;
        const isJilid = (santri.Tingkatan || '').toLowerCase() === 'jilid';

        const waNumber = (santri.No_WA_Wali || santri.No_HP_Wali || santri.No_WA || '').replace(/[^0-9]/g, '');
        const cleanWa = waNumber.startsWith('0') ? '62' + waNumber.slice(1) : waNumber;

        grid.innerHTML += `
            <div class="bg-white dark:bg-darkcard rounded-3xl p-5 border border-gray-100 dark:border-darkborder shadow-xs hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <div class="flex items-start justify-between gap-3 mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-[#edf7f2] dark:bg-[#12452c]/50 text-[#1c6b45] dark:text-[#83c9a6] font-extrabold flex items-center justify-center text-lg shadow-xs">
                                ${(santri.Nama_Santri || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 class="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white leading-tight">${santri.Nama_Santri}</h4>
                                <span class="text-[11px] font-mono text-gray-400 block mt-0.5">${santri.ID_Santri}</span>
                            </div>
                        </div>
                        <span class="px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                            isJilid 
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' 
                                : 'bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/40 dark:text-[#f29fa3]'
                        }">
                            ${isJilid ? 'Jilid' : 'Tahfizh'}
                        </span>
                    </div>

                    <!-- Statistik 4 Pilar Capaian Santri -->
                    <div class="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-darkborder text-center mb-3">
                        <div>
                            <span class="text-[9px] text-[#1c6b45] font-bold block">Ziyadah</span>
                            <span class="text-xs font-black text-gray-800 dark:text-white">${zCount}</span>
                        </div>
                        <div>
                            <span class="text-[9px] text-[#9a2024] font-bold block">Muroja'ah</span>
                            <span class="text-xs font-black text-gray-800 dark:text-white">${mCount}</span>
                        </div>
                        <div>
                            <span class="text-[9px] text-amber-600 font-bold block">Binnadhor</span>
                            <span class="text-xs font-black text-gray-800 dark:text-white">${bCount}</span>
                        </div>
                        <div>
                            <span class="text-[9px] text-indigo-600 font-bold block">Tasmi'</span>
                            <span class="text-xs font-black text-gray-800 dark:text-white">${tCount}</span>
                        </div>
                    </div>

                    <!-- Posisi Hafalan Terakhir -->
                    <div class="text-xs text-gray-600 dark:text-gray-300 mb-4 p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                        <span class="text-[10px] text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider block mb-0.5">Posisi Terakhir:</span>
                        ${lastSet 
                            ? `<span class="font-bold text-gray-900 dark:text-white">${lastSet.Surah} (${lastSet.Tingkatan === 'Jilid' ? lastSet.Juz : 'Juz ' + lastSet.Juz})</span>${formatHalamanDisplay(lastSet.Halaman) ? ', ' + formatHalamanDisplay(lastSet.Halaman) : ''} &bull; <strong class="text-[#1c6b45]">${lastSet.Predikat || 'Mumtaz'}</strong>`
                            : '<span class="text-gray-400 italic">Belum pernah setoran</span>'
                        }
                    </div>
                </div>

                <!-- Tombol Aksi: Input Setoran & Chat WA Wali -->
                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-darkborder">
                    <button onclick="openInputForSantri('${santri.ID_Santri}')" class="py-2 px-3 bg-[#9a2024] hover:bg-[#871a1e] text-white rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5 shadow-xs">
                        <i class="fa-solid fa-pen-nib"></i>
                        <span>Input Setoran</span>
                    </button>
                    ${cleanWa ? `
                        <a href="https://wa.me/${cleanWa}?text=Assalamu%27alaikum%20Bapak%2FIbu%20Wali%20Santri%20dari%20ananda%20${encodeURIComponent(santri.Nama_Santri)}" target="_blank" rel="noopener noreferrer" class="py-2 px-3 bg-[#1c6b45] hover:bg-[#165737] text-white rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5 shadow-xs">
                            <i class="fa-brands fa-whatsapp text-sm"></i>
                            <span>Chat Wali</span>
                        </a>
                    ` : `
                        <button onclick="cetakRekapanUstadz('${santri.ID_Santri}')" class="py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-file-pdf"></i>
                            <span>Rapor PDF</span>
                        </button>
                    `}
                </div>
            </div>
        `;
    });
}

// ==================== MODAL CETAK RAPOR BUKU MUTABA'AH DIGITAL ====================
function cetakRekapanUstadz(santriId) {
    const mySantri = (state.santri || []).filter(s => s.ID_Ustadz === (sessionData ? sessionData.id : ''));
    const santriPool = mySantri.length > 0 ? mySantri : (state.santri || []);
    let targetSantri = null;

    if (santriId && santriId !== 'all') {
        targetSantri = findSantriById(state.santri, santriId);
    } else {
        const rekapSel = document.getElementById('rekapFilterSantri');
        if (rekapSel && rekapSel.value !== 'all') {
            targetSantri = findSantriById(state.santri, rekapSel.value);
        } else if (santriPool.length > 0) {
            targetSantri = santriPool[0];
        }
    }

    if (!targetSantri) {
        return AppNotify.warning('Pilih Santri', 'Silakan pilih santri yang hendak dicetak laporan hafalannya.');
    }

    const santriSetoran = (state.setoran || []).filter(s => isSameSantriId(s.ID_Santri, targetSantri.ID_Santri));
    const zCount = santriSetoran.filter(s => s.Jenis === 'Ziyadah' || s.Jenis === 'Hafalan Baru').length;
    const mCount = santriSetoran.filter(s => s.Jenis === 'Murojaah' || s.Jenis === "Muroja'ah").length;
    const bCount = santriSetoran.filter(s => s.Jenis === 'Binnadhor').length;
    const tCount = santriSetoran.filter(s => (s.Jenis || '').toLowerCase().includes('tasmi')).length;

    const printArea = document.getElementById('printAreaMutabaah');
    if (!printArea) return;

    printArea.innerHTML = `
        <div class="border-b-2 border-black pb-4 mb-4 text-center">
            <h2 class="text-xl font-bold uppercase tracking-wide">Pondok Pesantren Tahfizh Zadil Qur'an Tuban</h2>
            <p class="text-xs text-gray-600">Alamat: Jl. Pesantren Zadil Qur'an, Tuban - Jawa Timur &bull; Telp/WA: 0857-3180-4663</p>
            <h3 class="text-base font-bold mt-3 underline tracking-wider">LAPORAN HAFALAN &amp; PENILAIAN EVALUASI SANTRI</h3>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs mb-4">
            <div>
                <p><strong>Nama Santri:</strong> ${targetSantri.Nama_Santri}</p>
                <p><strong>Nomor Induk / ID:</strong> ${targetSantri.ID_Santri}</p>
                <p><strong>Tingkatan:</strong> ${targetSantri.Tingkatan || "Al-Qur'an 30 Juz"}</p>
            </div>
            <div>
                <p><strong>Ustadz Pengampu:</strong> ${sessionData ? sessionData.name : 'Ustadz Pembimbing'}</p>
                <p><strong>Total Sesi Simakan:</strong> ${santriSetoran.length} Pertemuan (TM)</p>
                <p><strong>Capaian Pilar:</strong> Ziyadah: ${zCount} | Muroja'ah: ${mCount} | Binnadhor: ${bCount} | Tasmi': ${tCount}</p>
            </div>
        </div>

        <table class="w-full text-xs border border-gray-400 mb-6 border-collapse">
            <thead>
                <tr class="bg-gray-100 border-b border-gray-400 text-left">
                    <th class="p-2 border-r border-gray-400">TM &amp; Tgl</th>
                    <th class="p-2 border-r border-gray-400">Pilar</th>
                    <th class="p-2 border-r border-gray-400">Surat / Jilid</th>
                    <th class="p-2 border-r border-gray-400">Ayat / Hal</th>
                    <th class="p-2 border-r border-gray-400">Nilai</th>
                    <th class="p-2 border-r border-gray-400">Catatan Tajwid &amp; Adab</th>
                    <th class="p-2 text-center">Paraf</th>
                </tr>
            </thead>
            <tbody>
                ${santriSetoran.length === 0 ? '<tr><td colspan="7" class="p-4 text-center text-gray-500">Belum ada riwayat setoran.</td></tr>' : ''}
                ${santriSetoran.map(set => {
                    // Ekstraksi TM cerdas jika kosong atau '-'
                    let displayTM = set.TM;
                    if (!displayTM || displayTM === '-') {
                        const m = String(set.Catatan || '').match(/TM:\s*([^\s|]+)/i);
                        displayTM = m ? m[1] : (set.TM || 'TM');
                    }
                    if (displayTM && !displayTM.toUpperCase().startsWith('TM') && /^\d+$/.test(displayTM)) {
                        displayTM = 'TM ' + displayTM;
                    }

                    // Ekstraksi Paraf cerdas jika masih default/ttd
                    let displayParaf = set.ParafUstadz;
                    if (!displayParaf || displayParaf === 'Ttd' || displayParaf === 'Ustadz Pembimbing') {
                        const pm = String(set.Catatan || '').match(/Paraf:\s*([^\s|]+)/i);
                        if (pm) displayParaf = pm[1];
                    }

                    // Surat & Juz
                    let displaySurat = set.Surah || set.Surat || '';
                    if (displaySurat === '-') displaySurat = '';
                    const juzLabel = set.Tingkatan === 'Jilid' ? (set.Juz || '') : (set.Juz ? `Juz ${set.Juz}` : '');
                    const suratJuzCombined = displaySurat 
                        ? `${displaySurat} ${juzLabel ? `(${juzLabel})` : ''}`
                        : (juzLabel || '-');

                    // Ayat & Halaman
                    let displayAyat = set.Ayat && set.Ayat !== '-' ? set.Ayat : '';
                    let displayHal = formatHalamanDisplay(set.Halaman);
                    let ayatHalCombined = '-';
                    if (displayAyat && displayHal) {
                        ayatHalCombined = `${escapeHtml(displayAyat)}<br><span class="text-gray-500">${escapeHtml(displayHal)}</span>`;
                    } else if (displayAyat) {
                        ayatHalCombined = escapeHtml(displayAyat);
                    } else if (displayHal) {
                        ayatHalCombined = escapeHtml(displayHal);
                    }

                    // Catatan tajwid & adab yang bersih
                    const displayCatatan = cleanCatatan(set.Catatan) || '-';

                    return `
                    <tr class="border-b border-gray-300">
                        <td class="p-2 border-r border-gray-300"><strong>${escapeHtml(displayTM)}</strong><br>${escapeHtml(set.Tanggal || '-')}</td>
                        <td class="p-2 border-r border-gray-300 font-bold">${escapeHtml(set.Jenis || '-')}</td>
                        <td class="p-2 border-r border-gray-300">${escapeHtml(suratJuzCombined)}</td>
                        <td class="p-2 border-r border-gray-300">${ayatHalCombined}</td>
                        <td class="p-2 border-r border-gray-300 font-bold">${escapeHtml(set.Predikat || set.Nilai || 'Mumtaz')}</td>
                        <td class="p-2 border-r border-gray-300 italic">${escapeHtml(displayCatatan || '-')}</td>
                        <td class="p-2 text-center text-[11px] font-mono">${escapeHtml(displayParaf || 'Ttd')}</td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>

        <div class="flex justify-between text-xs pt-4 border-t border-gray-200">
            <div class="text-center">
                <p>Mengetahui,</p>
                <p class="font-bold mt-12">( Orang Tua / Wali Santri )</p>
            </div>
            <div class="text-center">
                <p>Tuban, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p class="mt-1">Ustadz Pengampu Halaqah,</p>
                <p class="font-bold mt-12 underline">( ${sessionData ? sessionData.name : 'Ustadz Pembimbing'} )</p>
            </div>
        </div>
    `;

    const modal = document.getElementById('modalCetakUstadz');
    if (modal) modal.classList.remove('hidden');
}

function tutupModalCetak() {
    const modal = document.getElementById('modalCetakUstadz');
    if (modal) modal.classList.add('hidden');
}

// ==================== INISIALISASI & LOAD DATA ====================
async function bersihkanCatatanSistemOtomatis() {
    AppNotify.confirm(
        'Bersihkan Catatan Sistem Otomatis?',
        'Teks format bawaan sistem (seperti <em>"TM: ... | Paraf: ..."</em>) akan dihapus dari seluruh catatan setoran di spreadsheet dan dikosongkan.<br><br>Catatan evaluasi murni asatidz tidak akan terhapus. Lanjutkan?',
        async () => {
            const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
            AppNotify.loading('Membersihkan catatan sistem di database...');
            try {
                const res = await apiCall('cleanAllLegacyNotes', token);
                AppNotify.close();
                if (state.setoran && Array.isArray(state.setoran)) {
                    state.setoran.forEach(s => {
                        s.Catatan = cleanCatatan(s.Catatan);
                    });
                }
                renderUstadzRekapanTable();
                renderUstadzRiwayat();
                if (res && res.status === 'success') {
                    AppNotify.toast('success', res.message || 'Catatan sistem berhasil dibersihkan!');
                } else {
                    AppNotify.toast('success', 'Catatan sistem berhasil dikosongkan dari tampilan!');
                }
            } catch (err) {
                AppNotify.close();
                if (state.setoran && Array.isArray(state.setoran)) {
                    state.setoran.forEach(s => {
                        s.Catatan = cleanCatatan(s.Catatan);
                    });
                }
                renderUstadzRekapanTable();
                renderUstadzRiwayat();
                AppNotify.toast('info', 'Catatan sistem dibersihkan dari tampilan lokal.');
            }
        }
    );
}

function loadUstadzData() {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    AppNotify.loading('Memuat Data Halaqah Ustadz...');
    apiCall('fetchAppData', token).then(res => {
        AppNotify.close();
        if (res.status === 'success') {
            state = { ...state, ...res.data };
            if (state.setoran && Array.isArray(state.setoran)) {
                state.setoran.forEach(s => {
                    s.Catatan = cleanCatatan(s.Catatan);
                });
            }
            updateBrandingDOM(state.appName);
            initSmartForm();
            renderUstadzDashboard();
            renderUstadzRiwayat();
            populateRekapFilterSantri();
            renderUstadzRekapanTable();
            renderUstadzSantriList();
        } else {
            AppNotify.error('Gagal Memuat Data', res.message);
        }
    }).catch(() => AppNotify.close());
}

// Explicit window exposures for inline onclick handlers
if (typeof window !== 'undefined') {
    window.openViewSetoran = openViewSetoran;
    window.closeModalViewSetoran = closeModalViewSetoran;
    window.openEditSetoran = openEditSetoran;
    window.closeModalEditSetoran = closeModalEditSetoran;
    window.toggleEditTingkatanFields = toggleEditTingkatanFields;
    window.saveEditedSetoran = saveEditedSetoran;
    window.deleteSetoranUstadz = deleteSetoranUstadz;
    window.bersihkanCatatanSistemOtomatis = bersihkanCatatanSistemOtomatis;
}

window.addEventListener('DOMContentLoaded', () => {
    initPwa();
    if (!checkExistingSession() || !sessionData || sessionData.role !== 'ustadz') {
        window.location.href = 'login.html';
        return;
    }

    const name = sessionData.name || 'Ustadz';
    document.getElementById('userNameDisplay').textContent = name;
    document.getElementById('dashUstadzName').textContent = name;
    document.getElementById('userRoleDisplay').textContent = sessionData.role;
    document.getElementById('userInitial').textContent = name.charAt(0).toUpperCase();
    const badgeEl = document.getElementById('parafUstadzBadge');
    if (badgeEl) badgeEl.textContent = name;

    loadUstadzData();
});
