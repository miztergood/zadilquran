import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  generateKwitansiCardHtml,
  generateKwitansiHtml,
  getKwitansiAssets,
  DEFAULT_KWITANSI_CONFIG
} from '../js/core.js';
import { KWITANSI_ASSETS } from '../js/kwitansi-assets.js';

describe('Kwitansi Resmi PPTQ Zadil Quran', () => {
  const dummyTagihan = {
    ID_Tagihan: 'SPP-2026-11-001',
    ID_Santri: 'ZQ-2026-001',
    Judul_Tagihan: 'Syahriyah Bulan November 2026',
    Kategori: 'Syahriyah',
    Nominal: 200000,
    Status: 'Lunas',
    Tgl_Bayar: '10 November 2026',
    Metode_Bayar: 'Transfer Bank Mandiri',
    Catatan: 'Lunas tepat waktu'
  };

  const dummySantri = {
    ID_Santri: 'ZQ-2026-001',
    Nama_Santri: 'Ahmad Zadil Ilmi',
    Nama_Wali: 'Bapak Mochamad Ridwan',
    Nama_Ayah: 'Mochamad Ridwan'
  };

  it('memastikan aset tanda tangan dan stempel transparan PNG tersedia di disk', () => {
    const ttdPath = path.resolve(process.cwd(), 'assets/tanda-tangan.png');
    const stempelPath = path.resolve(process.cwd(), 'assets/stempel.png');

    expect(fs.existsSync(ttdPath)).toBe(true);
    expect(fs.existsSync(stempelPath)).toBe(true);

    // Verifikasi magic number header PNG (0x89, 'P', 'N', 'G')
    const ttdBuf = fs.readFileSync(ttdPath);
    expect(ttdBuf[0]).toBe(0x89);
    expect(ttdBuf.toString('ascii', 1, 4)).toBe('PNG');

    const stempelBuf = fs.readFileSync(stempelPath);
    expect(stempelBuf[0]).toBe(0x89);
    expect(stempelBuf.toString('ascii', 1, 4)).toBe('PNG');
  });

  it('memastikan konfigurasi nama Bendahara adalah Siti Mei Alvita', () => {
    expect(DEFAULT_KWITANSI_CONFIG.namaBendahara).toBe('Siti Mei Alvita');
    expect(DEFAULT_KWITANSI_CONFIG.jabatanBendahara).toBe('Bendahara Pesantren');
    expect(KWITANSI_ASSETS.namaBendahara).toBe('Siti Mei Alvita');
    expect(KWITANSI_ASSETS.jabatanBendahara).toBe('Bendahara Pesantren');
  });

  it('generateKwitansiCardHtml menghasilkan kartu kwitansi dengan stempel, ttd, dan nama Siti Mei Alvita', () => {
    const html = generateKwitansiCardHtml(dummyTagihan, dummySantri);

    expect(html).toContain('KW-SPP-2026-11-001');
    expect(html).toContain('Ahmad Zadil Ilmi');
    expect(html).toContain('Bapak Mochamad Ridwan');
    expect(html).toContain('Rp 200.000');
    expect(html).toContain('Dua Ratus Ribu Rupiah');
    expect(html).toContain('Siti Mei Alvita');
    expect(html).toContain('Bendahara Pesantren');
    expect(html).toContain('Tuban, 10 November 2026');
    expect(html).toContain('class="stempel-img"');
    expect(html).toContain('class="ttd-img"');
    expect(html).toContain('class="watermark">LUNAS</div>');
  });

  it('generateKwitansiHtml menghasilkan halaman lengkap dengan tombol PDF dan opsi unduh gambar PNG', () => {
    const fullHtml = generateKwitansiHtml(dummyTagihan, dummySantri);

    expect(fullHtml).toContain('<!DOCTYPE html>');
    expect(fullHtml).toContain('Cetak / Simpan PDF');
    expect(fullHtml).toContain('Unduh Gambar (PNG)');
    expect(fullHtml).toContain('unduhGambarKwitansiWindow()');
    expect(fullHtml).toContain('html2canvas');
    expect(fullHtml).toContain('Siti Mei Alvita');
  });

  it('memastikan fallback aset kwitansi bekerja saat KWITANSI_ASSETS tidak didefinisikan secara global', () => {
    const assets = getKwitansiAssets();
    expect(assets.namaBendahara).toBe('Siti Mei Alvita');
    expect(assets.jabatanBendahara).toBe('Bendahara Pesantren');
    expect(assets.kotaPenerbit).toBe('Tuban');
  });
});
