import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import { SubKriteria } from "@/types/subKriteria";

export const useSubKriteria = (projectId?: string) => {
  const [subKriteria, setSubKriteria] = useState<SubKriteria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchSubKriteria = async () => {
    setIsLoading(true);
    try {
      console.log(projectId);
      const { data, error } = await supabase
        .from("sub_kriteria")
        .select(`
          *,
          kriteria_obj:kriteria (
            id,
            nama_kriteria,
            project_id
          )
        `)
        .eq("kriteria_obj.project_id", projectId);
  
      if (error) throw error;
  
      // Filter data untuk menghapus item dengan kriteria null
      const filteredData = data?.filter((item) => item.kriteria_obj !== null);
  
      setSubKriteria(filteredData || []);
      console.log("Sub Kriteria data:", filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal mengambil data sub kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const addSubKriteria = async (
    kode: string,
    subKriteria: string,
    kriteriaId: string,
    faktor: string,
    profil: number,

  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("sub_kriteria").insert([
        {
          sub_kriteria: subKriteria,
          kode: kode,
          kriteria: kriteriaId,
          faktor,
          profil,
        },
      ]);
      
      if (error) throw error;
      
      toast.success("Sub Kriteria berhasil ditambahkan");
      await fetchSubKriteria();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Gagal menambahkan sub kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubKriteria = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("sub_kriteria").delete().eq("id", id);
      if (error) throw error;
      toast.success("Sub Kriteria berhasil dihapus");
      await fetchSubKriteria();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal menghapus sub kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubKriteria = async (
    id: string,
    kode: string,
    subKriteria: string,
    kriteriaId: string,
    faktor: string,
    profil: number,
  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("sub_kriteria")
        .update({
          sub_kriteria: subKriteria,
          kode: kode,
          kriteria: kriteriaId,
          faktor,
          profil,
        })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Sub Kriteria berhasil diperbarui");
      await fetchSubKriteria();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Gagal memperbarui sub kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubKriteria();
  }, [projectId]);

  return {
    subKriteria,
    isLoading,
    error,
    addSubKriteria,
    deleteSubKriteria,
    updateSubKriteria,
    fetchSubKriteria,
  };
};