import { describe, it, expect } from 'vitest';
import {
  TASMI_PASSING_SCORE,
  TASMI_VALID_SCORES,
  TASMI_VALID_GRADES,
  TASMI_TAJWID_ASPEK,
  getTasmiConfigByJuz,
  hitungHasilTasmi,
  validasiTajwidTasmi,
  parseDetailTasmi
} from '../js/core.js';

describe('Modul Penilaian Khusus Tasmi\' (Juz 1-29 & Khusus Juz 30)', () => {
  it('memiliki konstanta aturan baku sesuai SOP pondok (lulus >= 80, skor 5/4/3/2, 9 aspek tajwid)', () => {
    expect(TASMI_PASSING_SCORE).toBe(80);
    expect(TASMI_VALID_SCORES).toEqual([5, 4, 3, 2]);
    expect(TASMI_VALID_GRADES).toEqual(['A', 'B', 'C', 'D']);
    expect(TASMI_TAJWID_ASPEK).toHaveLength(9);
  });

  describe('getTasmiConfigByJuz() - Struktur Pembagian Halaman per Juz', () => {
    it('khusus Juz 30 memiliki 23 halaman (maks skor 115) dengan pembagian blok 6, 6, 6, 5', () => {
      const cfg30 = getTasmiConfigByJuz('30');
      expect(cfg30.totalPages).toBe(23);
      expect(cfg30.maxScore).toBe(115);
      expect(cfg30.blocks.map(b => b.end - b.start + 1)).toEqual([6, 6, 6, 5]);
      expect(cfg30.blocks[0]).toMatchObject({ start: 1, end: 6 });
      expect(cfg30.blocks[1]).toMatchObject({ start: 7, end: 12 });
      expect(cfg30.blocks[2]).toMatchObject({ start: 13, end: 18 });
      expect(cfg30.blocks[3]).toMatchObject({ start: 19, end: 23 });
    });

    it('Juz 1-29 memiliki 20 halaman (maks skor 100) dengan pembagian blok 5, 5, 5, 5', () => {
      const cfg29 = getTasmiConfigByJuz('29');
      expect(cfg29.totalPages).toBe(20);
      expect(cfg29.maxScore).toBe(100);
      expect(cfg29.blocks.map(b => b.end - b.start + 1)).toEqual([5, 5, 5, 5]);
    });
  });

  describe('hitungHasilTasmi() - Juz 1-29 (20 Halaman) & Juz 30 (23 Halaman, Opsi A)', () => {
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

    it('menghitung Juz 30 (23 halaman × 5 = 115) dengan status LULUS', () => {
      const scores30 = {};
      for (let i = 1; i <= 23; i++) scores30[i] = 5;

      const res = hitungHasilTasmi(scores30, '30');
      expect(res.isComplete).toBe(true);
      expect(res.totalPages).toBe(23);
      expect(res.maksimalSkor).toBe(115);
      expect(res.totalSkor).toBe(115);
      expect(res.lulus).toBe(true);
      expect(res.status).toBe('LULUS');
    });

    it('menentukan batas kelulusan Juz 30 (Opsi A): skor mentah 80 LULUS, skor 79 TIDAK LULUS', () => {
      const passScores = {};
      for (let i = 1; i <= 17; i++) passScores[i] = 4; // 68
      for (let i = 18; i <= 23; i++) passScores[i] = 2; // +12 = 80
      const resPass = hitungHasilTasmi(passScores, '30');
      expect(resPass.totalSkor).toBe(80);
      expect(resPass.lulus).toBe(true);
      expect(resPass.status).toBe('LULUS');

      const failScores = { ...passScores, 17: 3 }; // 79
      const resFail = hitungHasilTasmi(failScores, '30');
      expect(resFail.totalSkor).toBe(79);
      expect(resFail.lulus).toBe(false);
      expect(resFail.status).toBe('TIDAK LULUS');
    });

    it('mewajibkan 23 halaman penuh pada Juz 30 (tidak cukup 20 halaman)', () => {
      const incomplete30 = {};
      for (let i = 1; i <= 20; i++) incomplete30[i] = 5; // 100 poin, tapi kurang hal 21-23
      const res = hitungHasilTasmi(incomplete30, '30');
      expect(res.isComplete).toBe(false);
      expect(res.missingPages).toEqual([21, 22, 23]);
      expect(res.lulus).toBe(false);
      expect(res.status).toBe('BELUM LENGKAP');
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

