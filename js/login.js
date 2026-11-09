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

    const activeStaff = 'py-2.5 px-3 rounded-lg transition text-center bg-white dark:bg-darkcard text-[#9a2024] dark:text-white shadow-xs';
    const activeWali = 'py-2.5 px-3 rounded-lg transition text-center bg-white dark:bg-darkcard text-[#1c6b45] dark:text-white shadow-xs';
    const inactive = 'py-2.5 px-3 rounded-lg transition text-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white';

    if (tabStaff) tabStaff.className = tab === 'staff' ? activeStaff : inactive;
    if (tabWali) tabWali.className = tab === 'wali' ? activeWali : inactive;
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
            if (res.data && res.data.token) {
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

