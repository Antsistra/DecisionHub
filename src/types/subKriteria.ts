export interface SubKriteria {
  id: string;
  kode: string;
  sub_kriteria: string;
  kriteria: string; // This is the ID in the database
  kriteria_obj?: {  // Renamed to avoid name clash with the ID field
    id: string;
    nama_kriteria: string;
    project_id: string;
  };
  faktor: string;
  profil: number;
}