import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Ustadz Rekap Actions (View, Edit, Delete)', () => {
  const htmlPath = path.resolve(__dirname, '../ustadz.html');
  const jsPath = path.resolve(__dirname, '../js/ustadz.js');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  it('memastikan kolom Aksi di ustadz.html memiliki lebar yang cukup', () => {
    expect(htmlContent).toContain('<th class="py-3 px-4 font-semibold text-center min-w-[150px]">Aksi</th>');
  });

  it('memastikan modal View Setoran (modalViewSetoran) tersedia dalam DOM', () => {
    expect(htmlContent).toContain('id="modalViewSetoran"');
    expect(htmlContent).toContain('id="viewSetoranSubtitle"');
    expect(htmlContent).toContain('id="viewSetoranBody"');
    expect(htmlContent).toContain('id="viewSetoranFooter"');
    expect(htmlContent).toContain('closeModalViewSetoran()');
  });

  it('memastikan modal Edit Setoran (modalEditSetoran) tersedia dalam DOM', () => {
    expect(htmlContent).toContain('id="modalEditSetoran"');
    expect(htmlContent).toContain('id="formEditSetoranModal"');
    expect(htmlContent).toContain('id="editSetoranSantri"');
    expect(htmlContent).toContain('id="editSetoranJenis"');
    expect(htmlContent).toContain('id="editSetoranTM"');
    expect(htmlContent).toContain('id="editSetoranTanggal"');
    expect(htmlContent).toContain('id="editSetoranSurah"');
    expect(htmlContent).toContain('id="editSetoranAyat"');
    expect(htmlContent).toContain('id="editSetoranPredikat"');
    expect(htmlContent).toContain('id="editSetoranCatatan"');
  });

  it('memastikan baris tabel merender tombol aksi View, Edit, dan Delete', () => {
    expect(jsContent).toContain("openViewSetoran('${set.ID_Setoran}')");
    expect(jsContent).toContain("openEditSetoran('${set.ID_Setoran}')");
    expect(jsContent).toContain("deleteSetoranUstadz('${set.ID_Setoran}')");
    expect(jsContent).toContain('fa-eye');
    expect(jsContent).toContain('fa-pen-to-square');
    expect(jsContent).toContain('fa-trash-can');
  });

  it('memastikan fungsi handler openViewSetoran, openEditSetoran, dan deleteSetoranUstadz terdefinisi', () => {
    expect(jsContent).toContain('function openViewSetoran(');
    expect(jsContent).toContain('function closeModalViewSetoran(');
    expect(jsContent).toContain('function openEditSetoran(');
    expect(jsContent).toContain('function closeModalEditSetoran(');
    expect(jsContent).toContain('function saveEditedSetoran(');
    expect(jsContent).toContain('function deleteSetoranUstadz(');
  });

  it('memastikan fungsi aksi diekspos ke window untuk interoperabilitas browser', () => {
    expect(jsContent).toContain('window.openViewSetoran = openViewSetoran;');
    expect(jsContent).toContain('window.openEditSetoran = openEditSetoran;');
    expect(jsContent).toContain('window.deleteSetoranUstadz = deleteSetoranUstadz;');
  });
});

