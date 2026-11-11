/**
 * ============================================================================
 * ZADIL QURAN - CORE MODULE (js/core.js)
 * Berisi: AppNotify, apiCall, Session/Auth Helper, Format Rupiah & WA,
 * Dark Mode, Modal Helper, Branding, serta PWA Installer.
 * ============================================================================
 */

// ==================== SISTEM NOTIFIKASI MODERN (ANTI-ALERT BAWAAN) ====================
const AppNotify = {
    // Mendukung pemanggilan AppNotify.toast('success', 'Pesan') maupun AppNotify.toast('Pesan', 'success')
    toast(arg1, arg2 = 'info', duration = 3000) {
        const knownTypes = ['success', 'danger', 'error', 'warning', 'info'];
        let type = 'info';
        let message = arg1;
        if (knownTypes.includes(String(arg1).toLowerCase()) && arg2 && !knownTypes.includes(String(arg2).toLowerCase())) {
            type = String(arg1).toLowerCase();
            message = arg2;
        } else {
            message = arg1;
            type = knownTypes.includes(String(arg2).toLowerCase()) ? String(arg2).toLowerCase() : 'info';
        }

        let container = document.getElementById('zq-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'zq-toast-container';
            container.className = 'zq-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `zq-toast zq-toast-${type}`;

        let iconHtml = '';
        if (type === 'success') {
            iconHtml = '<i class="fa-solid fa-circle-check text-[#1c6b45]"></i>';
        } else if (type === 'danger' || type === 'error') {
            iconHtml = '<i class="fa-solid fa-circle-xmark text-red-500"></i>';
        } else if (type === 'warning') {
            iconHtml = '<i class="fa-solid fa-triangle-exclamation text-amber-500"></i>';
        } else {
            iconHtml = '<i class="fa-solid fa-circle-info text-[#9a2024]"></i>';
        }

        toast.innerHTML = `
            <div class="zq-toast-icon">${iconHtml}</div>
            <div class="zq-toast-message">${message}</div>
            <button class="zq-toast-close" aria-label="Tutup">&times;</button>
        `;

        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        const dismiss = () => {
            toast.classList.remove('show');
            setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 250);
        };

        toast.querySelector('.zq-toast-close').addEventListener('click', dismiss);
        if (duration > 0) setTimeout(dismiss, duration);
    },

    success(title, textOrHtml, timer = 2500) {
        const isHtml = textOrHtml && textOrHtml.includes('<');
        return Swal.fire({
            icon: 'success',
            title: title,
            [isHtml ? 'html' : 'text']: textOrHtml || '',
            confirmButtonText: 'Selesai',
            timer: timer > 0 ? timer : undefined,
            timerProgressBar: timer > 0,
            customClass: {
                popup: 'zq-swal-popup',
                title: 'zq-swal-title',
                htmlContainer: 'zq-swal-html',
                confirmButton: 'zq-swal-btn-primary'
            },
            buttonsStyling: false
        });
    },

    error(title, textOrHtml) {
        const isHtml = textOrHtml && textOrHtml.includes('<');
        return Swal.fire({
            icon: 'error',
            title: title,
            [isHtml ? 'html' : 'text']: textOrHtml || '',
            confirmButtonText: 'Tutup',
            customClass: {
                popup: 'zq-swal-popup',
                title: 'zq-swal-title',
                htmlContainer: 'zq-swal-html',
                confirmButton: 'zq-swal-btn-danger'
            },
            buttonsStyling: false
        });
    },

    warning(title, textOrHtml) {
        const isHtml = textOrHtml && textOrHtml.includes('<');
        return Swal.fire({
            icon: 'warning',
            title: title,
            [isHtml ? 'html' : 'text']: textOrHtml || '',
            confirmButtonText: 'Mengerti',
            customClass: {
                popup: 'zq-swal-popup',
                title: 'zq-swal-title',
                htmlContainer: 'zq-swal-html',
                confirmButton: 'zq-swal-btn-primary'
            },
            buttonsStyling: false
        });
    },

    info(title, textOrHtml) {
        const isHtml = textOrHtml && textOrHtml.includes('<');
        return Swal.fire({
            icon: 'info',
            title: title,
            [isHtml ? 'html' : 'text']: textOrHtml || '',
            confirmButtonText: 'Baik',
            customClass: {
                popup: 'zq-swal-popup',
                title: 'zq-swal-title',
                htmlContainer: 'zq-swal-html',
                confirmButton: 'zq-swal-btn-primary'
            },
            buttonsStyling: false
        });
    },

    async confirm(title, textOrHtml, confirmBtnText = 'Ya, Lanjutkan', cancelBtnText = 'Batal') {
        const isHtml = textOrHtml && textOrHtml.includes('<');
        const res = await Swal.fire({
            icon: 'question',
            title: title,
            [isHtml ? 'html' : 'text']: textOrHtml || '',
            showCancelButton: true,
            confirmButtonText: confirmBtnText,
            cancelButtonText: cancelBtnText,
            reverseButtons: true,
            customClass: {
                popup: 'zq-swal-popup',
                title: 'zq-swal-title',
                htmlContainer: 'zq-swal-html',
                confirmButton: 'zq-swal-btn-primary',
                cancelButton: 'zq-swal-btn-secondary'
            },
            buttonsStyling: false
        });
        return res.isConfirmed;
    },

    loading(title = 'Memproses...', text = '') {
        Swal.fire({
            title: title,
            text: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                popup: 'zq-swal-popup',
                title: 'zq-swal-title',
                htmlContainer: 'zq-swal-html'
            },
            didOpen: () => Swal.showLoading()
        });
    },

    close() {
        Swal.close();
    }
};

if (typeof window !== 'undefined') {
    window.alert = function(msg) {
        AppNotify.info('Pemberitahuan', msg);
    };
}

// ==================== API WRAPPER MULTI-ENVIRONMENT ====================
async function apiCall(method, ...args) {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler(res => resolve(res))
                .withFailureHandler(err => reject(err))
                [method](...args);
        });
    }

    const apiUrl = getApiUrl();
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
                action: method,
                args: args
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (err) {
        console.error('API Call Error:', err);
        AppNotify.error('Koneksi Backend Terkendala', `<div class="text-left text-sm space-y-2">
            <p>Gagal menghubungi backend Google Apps Script: <b>${err.message}</b></p>
            <p class="text-xs text-gray-500">Pastikan backend Google Apps Script sudah di-deploy sebagai Web App dan APPS_SCRIPT_URL di file _worker.js sudah terisi dengan benar.</p>
        </div>`);
        throw err;
    }
}

// ==================== FORMATTERS & HELPERS ====================

/**
 * Pertahanan Cross-Site Scripting (XSS / A05: Injection)
 * Mengenkripsi karakter khusus HTML sebelum dirender ke innerHTML
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatRupiah(angka) {
    if (typeof angka === 'number') {
        return "Rp " + Math.round(angka).toLocaleString('id-ID');
    }
    const cleanStr = String(angka || 0).trim();
    const digitsOnly = cleanStr.replace(/[^0-9-]/g, "");
    const num = Number(digitsOnly) || 0;
    return "Rp " + num.toLocaleString('id-ID');
}

/**
 * Konversi angka nominal ke kalimat terbilang Bahasa Indonesia
 */
function angkaKeTerbilang(nilai) {
    const n = Math.abs(Math.floor(Number(nilai) || 0));
    if (n === 0) return 'Nol Rupiah';

    const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

    function terbilangBagi(x) {
        if (x < 12) return satuan[x];
        if (x < 20) return terbilangBagi(x - 10) + ' Belas';
        if (x < 100) return terbilangBagi(Math.floor(x / 10)) + ' Puluh ' + terbilangBagi(x % 10);
        if (x < 200) return 'Seratus ' + terbilangBagi(x - 100);
        if (x < 1000) return terbilangBagi(Math.floor(x / 100)) + ' Ratus ' + terbilangBagi(x % 100);
        if (x < 2000) return 'Seribu ' + terbilangBagi(x - 1000);
        if (x < 1000000) return terbilangBagi(Math.floor(x / 1000)) + ' Ribu ' + terbilangBagi(x % 1000);
        if (x < 1000000000) return terbilangBagi(Math.floor(x / 1000000)) + ' Juta ' + terbilangBagi(x % 1000000);
        if (x < 1000000000000) return terbilangBagi(Math.floor(x / 1000000000)) + ' Miliar ' + terbilangBagi(x % 1000000000);
        return '';
    }

    return (terbilangBagi(n).trim().replace(/\s+/g, ' ') + ' Rupiah');
}

/**
 * Generator Kwitansi Pembayaran Resmi (PDF / Printable View)
 * Menampilkan dokumen kwitansi standar profesional lengkap dengan Kop Lembaga,
 * Nomor Kwitansi, Terbilang, Rincian, dan Stempel/Paraf Bendahara.
 */
function cetakKwitansiResmi(tagihan, santri) {
    if (!tagihan) {
        AppNotify.toast('Data tagihan tidak ditemukan', 'warning');
        return;
    }

    const s = santri || {};
    const noKwitansi = `KW-${tagihan.ID_Tagihan || Date.now()}`;
    const tglCetak = tagihan.Tgl_Bayar || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const nominal = Number(tagihan.Nominal) || 0;
    const terbilangStr = angkaKeTerbilang(nominal);

    const printHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kwitansi Pembayaran - ${noKwitansi}</title>
    <style>
        @page {
            size: A5 landscape;
            margin: 12mm 15mm;
        }
        * {
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            color: #222;
        }
        body {
            background-color: #fff;
            margin: 0;
            padding: 10px;
        }
        .kwitansi-wrapper {
            border: 2px solid #731417;
            padding: 20px 24px;
            position: relative;
            background: #fff;
            max-width: 820px;
            margin: 0 auto;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 72px;
            font-weight: 900;
            color: rgba(28, 107, 69, 0.08);
            letter-spacing: 6px;
            pointer-events: none;
            user-select: none;
            text-transform: uppercase;
        }
        .header-kop {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #9a2024;
            padding-bottom: 12px;
            margin-bottom: 14px;
        }
        .kop-left {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .kop-logo {
            width: 58px;
            height: 58px;
            border-radius: 8px;
            border: 1px solid #ddd;
            object-fit: cover;
        }
        .kop-text h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 800;
            color: #731417;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .kop-text p {
            margin: 2px 0 0;
            font-size: 10.5px;
            color: #555;
            line-height: 1.35;
        }
        .kop-right {
            text-align: right;
        }
        .kop-badge {
            display: inline-block;
            background: #edf7f2;
            color: #1c6b45;
            border: 1px solid #b2dfc8;
            font-size: 10px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .kop-no {
            font-size: 11px;
            font-family: monospace;
            color: #444;
            margin-top: 4px;
            font-weight: bold;
        }
        .title-bar {
            text-align: center;
            margin-bottom: 14px;
        }
        .title-bar h1 {
            display: inline-block;
            margin: 0;
            font-size: 15px;
            font-weight: 800;
            color: #111;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1.5px solid #111;
            padding-bottom: 2px;
        }
        .content-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 14px;
        }
        .content-table td {
            padding: 5px 4px;
            vertical-align: top;
        }
        .content-table td.col-label {
            width: 26%;
            color: #444;
            font-weight: 600;
        }
        .content-table td.col-colon {
            width: 3%;
            text-align: center;
            font-weight: bold;
        }
        .content-table td.col-val {
            width: 71%;
            color: #111;
            font-weight: 500;
        }
        .terbilang-box {
            background-color: #faf5f5;
            border-left: 3px solid #9a2024;
            padding: 6px 10px;
            font-style: italic;
            font-weight: 600;
            color: #731417;
            font-size: 11.5px;
            border-radius: 0 4px 4px 0;
        }
        .footer-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 10px;
            padding-top: 10px;
        }
        .nominal-badge {
            border: 2px dashed #1c6b45;
            background: #edf7f2;
            padding: 8px 16px;
            border-radius: 8px;
            display: inline-block;
        }
        .nominal-badge .lbl {
            font-size: 9.5px;
            text-transform: uppercase;
            font-weight: 700;
            color: #1c6b45;
            letter-spacing: 0.5px;
        }
        .nominal-badge .val {
            font-size: 19px;
            font-weight: 900;
            color: #12452c;
            font-family: monospace;
            margin-top: 2px;
        }
        .ttd-box {
            text-align: center;
            width: 220px;
        }
        .ttd-box .tgl {
            font-size: 11px;
            color: #444;
            margin-bottom: 6px;
        }
        .ttd-box .role {
            font-size: 11px;
            font-weight: 600;
            color: #333;
        }
        .ttd-space {
            height: 48px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .stempel-lunas {
            display: inline-block;
            border: 2px solid #1c6b45;
            color: #1c6b45;
            font-size: 12px;
            font-weight: 800;
            padding: 3px 12px;
            border-radius: 4px;
            transform: rotate(-7deg);
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .ttd-name {
            font-size: 11.5px;
            font-weight: 700;
            border-bottom: 1px solid #333;
            display: inline-block;
            padding-bottom: 2px;
            color: #111;
        }
        .action-bar {
            text-align: center;
            margin-top: 18px;
        }
        .btn-print {
            background: #9a2024;
            color: #fff;
            border: none;
            padding: 9px 20px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .btn-print:hover {
            background: #731417;
        }
        @media print {
            body {
                padding: 0;
            }
            .kwitansi-wrapper {
                border-width: 1.5px;
            }
            .action-bar {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="kwitansi-wrapper">
        <div class="watermark">LUNAS</div>

        <!-- Kop Lembaga -->
        <div class="header-kop">
            <div class="kop-left">
                <img src="${window.location.origin}/logo.jpg" alt="Logo" class="kop-logo" onerror="this.style.display='none'">
                <div class="kop-text">
                    <h2>Pondok Pesantren Tahfizh Zadil Qur'an</h2>
                    <p>
                        Akta Notaris Muntafiah, S.H., M.Kn &bull; AHU-0023909.AH.01.12. Tahun 2020<br>
                        Jl. Raya Penambangan, Ds. Penambangan, Kec. Semanding, Kab. Tuban, Jatim (62381)
                    </p>
                </div>
            </div>
            <div class="kop-right">
                <span class="kop-badge">Bukti Pembayaran Sah</span>
                <div class="kop-no">${noKwitansi}</div>
            </div>
        </div>

        <div class="title-bar">
            <h1>Kwitansi Pembayaran</h1>
        </div>

        <!-- Rincian Kwitansi -->
        <table class="content-table">
            <tr>
                <td class="col-label">Telah Terima Dari</td>
                <td class="col-colon">:</td>
                <td class="col-val"><strong>${s.Nama_Wali || s.Nama_Ayah || 'Orang Tua / Wali Santri'}</strong></td>
            </tr>
            <tr>
                <td class="col-label">Nama Santri (ID)</td>
                <td class="col-colon">:</td>
                <td class="col-val">${s.Nama_Santri || '-'} <strong>(${tagihan.ID_Santri || '-'})</strong></td>
            </tr>
            <tr>
                <td class="col-label">Uang Sejumlah</td>
                <td class="col-colon">:</td>
                <td class="col-val">
                    <div class="terbilang-box"># ${terbilangStr} #</div>
                </td>
            </tr>
            <tr>
                <td class="col-label">Untuk Pembayaran</td>
                <td class="col-colon">:</td>
                <td class="col-val"><strong>${tagihan.Judul_Tagihan}</strong> [${tagihan.Kategori || 'Syahriyah'}]</td>
            </tr>
            <tr>
                <td class="col-label">Metode Pembayaran</td>
                <td class="col-colon">:</td>
                <td class="col-val">${tagihan.Metode_Bayar || 'Tunai / Kas Pondok'} ${tagihan.Catatan ? '&bull; <em>(' + tagihan.Catatan + ')</em>' : ''}</td>
            </tr>
        </table>

        <!-- Footer Nominal & Tanda Tangan -->
        <div class="footer-row">
            <div class="nominal-badge">
                <div class="lbl">Jumlah Pembayaran</div>
                <div class="val">${formatRupiah(nominal)}</div>
            </div>

            <div class="ttd-box">
                <div class="tgl">Tuban, ${tglCetak}</div>
                <div class="role">Bendahara Pesantren</div>
                <div class="ttd-space">
                    <span class="stempel-lunas">&bull; LUNAS &bull;</span>
                </div>
                <div class="ttd-name">Admin Keuangan PPTQ</div>
            </div>
        </div>
    </div>

    <div class="action-bar">
        <button onclick="window.print()" class="btn-print">&#128438; Cetak / Simpan sebagai PDF</button>
    </div>

    <script>
        // Otomatis memicu dialog print/PDF setelah dokumen siap
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 400);
        };
    </script>
</body>
</html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
        printWin.document.open();
        printWin.document.write(printHtml);
        printWin.document.close();
    } else {
        AppNotify.toast('Pop-up terblokir. Izinkan pop-up peramban untuk mengunduh kwitansi PDF.', 'warning');
    }
}

// ==================== RUBRIK & GENERATOR KARTU PENILAIAN TASMI' ====================
const TASMI_PASSING_SCORE = 80;
const TASMI_VALID_SCORES = [5, 4, 3, 2];
const TASMI_VALID_GRADES = ['A', 'B', 'C', 'D'];

const TASMI_SCORE_LEGEND = {
    5: 'Hafalan lancar tidak mengingatkan sama sekali',
    4: 'Hafalan diingatkan 1 sampai 5 kali',
    3: 'Hafalan diingatkan 6 sampai 10 kali',
    2: 'Diingatkan 11 kali lebih sampai menuntun'
};

const TASMI_TAJWID_ASPEK = [
    { key: 'makharijul_huruf', label: 'Praktik Makharijul Huruf' },
    { key: 'sifatul_huruf', label: 'Praktik Sifatul Huruf' },
    { key: 'nun_sukun_tanwin', label: 'Praktik Hukum Nun Sukun dan Tanwin' },
    { key: 'mim_mati', label: 'Praktik Mim Mati' },
    { key: 'hukum_mad', label: 'Praktik Hukum Mad' },
    { key: 'qalqalah', label: 'Praktik Qalqalah' },
    { key: 'ghunnah', label: 'Praktik Ghunnah' },
    { key: 'tafkhim_tarqiq', label: 'Praktik Tafkhim dan Tarqiq' },
    { key: 'waqaf_ibtida', label: "Praktik Waqaf dan Ibtida'" }
];

/**
 * Mengembalikan konfigurasi struktur halaman per Juz.
 * Khusus Juz 30 terdiri atas 23 halaman dengan pembagian 6, 6, 6, 5.
 * Juz 1-29 terdiri atas 20 halaman dengan pembagian 5, 5, 5, 5.
 */
function getTasmiConfigByJuz(juz) {
    const cleanJuz = String(juz || '').trim();
    if (cleanJuz === '30') {
        return {
            juz: '30',
            totalPages: 23,
            maxScore: 115,
            blocks: [
                { title: 'Halaman 1 – 6', start: 1, end: 6 },
                { title: 'Halaman 7 – 12', start: 7, end: 12 },
                { title: 'Halaman 13 – 18', start: 13, end: 18 },
                { title: 'Halaman 19 – 23', start: 19, end: 23 }
            ]
        };
    }
    return {
        juz: cleanJuz || '1',
        totalPages: 20,
        maxScore: 100,
        blocks: [
            { title: 'Halaman 1 – 5', start: 1, end: 5 },
            { title: 'Halaman 6 – 10', start: 6, end: 10 },
            { title: 'Halaman 11 – 15', start: 11, end: 15 },
            { title: 'Halaman 16 – 20', start: 16, end: 20 }
        ]
    };
}

/**
 * Menghitung total skor dan status kelulusan Penilaian Tasmi' 1 Juz.
 * Khusus Juz 30 memiliki 23 halaman (maks 115), Juz 1-29 memiliki 20 halaman (maks 100).
 * Kelulusan ditentukan murni dari Total Skor Mentah >= 80 (Opsi A).
 */
function hitungHasilTasmi(skorHalaman, juz = '1') {
    const map = skorHalaman || {};
    const cfg = getTasmiConfigByJuz(juz);
    let totalSkor = 0;
    let filledCount = 0;
    const missingPages = [];
    const invalidPages = [];
    const sanitizedScores = {};

    for (let p = 1; p <= cfg.totalPages; p++) {
        const rawVal = map[p] !== undefined ? map[p] : map[String(p)];
        if (rawVal === undefined || rawVal === null || rawVal === '') {
            missingPages.push(p);
            continue;
        }
        const num = Number(rawVal);
        if (!TASMI_VALID_SCORES.includes(num)) {
            invalidPages.push(p);
            continue;
        }
        sanitizedScores[p] = num;
        totalSkor += num;
        filledCount++;
    }

    const isComplete = filledCount === cfg.totalPages && invalidPages.length === 0;
    const lulus = isComplete && totalSkor >= TASMI_PASSING_SCORE;

    return {
        juz: cfg.juz,
        totalPages: cfg.totalPages,
        blocks: cfg.blocks,
        skorPerHalaman: sanitizedScores,
        totalSkor,
        maksimalSkor: cfg.maxScore,
        passingScore: TASMI_PASSING_SCORE,
        filledCount,
        isComplete,
        lulus,
        status: isComplete ? (lulus ? 'LULUS' : 'TIDAK LULUS') : 'BELUM LENGKAP',
        missingPages,
        invalidPages
    };
}

/**
 * Memvalidasi kelengkapan nilai huruf (A/B/C/D) pada 9 aspek Praktik Tajwid.
 */
function validasiTajwidTasmi(tajwidObj) {
    const input = tajwidObj || {};
    const sanitized = {};
    const missingKeys = [];

    TASMI_TAJWID_ASPEK.forEach(item => {
        const val = String(input[item.key] || '').trim().toUpperCase();
        if (TASMI_VALID_GRADES.includes(val)) {
            sanitized[item.key] = val;
        } else {
            missingKeys.push(item.key);
        }
    });

    return {
        isValid: missingKeys.length === 0,
        tajwid: sanitized,
        missingKeys
    };
}

/**
 * Mem-parse kolom Detail_Tasmi (string JSON atau object) secara aman.
 */
function parseDetailTasmi(raw) {
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    try {
        const parsed = JSON.parse(String(raw));
        return (parsed && typeof parsed === 'object') ? parsed : null;
    } catch (e) {
        return null;
    }
}

/**
 * Menampilkan popup rincian skor halaman & 9 aspek Tajwid untuk catatan Penilaian Tasmi'.
 */
function tampilkanDetailTasmiModal(setoran, santri, pengujiName) {
    if (!setoran) return;
    const detail = parseDetailTasmi(setoran.Detail_Tasmi);
    if (!detail) {
        AppNotify.info('Rincian Penilaian Tasmi\'', 'Catatan Tasmi\' ini belum memiliki rincian tabel skor per halaman.');
        return;
    }

    const s = santri || {};
    const juzTarget = detail.juz || setoran.Juz || '1';
    const hasil = hitungHasilTasmi(detail.skorPerHalaman || {}, juzTarget);
    const total = detail.totalSkor !== undefined ? Number(detail.totalSkor) : hasil.totalSkor;
    const maxScore = detail.maksimalSkor !== undefined ? Number(detail.maksimalSkor) : hasil.maksimalSkor;
    const isLulus = detail.statusKelulusan ? detail.statusKelulusan === 'LULUS' : total >= TASMI_PASSING_SCORE;
    const tajwid = detail.tajwid || {};
    const penguji = pengujiName || setoran.ParafUstadz || 'Ustadz Penguji';

    const tableColsHtml = hasil.blocks.map(blk => {
        let rows = '';
        let sub = 0;
        for (let p = blk.start; p <= blk.end; p++) {
            const sc = detail.skorPerHalaman ? (detail.skorPerHalaman[p] ?? detail.skorPerHalaman[String(p)] ?? '-') : '-';
            if (typeof sc === 'number' || (!isNaN(Number(sc)) && sc !== '-')) sub += Number(sc);
            const badgeColor = Number(sc) === 5 ? 'text-[#1c6b45] bg-[#edf7f2]'
                : Number(sc) === 4 ? 'text-blue-700 bg-blue-50'
                : Number(sc) === 3 ? 'text-amber-700 bg-amber-50'
                : Number(sc) === 2 ? 'text-red-700 bg-red-50'
                : 'text-gray-500 bg-gray-100';
            rows += `
                <tr class="border-b border-gray-100">
                    <td class="py-1 px-2 text-center font-semibold text-gray-600">${p}</td>
                    <td class="py-1 px-2 text-center"><span class="inline-block min-w-[24px] py-0.5 px-1.5 rounded font-bold ${badgeColor}">${escapeHtml(sc)}</span></td>
                </tr>
            `;
        }
        return `
            <div class="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table class="w-full text-xs">
                    <thead class="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                        <tr><th class="py-1.5 px-2">HAL</th><th class="py-1.5 px-2">SKOR</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                    <tfoot class="bg-gray-50 border-t border-gray-200 font-bold text-gray-700">
                        <tr><td class="py-1 px-2 text-center">Sub</td><td class="py-1 px-2 text-center">${sub}</td></tr>
                    </tfoot>
                </table>
            </div>
        `;
    }).join('');

    const tajwidRowsHtml = TASMI_TAJWID_ASPEK.map((asp, i) => {
        const grade = String(tajwid[asp.key] || '-').toUpperCase();
        const gradeBadge = grade === 'A' ? 'bg-[#1c6b45] text-white'
            : grade === 'B' ? 'bg-blue-600 text-white'
            : grade === 'C' ? 'bg-amber-500 text-white'
            : grade === 'D' ? 'bg-red-600 text-white'
            : 'bg-gray-200 text-gray-600';
        return `
            <div class="flex items-center justify-between py-1.5 px-2.5 border-b border-gray-100 last:border-none text-xs">
                <span class="text-gray-700 font-medium">${i + 1}. ${escapeHtml(asp.label)}</span>
                <span class="px-2 py-0.5 rounded font-bold text-[11px] ${gradeBadge}">${escapeHtml(grade)}</span>
            </div>
        `;
    }).join('');

    const statusBadge = isLulus
        ? '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf7f2] text-[#1c6b45] border border-[#b2dfc8] font-extrabold text-xs">✅ LULUS TASMI\'</span>'
        : '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-extrabold text-xs">🔁 TIDAK LULUS (Wajib Mengulang)</span>';

    const htmlBody = `
        <div class="text-left space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-3">
                <div>
                    <div class="text-[11px] text-gray-500 font-semibold">Santri: <strong class="text-gray-900">${escapeHtml(s.Nama_Santri || setoran.ID_Santri)}</strong> &bull; Juz ${escapeHtml(juzTarget)} (${hasil.totalPages} Hal)</div>
                    <div class="text-[11px] text-gray-500 mt-0.5">Penguji: <strong class="text-gray-800">${escapeHtml(penguji)}</strong> &bull; ${escapeHtml(setoran.Tanggal || '-')}</div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-black ${isLulus ? 'text-[#1c6b45]' : 'text-red-600'}">Total Skor: ${total} / ${maxScore}</div>
                    <div class="mt-0.5">${statusBadge}</div>
                </div>
            </div>

            <div>
                <div class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">1. Tabel Penilaian Kelancaran (Minimal Lulus: 80)</div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">${tableColsHtml}</div>
                <div class="text-[10px] text-gray-500 mt-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <strong>Ketentuan:</strong> 5 = Lancar &bull; 4 = Diingatkan 1–5x &bull; 3 = Diingatkan 6–10x &bull; 2 = Diingatkan &gt;11x
                </div>
            </div>

            <div>
                <div class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">2. Penilaian Praktik Tajwid (A / B / C / D)</div>
                <div class="border border-gray-200 rounded-xl bg-white overflow-hidden">${tajwidRowsHtml}</div>
            </div>

            ${setoran.Catatan ? `
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900">
                <strong>Catatan Penguji:</strong> <em>"${escapeHtml(setoran.Catatan)}"</em>
            </div>` : ''}
        </div>
    `;

    Swal.fire({
        title: `Hasil Penilaian Tasmi' Juz ${escapeHtml(juzTarget)}`,
        html: htmlBody,
        width: '720px',
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-print mr-1.5"></i> Cetak / Unduh Kartu Tasmi\' (PDF)',
        cancelButtonText: 'Tutup',
        customClass: {
            popup: 'zq-swal-popup',
            title: 'zq-swal-title',
            htmlContainer: 'zq-swal-html',
            confirmButton: 'zq-swal-btn-primary',
            cancelButton: 'zq-swal-btn-secondary'
        },
        buttonsStyling: false
    }).then(res => {
        if (res.isConfirmed) {
            cetakKartuTasmiResmi(setoran, santri, pengujiName);
        }
    });
}

/**
 * Generator Kartu Hasil Penilaian Tasmi' Resmi PPTQ Zadil Qur'an Tuban (PDF / Print)
 * Mendukung Juz 1-29 (20 halaman: 5,5,5,5) dan Juz 30 (23 halaman: 6,6,6,5). Batas kelulusan >= 80.
 */
function cetakKartuTasmiResmi(setoran, santri, pengujiName) {
    if (!setoran) {
        AppNotify.toast('Data setoran Tasmi\' tidak ditemukan', 'warning');
        return;
    }

    const detail = parseDetailTasmi(setoran.Detail_Tasmi);
    if (!detail) {
        AppNotify.toast('Catatan Tasmi\' ini belum memiliki rincian kartu penilaian.', 'warning');
        return;
    }

    const s = santri || {};
    const juzTarget = detail.juz || setoran.Juz || '1';
    const hasil = hitungHasilTasmi(detail.skorPerHalaman || {}, juzTarget);
    const totalSkor = detail.totalSkor !== undefined ? Number(detail.totalSkor) : hasil.totalSkor;
    const maxScore = detail.maksimalSkor !== undefined ? Number(detail.maksimalSkor) : hasil.maksimalSkor;
    const isLulus = detail.statusKelulusan ? detail.statusKelulusan === 'LULUS' : totalSkor >= TASMI_PASSING_SCORE;
    const tajwid = detail.tajwid || {};
    const penguji = pengujiName || setoran.ParafUstadz || 'Ustadz Penguji';
    const logoUrl = (typeof window !== 'undefined' && window.location && window.location.origin !== 'null')
        ? `${window.location.origin}/logo.jpg`
        : 'logo.jpg';

    let halRowsHtml = '';
    const subTotals = [0, 0, 0, 0];
    const maxRows = Math.max(...hasil.blocks.map(b => b.end - b.start + 1));

    for (let r = 0; r < maxRows; r++) {
        let cellsHtml = '';
        hasil.blocks.forEach((blk, bIdx) => {
            const pageNum = blk.start + r;
            if (pageNum <= blk.end) {
                const sc = detail.skorPerHalaman ? (detail.skorPerHalaman[pageNum] ?? detail.skorPerHalaman[String(pageNum)] ?? '-') : '-';
                if (!isNaN(Number(sc))) subTotals[bIdx] += Number(sc);
                cellsHtml += `<td class="center bold">${pageNum}</td><td class="center bold">${escapeHtml(sc)}</td>`;
            } else {
                cellsHtml += `<td style="background:#f9fafb;"></td><td style="background:#f9fafb;"></td>`;
            }
        });
        halRowsHtml += `<tr>${cellsHtml}</tr>`;
    }

    const tajwidRowsHtml = TASMI_TAJWID_ASPEK.map((asp, idx) => {
        const grade = String(tajwid[asp.key] || '-').toUpperCase();
        return `
            <tr>
                <td class="center">${idx + 1}</td>
                <td>${escapeHtml(asp.label)}</td>
                <td class="center bold" style="font-size:12px;">${escapeHtml(grade)}</td>
            </tr>
        `;
    }).join('');

    const statusLabel = isLulus
        ? '<span style="color:#1c6b45;">LULUS</span> <span style="text-decoration:line-through;color:#aaa;font-weight:400;">/ TIDAK LULUS</span>'
        : '<span style="text-decoration:line-through;color:#aaa;font-weight:400;">LULUS /</span> <span style="color:#9a2024;">TIDAK LULUS</span>';

    const printHtml = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kartu Penilaian Tasmi' Juz ${escapeHtml(juzTarget)} - ${escapeHtml(s.Nama_Santri || setoran.ID_Santri)}</title>
    <style>
        @page { size: A4 portrait; margin: 10mm 12mm; }
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #111; }
        body { background: #fff; margin: 0; padding: 10px; font-size: 11px; line-height: 1.35; }
        .card-container { max-width: 780px; margin: 0 auto; border: 1.5px solid #222; padding: 16px 20px; background: #fff; }
        .kop { display: flex; align-items: center; gap: 14px; border-bottom: 2.5px double #111; padding-bottom: 8px; margin-bottom: 12px; }
        .kop img { width: 58px; height: 58px; object-fit: contain; }
        .kop-text { flex: 1; text-align: center; padding-right: 40px; }
        .kop-text h2 { margin: 0; font-size: 14px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; }
        .kop-text p { margin: 2px 0 0; font-size: 9.5px; color: #333; }
        .sec-title { text-align: center; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 8px 0 10px; }
        .meta-grid { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11px; font-weight: 600; background: #f9fafb; border: 1px solid #d1d5db; padding: 6px 10px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th, td { border: 1px solid #222; padding: 4px 6px; font-size: 10.5px; }
        th { background: #f3f4f6; font-weight: 800; text-transform: uppercase; }
        .center { text-align: center; }
        .bold { font-weight: 700; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 10px; align-items: start; }
        .sub-head { font-size: 11px; font-weight: 800; text-transform: uppercase; text-align: center; margin: 0 0 6px; }
        .total-box { border: 1.5px solid #111; margin-top: 8px; }
        .total-row { display: grid; grid-template-columns: 1.2fr 1fr; border-bottom: 1px solid #111; }
        .total-lbl { padding: 8px 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; border-right: 1px solid #111; background: #f9fafb; }
        .total-val { padding: 8px 10px; font-size: 18px; font-weight: 900; text-align: center; color: ${isLulus ? '#1c6b45' : '#9a2024'}; }
        .lulus-row { padding: 7px 10px; text-align: center; font-weight: 800; font-size: 12px; letter-spacing: 0.5px; }
        .catatan-box { border: 1px solid #222; padding: 8px 10px; min-height: 54px; margin-top: 8px; }
        .catatan-box .lbl { font-weight: 800; font-size: 10.5px; margin-bottom: 3px; }
        .ttd-area { display: flex; justify-content: space-between; margin-top: 16px; padding: 0 12px; font-size: 10.5px; }
        .ttd-col { text-align: center; min-width: 170px; }
        .ttd-space { height: 42px; }
        .action-bar { text-align: center; margin-top: 14px; }
        .btn-print { background: #9a2024; color: #fff; border: none; padding: 9px 20px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px; }
        @media print {
            body { padding: 0; }
            .card-container { border: none; padding: 0; }
            .action-bar { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="card-container">
        <div class="kop">
            <img src="${logoUrl}" alt="Logo" onerror="this.style.display='none'">
            <div class="kop-text">
                <h2>Pondok Pesantren Tahfizh Zadil Qur'an Tuban</h2>
                <p>AKTA NOTARIS MUNTAFIAH, S.H. M.Kn &bull; Nomor AHU-0023909.AH.01.12 Tahun 2020</p>
                <p>Alamat: Jl. Raya Penambangan, Ds. Penambangan, Kec. Semanding, Kab. Tuban, Prov. Jawa Timur. Kode Pos: 62381</p>
            </div>
        </div>

        <div class="sec-title">Tabel Penilaian Kelancaran Tasmi'</div>

        <div class="meta-grid">
            <div>Santri: <strong>${escapeHtml(s.Nama_Santri || setoran.ID_Santri)}</strong> (${escapeHtml(setoran.ID_Santri)})</div>
            <div>JUZ: <strong>${escapeHtml(juzTarget)}</strong> (${hasil.totalPages} Hal)</div>
            <div>Tanggal: <strong>${escapeHtml(setoran.Tanggal || '-')}</strong></div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:10%;">HAL</th><th style="width:15%;">SKOR</th>
                    <th style="width:10%;">HAL</th><th style="width:15%;">SKOR</th>
                    <th style="width:10%;">HAL</th><th style="width:15%;">SKOR</th>
                    <th style="width:10%;">HAL</th><th style="width:15%;">SKOR</th>
                </tr>
            </thead>
            <tbody>
                ${halRowsHtml}
                <tr style="background:#f9fafb;font-weight:700;">
                    <td class="center">Sub</td><td class="center">${subTotals[0]}</td>
                    <td class="center">Sub</td><td class="center">${subTotals[1]}</td>
                    <td class="center">Sub</td><td class="center">${subTotals[2]}</td>
                    <td class="center">Sub</td><td class="center">${subTotals[3]}</td>
                </tr>
                <tr style="background:#eef2ff;">
                    <td colspan="6" class="center bold" style="font-size:11.5px;padding:6px;">JUMLAH KESELURUHAN SKOR</td>
                    <td colspan="2" class="center bold" style="font-size:14px;color:${isLulus ? '#1c6b45' : '#9a2024'};">${totalSkor} / ${maxScore}</td>
                </tr>
            </tbody>
        </table>

        <div class="two-col">
            <!-- KIRI: Ketentuan Skor & Kelulusan -->
            <div>
                <div class="sub-head">Ketentuan Skor Kelancaran Hafalan</div>
                <table>
                    <thead>
                        <tr><th style="width:30px;">No.</th><th style="width:48px;">SKOR</th><th>KETERANGAN</th></tr>
                    </thead>
                    <tbody>
                        <tr><td class="center">1</td><td class="center bold">5</td><td>Hafalan lancar tidak mengingatkan sama sekali</td></tr>
                        <tr><td class="center">2</td><td class="center bold">4</td><td>Hafalan diingatkan 1 sampai 5 kali</td></tr>
                        <tr><td class="center">3</td><td class="center bold">3</td><td>Hafalan diingatkan 6 sampai 10 kali</td></tr>
                        <tr><td class="center">4</td><td class="center bold">2</td><td>Diingatkan 11 kali lebih sampai menuntun</td></tr>
                    </tbody>
                </table>

                <div class="sub-head" style="margin-top:10px;">Ketentuan Penilaian &amp; Kelulusan Tasmi'</div>
                <table>
                    <tbody>
                        <tr><td class="center" style="width:28px;">1</td><td>Ketentuan skor berlaku perhalaman/pojok pada setiap juz nya</td></tr>
                        <tr><td class="center">2</td><td>Skor kelulusan adalah jumlah keseluruhan skor dalam 1 juz</td></tr>
                        <tr><td class="center">3</td><td>Santri yang dinyatakan lulus adalah santri yang mampu mencapai minimal skor kelulusan</td></tr>
                        <tr><td class="center">4</td><td><strong>Skor minimal kelulusan adalah 80</strong></td></tr>
                        <tr><td class="center">5</td><td>Santri yang memperoleh skor di bawah 80 wajib mengulang penilaian Tasmi'</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- KANAN: Penilaian Praktik Tajwid + Total & TTD -->
            <div>
                <div class="sub-head">Penilaian Praktik Tajwid</div>
                <table>
                    <thead>
                        <tr><th style="width:30px;">NO</th><th>Aspek Tajwid yang Dinilai</th><th style="width:52px;">NILAI</th></tr>
                    </thead>
                    <tbody>${tajwidRowsHtml}</tbody>
                </table>
                <div style="font-size:9.5px;color:#444;margin-top:-6px;margin-bottom:8px;">
                    <strong>Keterangan:</strong> Kolom Nilai diisi Huruf A, B, C atau D
                </div>

                <div class="total-box">
                    <div class="total-row">
                        <div class="total-lbl">TOTAL NILAI</div>
                        <div class="total-val">${totalSkor}</div>
                    </div>
                    <div class="lulus-row">${statusLabel}</div>
                </div>
            </div>
        </div>

        <div class="catatan-box">
            <div class="lbl">CATATAN PENGUJI :</div>
            <div style="font-style:italic;color:#222;">${setoran.Catatan ? escapeHtml(setoran.Catatan) : '-'}</div>
        </div>

        <div class="ttd-area">
            <div class="ttd-col">
                <div style="visibility:hidden;">Penambangan,</div>
                <div>Mengetahui,<br><strong>Pengasuh PPT ZAQU</strong></div>
                <div class="ttd-space"></div>
                <div class="bold" style="text-decoration:underline;">Ust. Fariz Mas'udin S.Pd.</div>
            </div>
            <div class="ttd-col">
                <div>Penambangan, ${escapeHtml(setoran.Tanggal ? String(setoran.Tanggal).split(',')[0] : new Date().toLocaleDateString('id-ID'))}</div>
                <div><strong>Penguji</strong></div>
                <div class="ttd-space"></div>
                <div class="bold" style="text-decoration:underline;">${escapeHtml(penguji)}</div>
            </div>
        </div>
    </div>

    <div class="action-bar">
        <button onclick="window.print()" class="btn-print">&#128438; Cetak / Unduh PDF Kartu Tasmi'</button>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
        };
    </script>
</body>
</html>`;

    const printWin = window.open('', '_blank');
    if (printWin) {
        printWin.document.open();
        printWin.document.write(printHtml);
        printWin.document.close();
    } else {
        AppNotify.toast('Pop-up terblokir. Izinkan pop-up peramban untuk mencetak Kartu Tasmi\'.', 'warning');
    }
}

// ==================== DATABASE QURAN TERPUSAT & PARSER REKAP TAHFIZH ====================
const RAW_QURAN = [
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

const QURAN_DB = RAW_QURAN.map(q => ({
    no: q[0],
    nama: q[1],
    ayat: q[2],
    juz: Array.isArray(q[3]) ? q[3] : [q[3]],
    juzPrimary: Array.isArray(q[3]) ? q[3][0] : q[3]
}));

function convertArabicNumerals(str) {
    return String(str || '')
        .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
        .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0));
}

function cleanSuratName(raw) {
    let clean = String(raw || '').replace(/\([^)]*[\u0600-\u06FF]+[^)]*\)/g, '').trim();
    clean = clean.replace(/^(QS\.?|Surat|Surah)\s*/i, '').trim();
    return clean;
}

/**
 * Parser Tabel Markdown Lembar Catatan Perkembangan Setoran Al-Qur'an (Kode B, M, Z, T)
 * Mampu membaca dokumen markdown tunggal maupun kumpulan dokumen yang dipisahkan '---'
 */
function parseTahfizhMarkdownTable(mdText, santriList = [], ustadzList = []) {
    if (!mdText || typeof mdText !== 'string') return [];

    const cleanCell = (c) => String(c || '').replace(/\*\*/g, '').trim();

    // Pisahkan dokumen menjadi segmen-segmen santri (bisa berpemisah '---' atau '# Lembar')
    const sections = mdText.split(/\n\s*---\s*\n|\n(?=#\s*Lembar)/i).filter(s => s.trim().length > 0);
    const results = [];

    sections.forEach(sec => {
        // Ambil Nama Santri dari header
        const namaSantriMatch = sec.match(/\*\*Nama\s+Santri\s*:\*\*\s*([^\n\r]+)/i);
        let headerSantriName = namaSantriMatch ? namaSantriMatch[1].replace(/[\._\-]+/g, '').trim() : '';

        // Ambil Tingkatan
        const tingkatanMatch = sec.match(/\*\*Tingkatan\s*:\*\*\s*([^\n\r]+)/i);
        let headerTingkatan = "Al-Qur'an";
        if (tingkatanMatch) {
            const rawTingkatan = tingkatanMatch[1].toLowerCase();
            if (rawTingkatan.includes('jilid') && !rawTingkatan.includes("al qur'an") && !rawTingkatan.includes("al-qur'an")) {
                headerTingkatan = 'Jilid';
            }
        }

        // Cari santri yang cocok di santriList
        let matchedSantri = null;
        if (headerSantriName && Array.isArray(santriList) && santriList.length > 0) {
            const cleanQuery = headerSantriName.toLowerCase().replace(/[^a-z0-9]/g, '');
            matchedSantri = santriList.find(s => {
                const sName = String(s.Nama_Santri || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const sPanggilan = String(s.Nama_Panggilan || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                return sName === cleanQuery || (sPanggilan && sPanggilan === cleanQuery) || (cleanQuery.length >= 4 && sName.includes(cleanQuery));
            }) || null;
        }

        // Ambil baris tabel
        const lines = sec.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return;

            // Cek apakah ini header tabel
            if (/\|\s*TM\s*\|/i.test(trimmed) || /\|\s*:?-+:?\s*\|/.test(trimmed)) return;

            const cols = trimmed.split('|').map(cleanCell);
            // Format kolom: [empty, TM, Tanggal, SuratJilid, AyatHal, Nilai, Paraf, Kode, empty?]
            const validCols = cols.slice(1, cols.length - 1);
            if (validCols.length < 5) return;

            const tmRaw = convertArabicNumerals(validCols[0] || '-');
            const tglRaw = convertArabicNumerals(validCols[1] || '');
            const suratRaw = validCols[2] || '';
            const ayatHalRaw = convertArabicNumerals(validCols[3] || '');
            const nilaiRaw = validCols[4] || 'B';
            const parafRaw = validCols[5] || '';
            const kodeRaw = validCols[6] || '';

            // Tentukan Kategori: Z (Ziyadah), M (Muroja'ah), B (Binnadhor), T (Tasmi')
            let jenis = 'Ziyadah';
            const checkKode = (kodeRaw || parafRaw || '').trim().toUpperCase();
            if (checkKode === 'M' || checkKode.includes('MUROJA')) {
                jenis = "Muroja'ah";
            } else if (checkKode === 'B' || checkKode.includes('BINNAD') || checkKode.includes('BIN-NAZHAR')) {
                jenis = 'Binnadhor';
            } else if (checkKode === 'T' || checkKode.includes('TASMI')) {
                jenis = "Tasmi'";
            } else if (checkKode === 'Z' || checkKode.includes('ZIYADAH')) {
                jenis = 'Ziyadah';
            }

            // Normalisasi Tanggal ke YYYY-MM-DD
            let normalizedDate = tglRaw;
            const dateParts = tglRaw.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
            if (dateParts) {
                let d = dateParts[1].padStart(2, '0');
                let m = dateParts[2].padStart(2, '0');
                let y = dateParts[3];
                if (y.length === 2) y = '20' + y;
                normalizedDate = `${y}-${m}-${d}`;
            }

            // Deteksi Surat / Jilid & Ayat
            let surahName = cleanSuratName(suratRaw);
            let surahNo = '';
            let juzVal = '1';
            let ayatVal = ayatHalRaw;
            let halVal = '-';
            let tingkatanRow = headerTingkatan;

            if (surahName.toLowerCase().includes('jilid') || suratRaw.includes('ج ¼') || suratRaw.includes('جuz') || suratRaw.includes('jilid')) {
                tingkatanRow = 'Jilid';
                juzVal = surahName || 'Jilid 1';
                if (ayatHalRaw.toLowerCase().includes('halaman') || ayatHalRaw.toLowerCase().includes('hal')) {
                    halVal = ayatHalRaw.replace(/[^0-9]/g, '') || '-';
                    ayatVal = '-';
                }
            } else {
                // Cari surat di QURAN_DB
                const qFound = QURAN_DB.find(q => {
                    const cleanQ = q.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanS = surahName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return cleanQ === cleanS || cleanS.includes(cleanQ) || cleanQ.includes(cleanS);
                });
                if (qFound) {
                    surahName = qFound.nama;
                    surahNo = String(qFound.no);
                    juzVal = String(qFound.juzPrimary || (Array.isArray(qFound.juz) ? qFound.juz[0] : qFound.juz));
                    if (ayatHalRaw.toLowerCase().includes('akhir')) {
                        const startM = ayatHalRaw.match(/\d+/);
                        const start = startM ? startM[0] : '1';
                        ayatVal = `${start} - ${qFound.ayat}`;
                    } else if (ayatHalRaw.toLowerCase().includes('halaman') || ayatHalRaw.toLowerCase().includes('hal')) {
                        halVal = ayatHalRaw.replace(/[^0-9]/g, '') || '-';
                    }
                }
            }

            // Normalisasi Nilai / Predikat
            let predikat = 'Mumtaz';
            const cleanNilai = nilaiRaw.trim().toUpperCase();
            if (cleanNilai === 'B' || cleanNilai === 'BAIK' || cleanNilai === 'JAYYID') {
                predikat = 'Jayyid';
            } else if (cleanNilai === 'A' || cleanNilai === 'MUMTAZ') {
                predikat = 'Mumtaz';
            } else if (cleanNilai === 'C' || cleanNilai === 'MAQBUL') {
                predikat = 'Maqbul';
            } else if (nilaiRaw.trim()) {
                predikat = nilaiRaw.trim();
            }

            // Cari Ustadz Penyimak dari Paraf / Kode Ustadz
            let matchedUstadz = null;
            if (parafRaw && Array.isArray(ustadzList) && ustadzList.length > 0) {
                const pClean = parafRaw.trim().toLowerCase();
                matchedUstadz = ustadzList.find(u => {
                    const uName = String(u.Nama || '').toLowerCase();
                    const uId = String(u.ID_Ustadz || '').toLowerCase();
                    const uUser = String(u.Username || '').toLowerCase();
                    const uKode = String(u.Kode || '').toLowerCase();
                    return (uKode && uKode === pClean) || uId === pClean || uUser === pClean || uName.includes(pClean) || pClean.includes(uName);
                }) || null;
            }

            results.push({
                tm: tmRaw,
                tanggal: normalizedDate,
                rawSantriName: headerSantriName,
                santriId: matchedSantri ? matchedSantri.ID_Santri : '',
                santriNama: matchedSantri ? matchedSantri.Nama_Santri : (headerSantriName || 'Belum Dipilih'),
                isSantriMatched: !!matchedSantri,
                tingkatan: tingkatanRow,
                jenis: jenis,
                surah: surahName,
                surahNo: surahNo,
                juz: juzVal,
                ayat: ayatVal || '-',
                halaman: halVal,
                predikat: predikat,
                paraf: parafRaw,
                ustadzId: matchedUstadz ? matchedUstadz.ID_Ustadz : '',
                ustadzNama: matchedUstadz ? matchedUstadz.Nama : (parafRaw !== '✓' ? parafRaw : ''),
                isUstadzMatched: !!matchedUstadz
            });
        });
    });

    return results;
}

function formatWaNumber(hp) {
    let clean = String(hp || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return clean;
}

function openModal(modalId, contentId) {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const content = document.getElementById(contentId || `${modalId}Content`);
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (content) content.classList.remove('scale-95');
    }, 10);
}

function closeModal(modalId, contentId) {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const content = document.getElementById(contentId || `${modalId}Content`);
    modal.classList.add('opacity-0');
    if (content) content.classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

if (typeof window !== 'undefined') {
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.RAW_QURAN = RAW_QURAN;
    window.QURAN_DB = QURAN_DB;
    window.convertArabicNumerals = convertArabicNumerals;
    window.cleanSuratName = cleanSuratName;
    window.parseTahfizhMarkdownTable = parseTahfizhMarkdownTable;
}

// ==================== DARK MODE ====================
function initTheme() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const path = window.location.pathname.toLowerCase();
    // Cek apakah halaman saat ini adalah dashboard internal (admin, ustadz, wali)
    const isDashboard = path.includes('admin') || path.includes('ustadz') || path.includes('wali');
    
    // Landing page & halaman publik defaultnya selalu mode terang (Light Mode)
    if (!isDashboard) {
        document.documentElement.classList.remove('dark');
        return;
    }

    // Pada dashboard internal, muat preferensi tema yang disimpan
    const savedTheme = (typeof localStorage !== 'undefined') ? (localStorage.getItem(APP_CONFIG?.STORAGE_KEYS?.THEME || 'theme') || localStorage.theme) : null;
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
initTheme();

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    localStorage.theme = isDark ? 'dark' : 'light';
}

// ==================== BRANDING ====================
function fetchInitialBranding() {
    apiCall('getAppBranding').then(res => {
        if (res && res.status === 'success' && res.data) {
            updateBrandingDOM(res.data);
        }
    }).catch(() => {});
}

function updateBrandingDOM(name) {
    if (!name) return;
    document.querySelectorAll('.brand-name-display').forEach(el => el.textContent = name);
}

// ==================== SESSION & MULTI-PAGE NAVIGATION ====================
let sessionData = null;

function checkExistingSession() {
    try {
        const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SESSION);
        if (saved) {
            sessionData = JSON.parse(saved);
            if (sessionData && sessionData.role) {
                return true;
            }
        }
    } catch (e) {
        console.warn('Gagal membaca sesi lokal:', e);
    }
    sessionData = null;
    return false;
}

function getDashboardUrlByRole(role) {
    if (role === 'superadmin') return 'admin.html';
    if (role === 'ustadz') return 'ustadz.html';
    if (role === 'walisantri') return 'wali.html';
    return 'login.html';
}

/**
 * Navigasi cerdas lintas halaman yang kompatibel dengan:
 * - Clean URLs di Cloudflare Pages (/admin, /ustadz, /wali, /login)
 * - File HTML langsung di Live Server / Localhost (admin.html, ustadz.html, wali.html, login.html)
 */
function navigateTo(target) {
    const clean = String(target || '/').trim();
    if (clean === '/' || clean === '/home' || clean === '/beranda' || clean === 'index.html' || clean === 'landingpage.html') {
        window.location.href = 'index.html';
        return;
    }
    if (clean.startsWith('/login') || clean === '/portal' || clean.startsWith('login.html')) {
        window.location.href = clean.includes('?') ? `login.html?${clean.split('?')[1]}` : 'login.html';
        return;
    }
    if (clean.startsWith('/admin') || clean.startsWith('admin.html')) {
        if (clean === '/admin/santri') window.location.href = 'admin.html?menu=santri';
        else if (clean === '/admin/keuangan' || clean === '/admin/spp') window.location.href = 'admin.html?menu=keuangan';
        else if (clean === '/admin/ustadz') window.location.href = 'admin.html?menu=ustadz';
        else if (clean === '/admin/pengaturan') window.location.href = 'admin.html?menu=pengaturan';
        else window.location.href = 'admin.html';
        return;
    }
    if (clean.startsWith('/ustadz') || clean === '/setoran' || clean.startsWith('ustadz.html')) {
        window.location.href = 'ustadz.html';
        return;
    }
    if (clean.startsWith('/wali') || clean === '/progres' || clean.startsWith('wali.html')) {
        window.location.href = 'wali.html';
        return;
    }
    window.location.href = clean;
}

function logout() {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.SESSION);
    sessionData = null;
    window.location.href = 'login.html';
}

// ==================== PWA INSTALLATION & SERVICE WORKER ====================
let deferredInstallPrompt = null;

function isStandalonePWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
}

function detectPWAPlatform() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return 'ios';
    }
    if (/android/i.test(ua)) {
        return 'android';
    }
    return 'desktop';
}

function updatePwaInstallUI() {
    const isInstalled = isStandalonePWA();
    const installButtons = document.querySelectorAll('.btn-pwa-install');
    installButtons.forEach(btn => {
        if (isInstalled) {
            btn.classList.add('hidden');
        } else {
            btn.classList.remove('hidden');
        }
    });
}

function initPwa() {
    updatePwaInstallUI();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
            .then(reg => {
                if (reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                            }
                        });
                    }
                });
            })
            .catch(err => {
                console.warn('Registrasi Service Worker gagal:', err);
            });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        updatePwaInstallUI();
    });

    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        document.body.classList.add('pwa-installed');
        updatePwaInstallUI();
        AppNotify.toast('success', 'Aplikasi Zadil Quran berhasil dipasang di perangkat Anda!');
    });
}

async function triggerPwaInstall() {
    if (isStandalonePWA()) {
        AppNotify.toast('info', 'Aplikasi Zadil Quran sudah terpasang dan berjalan dalam mode layar penuh.');
        return;
    }

    if (deferredInstallPrompt) {
        try {
            deferredInstallPrompt.prompt();
            const choice = await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            if (choice && choice.outcome === 'accepted') {
                document.body.classList.add('pwa-installed');
                updatePwaInstallUI();
                AppNotify.toast('success', 'Terima kasih telah memasang aplikasi Zadil Quran!');
            }
            return;
        } catch (err) {
            console.warn('Gagal memanggil native install prompt:', err);
        }
    }

    const platform = detectPWAPlatform();

    if (platform === 'ios') {
        AppNotify.info(
            'Pasang di iPhone / iPad',
            `<div class="text-left text-sm leading-relaxed space-y-3">
                <p class="text-gray-600 dark:text-gray-300">
                    Pasang <b>Zadil Quran</b> di layar utama iPhone/iPad Anda agar dapat dibuka cepat satu sentuhan:
                </p>
                <div class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2.5">
                    <div class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-[#9a2024] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>Buka web ini di browser <b>Safari</b> lalu ketuk tombol <b>Bagikan (Share)</b> <i class="fa-solid fa-arrow-up-from-bracket text-[#9a2024]"></i> pada bilah menu.</span>
                    </div>
                    <div class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-[#9a2024] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>Gulir ke bawah dan pilih <b>"Tambah ke Layar Utama"</b> (<i>Add to Home Screen</i> <i class="fa-solid fa-square-plus text-[#1c6b45]"></i>).</span>
                    </div>
                    <div class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-[#9a2024] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>Ketuk <b>"Tambah"</b> di pojok kanan atas untuk menyelesaikan.</span>
                    </div>
                </div>
            </div>`
        );
    } else if (platform === 'android') {
        AppNotify.info(
            'Pasang di Android',
            `<div class="text-left text-sm leading-relaxed space-y-3">
                <p class="text-gray-600 dark:text-gray-300">
                    Pasang <b>Zadil Quran</b> sebagai aplikasi mandiri di ponsel atau tablet Android Anda:
                </p>
                <div class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2.5">
                    <div class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-[#9a2024] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>Ketuk menu <b>Titik Tiga (⋮)</b> <i class="fa-solid fa-ellipsis-vertical text-[#9a2024]"></i> di pojok kanan atas browser Google Chrome.</span>
                    </div>
                    <div class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-[#9a2024] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>Pilih opsi <b>"Instal aplikasi"</b> atau <b>"Tambahkan ke Layar Utama"</b>.</span>
                    </div>
                    <div class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-[#9a2024] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>Ketuk konfirmasi <b>"Instal"</b>. Ikon aplikasi akan langsung muncul di beranda ponsel Anda.</span>
                    </div>
                </div>
            </div>`
        );
    } else {
        AppNotify.info(
            'Pasang di Komputer / Laptop',
            `<div class="text-left text-sm leading-relaxed space-y-3">
                <p class="text-gray-600 dark:text-gray-300">
                    Pasang <b>Zadil Quran</b> sebagai aplikasi desktop mandiri di Windows atau Mac:
                </p>
                <div class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2.5">
                    <div class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-[#9a2024] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>Klik ikon <b>Instal</b> <i class="fa-solid fa-download text-[#9a2024]"></i> di sisi kanan kolom alamat URL (Address Bar) browser Chrome atau Edge Anda.</span>
                    </div>
                    <div class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-[#9a2024] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>Atau klik menu titik tiga browser (⋮) &gt; pilih <b>"Simpan dan Bagikan / Aplikasi"</b> &gt; klik <b>"Instal Zadil Quran"</b>.</span>
                    </div>
                </div>
            </div>`
        );
    }
}

// Export untuk lingkungan Node.js / Unit Testing jika tersedia
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        formatRupiah,
        angkaKeTerbilang,
        formatWaNumber,
        getDashboardUrlByRole,
        openModal,
        closeModal,
        RAW_QURAN,
        QURAN_DB,
        convertArabicNumerals,
        cleanSuratName,
        parseTahfizhMarkdownTable,
        TASMI_PASSING_SCORE,
        TASMI_VALID_SCORES,
        TASMI_VALID_GRADES,
        TASMI_TAJWID_ASPEK,
        getTasmiConfigByJuz,
        hitungHasilTasmi,
        validasiTajwidTasmi,
        parseDetailTasmi
    };
}

