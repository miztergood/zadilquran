import { describe, it, expect } from 'vitest';
import {
  TASMI_PASSING_SCORE,
  TASMI_VALID_SCORES,
  TASMI_VALID_GRADES,
  TASMI_TAJWID_ASPEK,
  hitungHasilTasmi,
  validasiTajwidTasmi,
  parseDetailTasmi
} from '../js/core.js';

describe('Modul Penilaian Khusus Tasmi\' / Ikhtibar 1 Juz', () => {
  it('memiliki konstanta aturan baku sesuai SOP pondok (lulus >= 80, skor 5/4/3/2, 9 aspek tajwid)', () => {
    expect(TASMI_PASSING_SCORE).toBe(80);
    expect(TASMI_VALID_SCORES).toEqual([5, 4, 3, 2]);
    expect(TASMI_VALID_GRADES).toEqual(['A', 'B', 'C', 'D']);
    expect(TASMI_TAJWID_ASPEK).toHaveLength(9);
  });

  describe('hitungHasilTasmi() - Kalkulasi 20 Halaman & Batas Kelulusan 80', () => {
    it('menghitung skor sempurna (20 halaman × 5 = 100) dengan status LULUS', () => {
      const scores = {};
      for (let i = 1; i <= 20; i++) scores[i] = 5;

      const res = hitungHasilTasmi(scores);
      expect(res.isComplete).toBe(true);
      expect(res.filledCount).toBe(20);
      expect(res.totalSkor).toBe(100);
      expect(res.lulus).toBe(true);
      expect(res.status).toBe('LULUS');
    });

    it('menentukan status LULUS tepat pada batas minimal skor 80 (20 halaman × 4 = 80)', () => {
      const scores = {};
      for (let i = 1; i <= 20; i++) scores[i] = 4;

      const res = hitungHasilTasmi(scores);
      expect(res.isComplete).toBe(true);
      expect(res.totalSkor).toBe(80);
      expect(res.lulus).toBe(true);
      expect(res.status).toBe('LULUS');
    });

    it('menentukan status TIDAK LULUS pada skor 79 (tepat di bawah batas minimal 80)', () => {
      const scores = {};
      for (let i = 1; i <= 19; i++) scores[i] = 4;
      scores[20] = 3; // 19*4 + 3 = 79

      const res = hitungHasilTasmi(scores);
      expect(res.isComplete).toBe(true);
      expect(res.totalSkor).toBe(79);
      expect(res.lulus).toBe(false);
      expect(res.status).toBe('TIDAK LULUS');
    });

    it('menghitung skor minimum valid (20 halaman × 2 = 40) dengan status TIDAK LULUS', () => {
      const scores = {};
      for (let i = 1; i <= 20; i++) scores[i] = 2;

      const res = hitungHasilTasmi(scores);
      expect(res.isComplete).toBe(true);
      expect(res.totalSkor).toBe(40);
      expect(res.lulus).toBe(false);
      expect(res.status).toBe('TIDAK LULUS');
    });

    it('menolak kelulusan bila pengisian kurang dari 20 halaman', () => {
      const scores = {};
      for (let i = 1; i <= 18; i++) scores[i] = 5; // Total 90 tapi hanya 18 halaman

      const res = hitungHasilTasmi(scores);
      expect(res.isComplete).toBe(false);
      expect(res.filledCount).toBe(18);
      expect(res.missingPages).toEqual([19, 20]);
      expect(res.lulus).toBe(false);
      expect(res.status).toBe('BELUM LENGKAP');
    });

    it('menolak skor di luar skala resmi (5, 4, 3, 2) seperti skor 1 atau 6', () => {
      const scores = {};
      for (let i = 1; i <= 18; i++) scores[i] = 5;
      scores[19] = 1;
      scores[20] = 6;

      const res = hitungHasilTasmi(scores);
      expect(res.isComplete).toBe(false);
      expect(res.invalidPages).toEqual([19, 20]);
      expect(res.lulus).toBe(false);
    });
  });

  describe('validasiTajwidTasmi() - 9 Aspek Praktik Tajwid (A/B/C/D)', () => {
    it('lolos validasi jika ke-9 aspek diisi nilai huruf valid A, B, C, atau D (case-insensitive)', () => {
      const tajwid = {};
      const sampleGrades = ['A', 'b', 'C', 'd', 'A', 'B', 'A', 'C', 'B'];
      TASMI_TAJWID_ASPEK.forEach((asp, idx) => {
        tajwid[asp.key] = sampleGrades[idx];
      });

      const res = validasiTajwidTasmi(tajwid);
      expect(res.isValid).toBe(true);
      expect(res.missingKeys).toEqual([]);
      expect(res.tajwid.sifatul_huruf).toBe('B');
      expect(res.tajwid.mim_mati).toBe('D');
    });

    it('gagal validasi jika ada aspek yang kosong atau menggunakan huruf di luar A-D', () => {
      const tajwid = {};
      TASMI_TAJWID_ASPEK.forEach((asp, idx) => {
        tajwid[asp.key] = idx === 0 ? 'E' : 'A';
      });
      delete tajwid[TASMI_TAJWID_ASPEK[8].key];

      const res = validasiTajwidTasmi(tajwid);
      expect(res.isValid).toBe(false);
      expect(res.missingKeys).toContain(TASMI_TAJWID_ASPEK[0].key);
      expect(res.missingKeys).toContain(TASMI_TAJWID_ASPEK[8].key);
    });
  });

  describe('parseDetailTasmi()', () => {
    it('mem-parse JSON string atau object secara aman dan mengembalikan null bila korup', () => {
      const json = JSON.stringify({ juz: '30', totalSkor: 88, statusKelulusan: 'LULUS' });
      expect(parseDetailTasmi(json)).toEqual({ juz: '30', totalSkor: 88, statusKelulusan: 'LULUS' });
      expect(parseDetailTasmi({ juz: '29', totalSkor: 95 })).toEqual({ juz: '29', totalSkor: 95 });
      expect(parseDetailTasmi('invalid-json{')).toBeNull();
      expect(parseDetailTasmi('')).toBeNull();
    });
  });
});
