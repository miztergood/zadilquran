/**
 * ============================================================================
 * ZADIL QURAN - LOGIN MODULE (js/login.js)
 * Digunakan oleh login.html
 * ============================================================================
 */

function switchLoginTab(tab) {
    const formStaff = document.getElementById('formLoginStaff');
    const formWali = document.getElementById('formLoginWali');
    const tabStaff = document.getElementById('tabStaff');
    const tabWali = document.getElementById('tabWali');

    if (formStaff) formStaff.classList.toggle('hidden', tab !== 'staff');
    if (formWali) formWali.classList.toggle('hidden', tab !== 'wali');
    if (tabStaff) tabStaff.className = tab === 'staff' ? 'flex-1 text-center py-2 tab-active transition' : 'flex-1 text-center py-2 tab-inactive transition hover:bg-gray-50 dark:hover:bg-slate-800';
    if (tabWali) tabWali.className = tab === 'wali' ? 'flex-1 text-center py-2 tab-active transition' : 'flex-1 text-center py-2 tab-inactive transition hover:bg-gray-50 dark:hover:bg-slate-800';
}

function handleLogin(e, type) {
    e.preventDefault();
    AppNotify.loading('Memeriksa Kredensial...');

    const un = type === 'staff'
        ? document.getElementById('staffUsername').value.trim()
        : document.getElementById('waliIdSantri').value.trim().toUpperCase();
    const pw = type === 'staff'
        ? document.getElementById('staffPassword').value
        : '';

    apiCall('loginUser', un, pw, type).then(res => {
        if (res.status === 'success') {
            if (type === 'staff') {
                localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, res.data.token);
            }
            sessionData = res.data;
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

            AppNotify.toast('success', res.message || 'Login berhasil');
            window.location.href = getDashboardUrlByRole(sessionData.role);
        } else {
            AppNotify.error('Akses Ditolak', res.message || 'Kredensial tidak valid');
        }
    }).catch(() => {});
}

window.addEventListener('DOMContentLoaded', () => {
    initPwa();
    fetchInitialBranding();

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const idParam = params.get('id');

    // Jika ada parameter ?id=ZQ-... dari pendaftaran baru, tampilkan tab Wali dan isi otomatis
    if (tabParam === 'wali' || idParam) {
        switchLoginTab('wali');
        if (idParam) {
            const inputWali = document.getElementById('waliIdSantri');
            if (inputWali) inputWali.value = idParam.toUpperCase();
        }
        return;
    }

    // Jika sudah punya sesi aktif dan tidak meminta ganti akun, arahkan ke dashboard masing-masing
    if (checkExistingSession() && sessionData && !params.get('switch')) {
        window.location.href = getDashboardUrlByRole(sessionData.role);
    }
});

