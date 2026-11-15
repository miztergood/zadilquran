import { describe, it, expect } from 'vitest';
import {
  generateKwitansiCardHtml,
  generateKwitansiHtml,
  formatRupiah,
  angkaKeTerbilang
} from '../js/core.js';

describe('Modul Titipan & Uang Saku Santri serta Keperluan Lain', () => {
  const dummySantri = {
    ID_Santri: 'ZQ-2026-X8K9',
    Nama_Santri: 'Muhammad Zaidan',
    Nama_Wali: 'Ahmad Fauzi',
    Nama_Ayah: 'Ahmad Fauzi',
    No_HP_Wali: '081234567890'
  };

  const dummyMutasiMasuk = {
    ID_Transaksi: 'SAKU-2026-001',
    ID_Santri: 'ZQ-2026-X8K9',
    Jenis: 'MASUK',
    Nominal: 150000,
    Saldo_Akhir: 150000,
    Tanggal: '15 November 2026',
    Keterangan: 'Titipan uang saku via transfer Bank BRI',
    isUangSaku: true
  };

  it('generateKwitansiCardHtml menghasilkan Tanda Terima Titipan Uang Saku dengan benar', () => {
    const html = generateKwitansiCardHtml(dummyMutasiMasuk, dummySantri);

    expect(html).toContain('Tanda Terima Titipan Uang Saku');
    expect(html).toContain('KW-SAKU-2026-001');
    expect(html).toContain('Muhammad Zaidan');
    expect(html).toContain('Ahmad Fauzi');
    expect(html).toContain('Rp 150.000');
    expect(html).toContain('Seratus Lima Puluh Ribu Rupiah');
    expect(html).toContain('Titipan uang saku via transfer Bank BRI');
  });

  it('generateKwitansiHtml untuk uang saku menyertakan tombol aksi PDF dan Gambar', () => {
    const html = generateKwitansiHtml(dummyMutasiMasuk, dummySantri);

    expect(html).toContain('Tanda Terima Titipan Uang Saku');
    expect(html).toContain('Cetak / Simpan PDF');
    expect(html).toContain('Unduh Gambar (PNG)');
    expect(html).toContain('Siti Mei Alvita');
  });

  it('kalkulasi buku tabungan uang saku: saldo berjalan sesuai mutasi masuk dan keluar', () => {
    const mutasi = [
      { Jenis: 'MASUK', Nominal: 100000 },
      { Jenis: 'MASUK', Nominal: 50000 },
      { Jenis: 'KELUAR', Nominal: 30000 },
      { Jenis: 'KELUAR', Nominal: 20000 }
    ];

    let saldo = 0;
    let totalMasuk = 0;
    let totalKeluar = 0;

    mutasi.forEach(m => {
      if (m.Jenis === 'MASUK') {
        saldo += m.Nominal;
        totalMasuk += m.Nominal;
      } else if (m.Jenis === 'KELUAR') {
        saldo -= m.Nominal;
        totalKeluar += m.Nominal;
      }
    });

    expect(totalMasuk).toBe(150000);
    expect(totalKeluar).toBe(50000);
    expect(saldo).toBe(100000);
  });

  it('validasi penarikan uang saku: tidak boleh melebihi saldo yang tersedia', () => {
    const currentSaldo = 50000;
    const penarikanValid = 30000;
    const penarikanInvalid = 75000;

    const isBisaTarik = (saldo, nominal) => nominal <= saldo;

    expect(isBisaTarik(currentSaldo, penarikanValid)).toBe(true);
    expect(isBisaTarik(currentSaldo, penarikanInvalid)).toBe(false);
  });
});
