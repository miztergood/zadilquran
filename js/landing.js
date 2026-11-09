/**
 * ============================================================================
 * ZADIL QURAN - LANDING PAGE & ONLINE PSB MODULE (js/landing.js)
 * Digunakan oleh index.html & landingpage.html
 * ============================================================================
 */

// ==================== KONFIGURASI PSB DINAMIS (SYARAT & BIAYA OTOMATIS) ====================
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

function getLocalPsbConfig() {
    try {
        const stored = localStorage.getItem('ZQ_PSB_CONFIG');
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_PSB_CONFIG;
}

function renderPsbOnlineView(config) {
    if (!config) config = getLocalPsbConfig();

    // 1. Render Syarat Pendaftaran
    const syaratList = document.getElementById('psbSyaratList');
    if (syaratList && Array.isArray(config.syarat)) {
        syaratList.innerHTML = config.syarat.map((item, idx) => `
            <li class="p-2 rounded-lg bg-gray-50 dark:bg-slate-800/60 leading-relaxed font-medium">
                ${item}
            </li>
        `).join('');
    }

    const catatanEl = document.getElementById('psbCatatanSyarat');
    if (catatanEl && config.catatanSyarat) {
        catatanEl.textContent = config.catatanSyarat;
    }

    // 2. Render Rincian Biaya & Fasilitas
    const biayaList = document.getElementById('psbBiayaList');
    let subtotal = 0;
    if (biayaList && Array.isArray(config.biayaFasilitas)) {
        biayaList.innerHTML = config.biayaFasilitas.map((item, idx) => {
            const nom = Number(item.nominal) || 0;
            subtotal += nom;
            return `
                <div class="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>${idx + 1}. ${item.nama}</span>
                    <span class="font-semibold">${formatRupiah(nom)}</span>
                </div>
            `;
        }).join('');
    } else {
        subtotal = (config.biayaFasilitas || []).reduce((s, b) => s + (Number(b.nominal) || 0), 0) || 1800000;
    }

    const sppNominal = Number(config.sppBulanan) || 200000;
    const grandTotal = subtotal + sppNominal;

    const elSubtotal = document.getElementById('psbSubtotalBiaya');
    if (elSubtotal) elSubtotal.textContent = formatRupiah(subtotal);

    const elSpp = document.getElementById('psbSyahriyahNominal');
    if (elSpp) elSpp.textContent = `${formatRupiah(sppNominal)} / bulan`;

    const elGrandTotal = document.getElementById('psbGrandTotal');
    if (elGrandTotal) elGrandTotal.textContent = formatRupiah(grandTotal);
}

function loadPsbOnlineConfig() {
    renderPsbOnlineView(getLocalPsbConfig());

    apiCall('getPsbConfig').then(res => {
        if (res && res.status === 'success' && res.data) {
            localStorage.setItem('ZQ_PSB_CONFIG', JSON.stringify(res.data));
            renderPsbOnlineView(res.data);
        }
    }).catch(err => {
        console.warn('Gagal memuat konfigurasi PSB dari server:', err);
    });
}

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

/**
 * Data Galeri Dokumentasi Kegiatan Santri (dari folder lokal `aset grafis/`)
 */
const LANDING_GALLERY_ITEMS = [
    {
        file: "wisuda-akbar-tahfidz-jawa-timur.jpeg",
        title: "Wisuda Akbar Tahfizh Al-Qur'an Jawa Timur",
        category: "tahfidz",
        categoryLabel: "Tahfizh & Wisuda"
    },
    {
        file: "setoran-hafalan-santri-putra-bersama-ustadz.jpeg",
        title: "Simakan Setoran Hafalan Santri Putra Bersama Ustadz",
        category: "tahfidz",
        categoryLabel: "Tahfizh & Halaqah"
    },
    {
        file: "halaqah-talaqqi-quran-santriwati.jpeg",
        title: "Halaqah Talaqqi & Muroja'ah Al-Qur'an Santriwati",
        category: "tahfidz",
        categoryLabel: "Tahfizh & Halaqah"
    },
    {
        file: "pembelajaran-komputer-santri-remaja.jpeg",
        title: "Praktik Literasi Komputer & Digital Santri",
        category: "digital",
        categoryLabel: "Komputer & Digital"
    },
    {
        file: "ekstrakurikuler-hadroh-rebana-santri-putra.jpeg",
        title: "Penampilan Seni Islami Hadroh & Rebana Santri Putra",
        category: "ekskul",
        categoryLabel: "Ekstrakurikuler"
    },
    {
        file: "kajian-mihrab-musholla-bersama-ustadz.jpeg",
        title: "Kajian Kitab & Tausiyah Ba'da Shalat Berjamaah",
        category: "kajian",
        categoryLabel: "Kajian Diniyah"
    },
    {
        file: "pembelajaran-tajwid-makharijul-huruf.jpeg",
        title: "Pembelajaran Tahsin, Tajwid, & Makharijul Huruf",
        category: "tahfidz",
        categoryLabel: "Tahfizh & Halaqah"
    },
    {
        file: "praktek-komputer-santriwati.jpeg",
        title: "Pelatihan Komputer Dasar & Teknologi bagi Santriwati",
        category: "digital",
        categoryLabel: "Komputer & Digital"
    },
    {
        file: "halaqah-bimbingan-ustadz-santri-putra-putri.jpeg",
        title: "Halaqah Bimbingan Al-Qur'an Terpadu Bersama Pengampu",
        category: "tahfidz",
        categoryLabel: "Tahfizh & Halaqah"
    },
    {
        file: "tilawah-quran-santriwati.jpeg",
        title: "Tilawah & Binnadhor Al-Qur'an Santriwati",
        category: "tahfidz",
        categoryLabel: "Tahfizh & Halaqah"
    },
    {
        file: "aula-tahfidz-tabel-evaluasi-hafalan-santri.jpeg",
        title: "Aula Tahfizh & Papan Evaluasi Pencapaian Hafalan Santri",
        category: "tahfidz",
        categoryLabel: "Tahfizh & Halaqah"
    },
    {
        file: "kajian-santri-putra-aula-pesantren.jpeg",
        title: "Kajian Diniyah Santri Putra di Aula Pesantren",
        category: "kajian",
        categoryLabel: "Kajian Diniyah"
    },
    {
        file: "kajian-kitab-santriwati-bersama-ustadz.jpeg",
        title: "Pendalaman Materi Fiqih & Aqidah Akhlak Santriwati",
        category: "kajian",
        categoryLabel: "Kajian Diniyah"
    },
    {
        file: "santriwati-membaca-kitab-di-kelas.jpeg",
        title: "Kegiatan Belajar Madrasah Diniyah Santriwati di Kelas",
        category: "kajian",
        categoryLabel: "Kajian Diniyah"
    },
    {
        file: "santriwati-menulis-catatan-kelas.jpeg",
        title: "Ketekunan Santriwati Mencatat Pelajaran Diniyah",
        category: "kajian",
        categoryLabel: "Kajian Diniyah"
    },
    {
        file: "kegiatan-belajar-kelas-tahfidz-sekat-putra-putri.jpeg",
        title: "Suasana Belajar Kondusif dengan Hijab Pemisah Putra-Putri",
        category: "kajian",
        categoryLabel: "Kajian Diniyah"
    },
    {
        file: "suasana-kelas-santri-putra-putri-terpisah.jpeg",
        title: "Ketertiban Belajar Kelas Tahfizh & Diniyah",
        category: "kajian",
        categoryLabel: "Kajian Diniyah"
    },
    {
        file: "santri-cilik-menyimak-pengajian-1.jpeg",
        title: "Santri Usia Dini Antusias Menyimak Pengajian Al-Qur'an",
        category: "kajian",
        categoryLabel: "Pembinaan Usia Dini"
    },
    {
        file: "pembelajaran-komputer-santri-anak.jpeg",
        title: "Pengenalan Komputer Sejak Dini bagi Santri Anak",
        category: "digital",
        categoryLabel: "Komputer & Digital"
    },
    {
        file: "pendampingan-belajar-laptop-oleh-ustadz.jpeg",
        title: "Pendampingan Intensif Praktik Laptop oleh Ustadz",
        category: "digital",
        categoryLabel: "Komputer & Digital"
    },
    {
        file: "ekstrakurikuler-hadroh-rebana-santriwati.jpeg",
        title: "Ekstrakurikuler Seni Rebana & Sholawat Santriwati",
        category: "ekskul",
        categoryLabel: "Ekstrakurikuler"
    },
    {
        file: "latihan-rebana-santriwati-bimbingan-ustadz.jpeg",
        title: "Latihan Rutin Hadroh & Vokal Qasidah Bersama Pembina",
        category: "ekskul",
        categoryLabel: "Ekstrakurikuler"
    },
    {
        file: "santriwati-bershalawat-qasidah-aula.jpeg",
        title: "Lantunan Sholawat & Qasidah Santriwati di Aula Pondok",
        category: "ekskul",
        categoryLabel: "Ekstrakurikuler"
    },
    {
        file: "peringatan-maulid-nabi-ponpes-zadil-quran.jpeg",
        title: "Peringatan Maulid Nabi Muhammad SAW di PPTQ Zadil Qur'an",
        category: "ekskul",
        categoryLabel: "Hari Besar Islam"
    },
    {
        file: "acara-tasyakuran-dan-doa-bersama-santriwati.jpeg",
        title: "Tasyakuran & Doa Bersama Keluarga Besar Santri",
        category: "ekskul",
        categoryLabel: "Kegiatan Asrama"
    }
];

let currentGalleryCategory = 'all';
let isGalleryExpanded = false;

function renderLandingGallery() {
    const grid = document.getElementById('landingGalleryGrid');
    const carousel = document.getElementById('landingGalleryCarousel');
    const toggleWrap = document.getElementById('landingGalleryToggleWrap');
    const toggleText = document.getElementById('btnToggleGalleryText');
    if (!grid && !carousel) return;

    const filtered = currentGalleryCategory === 'all'
        ? LANDING_GALLERY_ITEMS
        : LANDING_GALLERY_ITEMS.filter(item => item.category === currentGalleryCategory);

    const defaultLimit = 8;
    const itemsToShow = (currentGalleryCategory === 'all' && !isGalleryExpanded)
        ? filtered.slice(0, defaultLimit)
        : filtered;

    if (toggleWrap) {
        if (currentGalleryCategory === 'all' && filtered.length > defaultLimit) {
            toggleWrap.classList.remove('hidden');
            if (toggleText) {
                toggleText.textContent = isGalleryExpanded
                    ? 'Tampilkan Lebih Ringkas (8 Foto Utama)'
                    : `Lihat Seluruh ${filtered.length} Foto Kegiatan Santri`;
            }
        } else {
            toggleWrap.classList.add('hidden');
        }
    }

    // 1. Render Desktop Grid (Ukuran seragam tanpa kotak teks di bawah, judul muncul saat hover & preview Lightbox)
    if (grid) {
        grid.innerHTML = itemsToShow.map((item, idx) => {
            const imgUrl = `aset%20grafis/${encodeURIComponent(item.file)}`;
            return `
                <div onclick="openGalleryLightbox('${imgUrl}', '${item.title.replace(/'/g, "\\'")}', '${item.categoryLabel}')" class="group cursor-pointer relative h-56 sm:h-60 rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-800 border border-gray-200/80 dark:border-darkborder shadow-xs hover:shadow-xl transition duration-300" title="${item.title}">
                    <img src="${imgUrl}" alt="${item.title}" loading="lazy" decoding="async" class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500">
                    <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/65 text-white backdrop-blur-xs z-10">
                        ${item.categoryLabel}
                    </span>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                        <div class="flex items-center justify-between gap-2">
                            <p class="text-xs font-bold text-white leading-snug line-clamp-2">${item.title}</p>
                            <span class="w-8 h-8 rounded-full bg-white/95 text-gray-900 flex items-center justify-center shrink-0 shadow-md">
                                <i class="fa-solid fa-magnifying-glass-plus text-xs"></i>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. Render Mobile Carousel (Ukuran foto seragam, judul muncul saat diklik di preview Lightbox)
    if (carousel) {
        carousel.innerHTML = itemsToShow.map((item, idx) => {
            const imgUrl = `aset%20grafis/${encodeURIComponent(item.file)}`;
            return `
                <div onclick="openGalleryLightbox('${imgUrl}', '${item.title.replace(/'/g, "\\'")}', '${item.categoryLabel}')" class="w-[78vw] max-w-[290px] h-52 flex-shrink-0 snap-center group cursor-pointer relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-800 border border-gray-200/90 dark:border-darkborder shadow-sm active:scale-98 transition">
                    <img src="${imgUrl}" alt="${item.title}" loading="lazy" decoding="async" class="w-full h-full object-cover object-center">
                    <span class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-xs">
                        ${item.categoryLabel}
                    </span>
                    <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-gray-800 dark:text-white flex items-center gap-1.5 shadow-sm text-[10px] font-bold">
                        <i class="fa-solid fa-magnifying-glass-plus text-[#9a2024]"></i>
                        <span>Preview</span>
                    </div>
                </div>
            `;
        }).join('');
        updateCarouselIndicator();
    }
}

function scrollGalleryCarousel(direction) {
    const carousel = document.getElementById('landingGalleryCarousel');
    if (!carousel) return;
    const card = carousel.firstElementChild;
    const scrollAmount = card ? (card.offsetWidth + 14) : 260;
    carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    setTimeout(updateCarouselIndicator, 320);
}

function updateCarouselIndicator() {
    const carousel = document.getElementById('landingGalleryCarousel');
    const indicator = document.getElementById('carouselSlideIndicator');
    if (!carousel || !indicator) return;
    const total = carousel.children.length;
    if (total === 0) {
        indicator.textContent = '0 Foto';
        return;
    }
    const card = carousel.firstElementChild;
    const cardWidth = card ? (card.offsetWidth + 14) : 260;
    const current = Math.min(total, Math.max(1, Math.round(carousel.scrollLeft / cardWidth) + 1));
    indicator.textContent = `${current} dari ${total} Foto`;
}

function filterLandingGallery(category) {
    currentGalleryCategory = category;
    ['all', 'tahfidz', 'kajian', 'digital', 'ekskul'].forEach(cat => {
        const btn = document.getElementById('galBtn-' + cat);
        if (!btn) return;
        if (cat === category) {
            btn.className = "px-4 py-2 rounded-xl text-xs font-bold bg-[#9a2024] text-white shadow-xs transition";
        } else {
            btn.className = "px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition";
        }
    });
    renderLandingGallery();
}

function toggleLandingGalleryExpand() {
    isGalleryExpanded = !isGalleryExpanded;
    renderLandingGallery();
}

function openGalleryLightbox(imgUrl, title, categoryLabel) {
    const modal = document.getElementById('galleryLightboxModal');
    const imgEl = document.getElementById('lightboxImage');
    const titleEl = document.getElementById('lightboxTitle');
    const badgeEl = document.getElementById('lightboxCategoryBadge');
    if (!modal || !imgEl) return;

    imgEl.src = imgUrl;
    if (titleEl) titleEl.textContent = title || 'Dokumentasi Kegiatan Santri';
    if (badgeEl) badgeEl.textContent = categoryLabel || 'Galeri Pesantren';
    modal.classList.remove('hidden');
}

function closeGalleryLightbox(event) {
    const modal = document.getElementById('galleryLightboxModal');
    if (modal) modal.classList.add('hidden');
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

            const curConfig = getLocalPsbConfig();
            const curSubtotal = (curConfig.biayaFasilitas || []).reduce((s, b) => s + (Number(b.nominal) || 0), 0) || 1800000;
            const curSpp = Number(curConfig.sppBulanan) || 200000;

            Swal.fire({
                icon: 'success',
                title: 'Pendaftaran Berhasil Tercatat!',
                html: `
                    <div class="text-left text-sm space-y-3 mt-2">
                        <p class="text-gray-600 dark:text-gray-300">Alhamdulillah, data ananda <b>${payload.namaSantri}</b> telah tersimpan otomatis di Buku Induk & Sistem Keuangan Pesantren.</p>
                        <div class="bg-[#fdf2f2] dark:bg-[#731417]/30 border border-[#f5d0d1] dark:border-[#9a2024]/50 rounded-2xl p-4 text-center">
                            <span class="text-[11px] font-bold uppercase tracking-wider text-[#9a2024] dark:text-[#f29fa3] block mb-1">Kode ID Santri Anda (Simpan untuk Login):</span>
                            <div class="font-mono text-2xl font-extrabold text-[#9a2024] dark:text-white tracking-wider">${idZq}</div>
                            <p class="text-[11px] text-gray-500 mt-1">Gunakan kode di atas untuk masuk ke <b>Portal Wali Santri</b> (Cek Hafalan, Tagihan SPP ${formatRupiah(curSpp)} & Biaya Masuk ${formatRupiah(curSubtotal)}).</p>
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
    renderLandingGallery();
    loadPsbOnlineConfig();
});

