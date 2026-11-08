/**
 * ============================================================================
 * ZADIL QURAN - USTADZ WORKSPACE & MUTABA'AH MODULE (js/ustadz.js)
 * Digunakan oleh ustadz.html
 * Mencakup: Database 114 Surat Al-Qur'an, Mode Al-Qur'an & Jilid,
 * 3 Pilar Setoran (Ziyadah, Murojaah, Binnadhor), Tatap Muka (TM),
 * Penilaian Standar (Mumtaz, Jayyid, Dhoif), dan Paraf Ustadz.
 * ============================================================================
 */

let state = {
    ustadz: [],
    santri: [],
    setoran: [],
    appName: "Zadil Quran"
};

let tsSantri = null, tsSurat = null, lastPinData = null;

// --- QURAN DB (114 SURAT) ---
const rawQuran = [[1,"Al-Fatihah",7,1],[2,"Al-Baqarah",286,1],[3,"Ali 'Imran",200,3],[4,"An-Nisa'",176,4],[5,"Al-Ma'idah",120,6],[6,"Al-An'am",165,7],[7,"Al-A'raf",206,8],[8,"Al-Anfal",75,9],[9,"At-Taubah",129,10],[10,"Yunus",109,11],[11,"Hud",123,11],[12,"Yusuf",111,12],[13,"Ar-Ra'd",43,13],[14,"Ibrahim",52,13],[15,"Al-Hijr",99,14],[16,"An-Nahl",128,14],[17,"Al-Isra'",111,15],[18,"Al-Kahf",110,15],[19,"Maryam",98,16],[20,"Taha",135,16],[21,"Al-Anbiya'",112,17],[22,"Al-Hajj",78,17],[23,"Al-Mu'minun",118,18],[24,"An-Nur",64,18],[25,"Al-Furqan",77,18],[26,"Asy-Syu'ara'",227,19],[27,"An-Naml",93,19],[28,"Al-Qasas",88,20],[29,"Al-'Ankabut",69,20],[30,"Ar-Rum",60,21],[31,"Luqman",34,21],[32,"As-Sajdah",30,21],[33,"Al-Ahzab",73,21],[34,"Saba'",54,22],[35,"Fatir",45,22],[36,"Yasin",83,22],[37,"As-Saffat",182,23],[38,"Sad",88,23],[39,"Az-Zumar",75,23],[40,"Ghafir",85,24],[41,"Fussilat",54,24],[42,"Asy-Syura",53,25],[43,"Az-Zukhruf",89,25],[44,"Ad-Dukhan",59,25],[45,"Al-Jasiyah",37,25],[46,"Al-Ahqaf",35,26],[47,"Muhammad",38,26],[48,"Al-Fath",29,26],[49,"Al-Hujurat",18,26],[50,"Qaf",45,26],[51,"Az-Zariyat",60,26],[52,"At-Tur",49,27],[53,"An-Najm",62,27],[54,"Al-Qamar",55,27],[55,"Ar-Rahman",78,27],[56,"Al-Waqi'ah",96,27],[57,"Al-Hadid",29,27],[58,"Al-Mujadilah",22,28],[59,"Al-Hasyr",24,28],[60,"Al-Mumtahanah",13,28],[61,"As-Saff",14,28],[62,"Al-Jumu'ah",11,28],[63,"Al-Munafiqun",11,28],[64,"At-Tagabun",18,28],[65,"At-Talaq",12,28],[66,"At-Tahrim",12,28],[67,"Al-Mulk",30,29],[68,"Al-Qalam",52,29],[69,"Al-Haqqah",52,29],[70,"Al-Ma'arij",44,29],[71,"Nuh",28,29],[72,"Al-Jinn",28,29],[73,"Al-Muzzammil",20,29],[74,"Al-Muddassir",56,29],[75,"Al-Qiyamah",40,29],[76,"Al-Insan",31,29],[77,"Al-Mursalat",50,29],[78,"An-Naba'",40,30],[79,"An-Nazi'at",46,30],[80,"'Abasa",42,30],[81,"At-Takwir",29,30],[82,"Al-Infitar",19,30],[83,"Al-Mutaffifin",36,30],[84,"Al-Insyiqaq",25,30],[85,"Al-Buruj",22,30],[86,"At-Tariq",17,30],[87,"Al-A'la",19,30],[88,"Al-Gasyiyah",26,30],[89,"Al-Fajr",30,30],[90,"Al-Balad",20,30],[91,"Asy-Syams",15,30],[92,"Al-Lail",21,30],[93,"Ad-Duha",11,30],[94,"Asy-Syarh",8,30],[95,"At-Tin",8,30],[96,"Al-'Alaq",19,30],[97,"Al-Qadr",5,30],[98,"Al-Bayyinah",8,30],[99,"Az-Zalzalah",8,30],[100,"Al-'Adiyat",11,30],[101,"Al-Qari'ah",11,30],[102,"At-Takasur",8,30],[103,"Al-'Asr",3,30],[104,"Al-Humazah",9,30],[105,"Al-Fil",5,30],[106,"Quraisy",4,30],[107,"Al-Ma'un",7,30],[108,"Al-Kausar",3,30],[109,"Al-Kafirun",6,30],[110,"An-Nasr",3,30],[111,"Al-Lahab",5,30],[112,"Al-Ikhlas",4,30],[113,"Al-Falaq",5,30],[114,"An-Nas",6,30]];
const quranDB = rawQuran.map(q => ({ no: q[0], nama: q[1], ayat: q[2], juz: q[3] }));

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.toggle('hidden');
}

function initSmartForm() {
    const now = new Date();
    document.getElementById('smartDate').value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    const selSantri = document.getElementById('smartSantri');
    if (tsSantri) {
        tsSantri.destroy();
    }
    selSantri.innerHTML = '<option value="">🔍 Ketik nama santri...</option>';
    state.santri.filter(s => s.ID_Ustadz === sessionData.id).forEach(s => {
        selSantri.innerHTML += `<option value="${s.ID_Santri}">${s.Nama_Santri} (${s.ID_Santri})</option>`;
    });

    tsSantri = new TomSelect('#smartSantri', {
        create: false,
        sortField: { field: "text", direction: "asc" },
        onChange: function(val) { checkSmartPin(val); }
    });

    const selJuz = document.getElementById('smartJuz');
    selJuz.innerHTML = '<option value="all">Semua</option>';
    for (let i = 1; i <= 30; i++) selJuz.innerHTML += `<option value="${i}">Juz ${i}</option>`;
    populateSurat();
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

function switchSmartTab(type) {
    document.getElementById('smartType').value = type;
    const btnZiyadah = document.getElementById('btnTabZiyadah');
    const btnMurojaah = document.getElementById('btnTabMurojaah');
    const btnBinnadhor = document.getElementById('btnTabBinnadhor');

    const inactive = "py-2 px-2 rounded-lg text-xs font-bold transition text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 text-center";
    if (btnZiyadah) {
        btnZiyadah.className = type === 'Ziyadah'
            ? "py-2 px-2 rounded-lg text-xs font-bold transition bg-[#1c6b45] text-white shadow-xs text-center"
            : inactive;
    }
    if (btnMurojaah) {
        btnMurojaah.className = type === 'Murojaah'
            ? "py-2 px-2 rounded-lg text-xs font-bold transition bg-[#9a2024] text-white shadow-xs text-center"
            : inactive;
    }
    if (btnBinnadhor) {
        btnBinnadhor.className = type === 'Binnadhor'
            ? "py-2 px-2 rounded-lg text-xs font-bold transition bg-amber-600 text-white shadow-xs text-center"
            : inactive;
    }
}

function populateSurat() {
    const juzVal = document.getElementById('smartJuz').value;
    const selSurat = document.getElementById('smartSurat');
    if (tsSurat) {
        tsSurat.destroy();
    }
    selSurat.innerHTML = '<option value="">🔍 Ketik surat...</option>';

    let filteredSurat = juzVal !== 'all' ? quranDB.filter(q => q.juz == parseInt(juzVal)) : quranDB;
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
        pinContainer.classList.add('hidden');
        lastPinData = null;
        if (tmInput) tmInput.value = 'TM-1';
        return;
    }

    const history = state.setoran.filter(s => s.ID_Santri === santriId);
    // Otomatis hitung TM berikutnya untuk santri ini
    const nextTmNumber = history.length + 1;
    if (tmInput) tmInput.value = `TM-${nextTmNumber}`;

    if (history.length > 0) {
        lastPinData = history[history.length - 1]; // Ambil setoran paling baru
        document.getElementById('smartPinText').textContent = `Terakhir (${lastPinData.TM || 'TM'}): ${lastPinData.Surah} (${lastPinData.Juz}), Hal ${lastPinData.Halaman}`;
        pinContainer.classList.remove('hidden');
    } else {
        pinContainer.classList.add('hidden');
        lastPinData = null;
    }
}

function applySmartPin() {
    if (!lastPinData) return;
    const tingkat = lastPinData.Tingkatan || "Al-Qur'an";
    switchTingkatan(tingkat);
    switchSmartTab('Murojaah');

    if (tingkat === 'Jilid') {
        document.getElementById('smartJilidLevel').value = lastPinData.Juz || 'Jilid 1';
        document.getElementById('smartJilidNama').value = lastPinData.Surah || 'Metode Ummi Jilid 1';
        document.getElementById('smartJilidBaris').value = lastPinData.Ayat || '';
    } else {
        document.getElementById('smartJuz').value = lastPinData.Juz;
        populateSurat();
        if (tsSurat && lastPinData.SurahNo) tsSurat.setValue(lastPinData.SurahNo);
    }
    document.getElementById('smartHal').value = lastPinData.Halaman || '';
    AppNotify.toast('info', 'Data Setoran Terakhir Terisi');
}

function saveSetoran(e) {
    e.preventDefault();
    const santriId = tsSantri ? tsSantri.getValue() : '';
    if (!santriId) return AppNotify.warning('Pilih Santri', 'Silakan pilih santri binaan terlebih dahulu.');

    const tingkatan = document.getElementById('smartTingkatan').value || "Al-Qur'an";
    const tmVal = document.getElementById('smartTM').value || "TM-1";
    const typeVal = document.getElementById('smartType').value || "Ziyadah";
    let juzVal = '', surahVal = '', surahNoVal = '', ayatVal = '';

    if (tingkatan === "Al-Qur'an") {
        const suratNo = tsSurat ? tsSurat.getValue() : '';
        if (!suratNo) return AppNotify.warning('Pilih Surat', 'Silakan pilih surat Al-Qur\'an terlebih dahulu.');
        const suratData = quranDB.find(q => q.no == suratNo);
        const startAyat = document.getElementById('smartAyatStart').value || '1';
        const endAyat = document.getElementById('smartAyatEnd').value || suratData.ayat;

        juzVal = document.getElementById('smartJuz').value === 'all' ? String(suratData.juz) : String(document.getElementById('smartJuz').value);
        surahVal = suratData.nama;
        surahNoVal = suratData.no;
        ayatVal = `${startAyat} - ${endAyat}`;
    } else {
        juzVal = document.getElementById('smartJilidLevel').value || 'Jilid 1';
        surahVal = document.getElementById('smartJilidNama').value || juzVal;
        surahNoVal = juzVal;
        ayatVal = document.getElementById('smartJilidBaris').value || '-';
    }

    const rawDate = document.getElementById('smartDate').value;
    const displayDate = new Date(rawDate).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const payload = {
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

    AppNotify.loading('Menyimpan Mutaba\'ah Harian...');
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    apiCall('saveSetoran', token, payload).then(res => {
        if (res.status === 'success') {
            AppNotify.toast('success', 'Setoran mutaba\'ah harian santri berhasil disimpan!');
            document.getElementById('smartHal').value = '';
            document.getElementById('smartCatatan').value = '';
            loadUstadzData();
        } else {
            AppNotify.error('Gagal Menyimpan Setoran', res.message);
        }
    });
}

function renderUstadzRiwayat() {
    const container = document.getElementById('listSetoranUstadz');
    const countEl = document.getElementById('ustadzHistoryCount');
    if (!container) return;
    container.innerHTML = '';

    const mySetoran = state.setoran.filter(set => set.ID_Ustadz === sessionData.id).slice().reverse();
    if (countEl) countEl.textContent = `${mySetoran.length} Catatan Mutaba'ah`;

    if (mySetoran.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-8 text-sm">Belum ada catatan mutaba'ah harian yang diinput.</p>`;
        return;
    }

    mySetoran.forEach(set => {
        const s = state.santri.find(san => san.ID_Santri === set.ID_Santri);
        const jenis = set.Jenis || 'Ziyadah';
        const isZiyadah = jenis === 'Ziyadah' || jenis === 'Hafalan Baru';
        const isBinnadhor = jenis === 'Binnadhor';

        const borderLeft = isZiyadah
            ? 'border-l-4 border-[#1c6b45]'
            : isBinnadhor
            ? 'border-l-4 border-amber-500'
            : 'border-l-4 border-[#9a2024]';

        const typeBadge = isZiyadah
            ? 'bg-[#edf7f2] text-[#1c6b45] dark:bg-[#12452c]/50 dark:text-[#83c9a6]'
            : isBinnadhor
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
            : 'bg-[#fdf2f2] text-[#9a2024] dark:bg-[#731417]/40 dark:text-[#f29fa3]';

        const nilai = set.Predikat || 'Mumtaz';
        const isMumtaz = nilai === 'Mumtaz' || nilai === 'Lancar';
        const isJayyid = nilai === 'Jayyid' || nilai === 'Kurang Lancar';
        const predIcon = isMumtaz ? '🌟' : isJayyid ? '👍' : '🔁';

        const tingkatBadge = set.Tingkatan === 'Jilid' ? 'Jilid / Tahsin' : 'Al-Qur\'an';
        const tmText = set.TM || 'TM';
        const parafText = set.ParafUstadz || (sessionData ? sessionData.name : 'Ustadz');

        container.innerHTML += `
            <div class="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-darkborder ${borderLeft}">
                <div class="flex justify-between items-start gap-2 mb-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-[10px] font-mono font-bold text-gray-700 dark:text-gray-200">${tmText}</span>
                            <h4 class="font-bold text-gray-900 dark:text-white text-sm">${s ? s.Nama_Santri : set.ID_Santri}</h4>
                        </div>
                        <p class="text-[11px] text-gray-500 mt-0.5">${set.Tanggal} &bull; <span class="font-medium">${tingkatBadge}</span></p>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeBadge}">${jenis}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 mb-2 bg-white dark:bg-darkcard p-2.5 rounded-xl border border-gray-100 dark:border-darkborder">
                    <div>
                        <span class="text-gray-400 text-[10px] block">${set.Tingkatan === 'Jilid' ? 'Materi Jilid' : 'Surat & Juz'}</span>
                        <span class="font-bold">${set.Surah} (${set.Tingkatan === 'Jilid' ? set.Juz : 'Juz ' + set.Juz})</span>
                    </div>
                    <div>
                        <span class="text-gray-400 text-[10px] block">${set.Tingkatan === 'Jilid' ? 'Baris & Halaman' : 'Ayat & Halaman'}</span>
                        <span class="font-bold">${set.Tingkatan === 'Jilid' ? set.Ayat : 'Ayat ' + set.Ayat} &bull; Hal ${set.Halaman}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between gap-2 text-xs pt-1">
                    <span class="font-bold text-gray-800 dark:text-gray-200">${predIcon} Nilai: ${nilai}</span>
                    <span class="text-[11px] text-[#1c6b45] dark:text-[#83c9a6] font-semibold"><i class="fa-solid fa-signature mr-1"></i>Paraf: ${parafText}</span>
                </div>
                ${set.Catatan ? `<div class="mt-2 pt-2 border-t border-gray-200/60 dark:border-darkborder text-[11px] text-gray-600 dark:text-gray-400 italic">"${set.Catatan}"</div>` : ''}
            </div>
        `;
    });
}

function loadUstadzData() {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    AppNotify.loading('Memuat Buku Mutaba\'ah...');
    apiCall('fetchAppData', token).then(res => {
        AppNotify.close();
        if (res.status === 'success') {
            state = { ...state, ...res.data };
            updateBrandingDOM(state.appName);
            initSmartForm();
            renderUstadzRiwayat();
        } else {
            AppNotify.error('Gagal Memuat Data', res.message);
        }
    }).catch(() => AppNotify.close());
}

window.addEventListener('DOMContentLoaded', () => {
    initPwa();
    if (!checkExistingSession() || !sessionData || sessionData.role !== 'ustadz') {
        window.location.href = 'login.html';
        return;
    }

    const name = sessionData.name || 'Ustadz';
    document.getElementById('userNameDisplay').textContent = name;
    document.getElementById('userRoleDisplay').textContent = sessionData.role;
    document.getElementById('userInitial').textContent = name.charAt(0).toUpperCase();
    const badgeEl = document.getElementById('parafUstadzBadge');
    if (badgeEl) badgeEl.textContent = name;

    loadUstadzData();
});
