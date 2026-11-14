import { describe, it, expect } from 'vitest';
import { isSameSantriId, findSantriById, getSantriDisplayName } from '../js/core.js';

describe('Santri ID & Name Resolution (findSantriById, isSameSantriId)', () => {
  const mockSantriList = [
    { ID_Santri: 'ZQ-2026-2FH7', Nama_Santri: 'Ahmad Fatih', ID_Ustadz: 'U07' },
    { ID_Santri: 'ST-2026-Q5GW', Nama_Santri: 'Muhammad Bilal', ID_Ustadz: 'U07' },
    { ID_Santri: 'ZQ-2026-VOS7 ', Nama_Santri: 'Zaid bin Tsabit', ID_Ustadz: 'U07' },
    { ID_Santri: 'ZQ-2026-V2MA', Nama_Santri: 'Umar Al-Faruq', ID_Ustadz: 'U07' },
    { ID_Santri: 'ZQ-2026-LATH', Nama_Santri: 'LATHIFATUS SALMA KHOIRIYAH', ID_Ustadz: 'U07' }
  ];

  describe('isSameSantriId()', () => {
    it('mencocokkan ID eksak', () => {
      expect(isSameSantriId('ZQ-2026-2FH7', 'ZQ-2026-2FH7')).toBe(true);
      expect(isSameSantriId('zq-2026-2fh7', 'ZQ-2026-2FH7')).toBe(true);
    });

    it('mentoleransi perbedaan prefiks legacy (ST- vs ZQ-)', () => {
      expect(isSameSantriId('ST-2026-2FH7', 'ZQ-2026-2FH7')).toBe(true);
      expect(isSameSantriId('ZQ-2026-Q5GW', 'ST-2026-Q5GW')).toBe(true);
      expect(isSameSantriId('ST-2026-V2MA', 'ZQ-2026-V2MA')).toBe(true);
    });

    it('mentoleransi spasi leading dan trailing', () => {
      expect(isSameSantriId(' ZQ-2026-2FH7 ', 'ST-2026-2FH7')).toBe(true);
      expect(isSameSantriId('ZQ-2026-VOS7 ', 'ZQ-2026-VOS7')).toBe(true);
    });

    it('menolak ID yang benar-benar berbeda', () => {
      expect(isSameSantriId('ZQ-2026-2FH7', 'ZQ-2026-XXXX')).toBe(false);
      expect(isSameSantriId('', 'ZQ-2026-2FH7')).toBe(false);
      expect(isSameSantriId(null, undefined)).toBe(false);
    });
  });

  describe('findSantriById()', () => {
    it('menemukan santri dengan ID eksak', () => {
      const s = findSantriById(mockSantriList, 'ZQ-2026-2FH7');
      expect(s).not.toBeNull();
      expect(s.Nama_Santri).toBe('Ahmad Fatih');
    });

    it('menemukan santri ketika setoran memakai prefiks legacy ST- sedangkan master memakai ZQ-', () => {
      const s = findSantriById(mockSantriList, 'ST-2026-2FH7');
      expect(s).not.toBeNull();
      expect(s.Nama_Santri).toBe('Ahmad Fatih');
    });

    it('menemukan santri ketika setoran memakai ZQ- sedangkan master memakai ST-', () => {
      const s = findSantriById(mockSantriList, 'ZQ-2026-Q5GW');
      expect(s).not.toBeNull();
      expect(s.Nama_Santri).toBe('Muhammad Bilal');
    });

    it('menemukan santri dengan ID berspasi', () => {
      const s = findSantriById(mockSantriList, 'ZQ-2026-VOS7');
      expect(s).not.toBeNull();
      expect(s.Nama_Santri).toBe('Zaid bin Tsabit');
    });

    it('menemukan santri jika query adalah nama lengkap santri', () => {
      const s = findSantriById(mockSantriList, 'LATHIFATUS SALMA KHOIRIYAH');
      expect(s).not.toBeNull();
      expect(s.ID_Santri).toBe('ZQ-2026-LATH');
    });

    it('mengembalikan null jika santri tidak ditemukan sama sekali', () => {
      expect(findSantriById(mockSantriList, 'ZQ-9999-NOTFOUND')).toBeNull();
      expect(findSantriById([], 'ZQ-2026-2FH7')).toBeNull();
      expect(findSantriById(null, 'ZQ-2026-2FH7')).toBeNull();
    });
  });

  describe('getSantriDisplayName()', () => {
    it('mengembalikan nama santri jika ID cocok', () => {
      expect(getSantriDisplayName(mockSantriList, 'ST-2026-2FH7')).toBe('Ahmad Fatih');
      expect(getSantriDisplayName(mockSantriList, 'ZQ-2026-Q5GW')).toBe('Muhammad Bilal');
      expect(getSantriDisplayName(mockSantriList, 'ST-2026-V2MA')).toBe('Umar Al-Faruq');
    });

    it('mengembalikan ID bersih jika tidak ditemukan santri yang cocok', () => {
      expect(getSantriDisplayName(mockSantriList, 'ZQ-2026-UNKNOWN')).toBe('ZQ-2026-UNKNOWN');
      expect(getSantriDisplayName(mockSantriList, '', 'Santri Anonim')).toBe('Santri Anonim');
    });
  });
});
