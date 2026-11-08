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

window.alert = function(msg) {
    AppNotify.info('Pemberitahuan', msg);
};

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
function formatRupiah(angka) {
    const num = Number(String(angka || 0).replace(/[^0-9.-]+/g, "")) || 0;
    return "Rp " + num.toLocaleString('id-ID');
}

function formatWaNumber(hp) {
    let clean = String(hp || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return clean;
}

function closeModal(modalId, contentId) {
    const modal = document.getElementById(modalId);
    const content = document.getElementById(contentId);
    if (!modal || !content) return;
    modal.classList.add('opacity-0');
    content.classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

// ==================== DARK MODE ====================
function initTheme() {
    const savedTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME) || localStorage.theme;
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
