import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";

export interface Kriteria {
  id: string;
  nama_kriteria: string;
  bobot: number;
  jenis: string;
}

export const useKriteria = (projectId?: string) => {
  const [kriteria, setKriteria] = useState<Kriteria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKriteria = async () => {
    setIsLoading(true);
    try {
      const query = supabase.from("kriteria").select("*");
      
      
      if (projectId) {
        query.eq("project_id", projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setKriteria(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal mengambil data kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalWeight = (): number => {
    return kriteria.reduce((total, item) => total + item.bobot, 0);
  };

  const addKriteria = async (kriteria: string, bobot: number) => {
    setIsLoading(true); 
    try {
  

      const currentTotalWeight = calculateTotalWeight();
      const newTotalWeight = currentTotalWeight + (bobot/100);

      if (newTotalWeight > 1) {
        toast.error(`Total bobot tidak boleh melebihi 100%. Total saat ini: ${(currentTotalWeight * 100).toFixed(0)}%`);
        return;
      }

      const { error } = await supabase.from("kriteria").insert([
        {
          nama_kriteria : kriteria,
          bobot:bobot/100,
          project_id: projectId,
        },
      ]);
      
      if (error) throw error;
      
      toast.success("Kriteria berhasil ditambahkan");
      await fetchKriteria();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Gagal menambahkan kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const updateKriteria = async (id: string, nama: string, bobot: number) => {
    setIsLoading(true);
    try {

      const kriteriaToUpdate = kriteria.find(k => k.id === id);
      if (!kriteriaToUpdate) {
        throw new Error("Kriteria tidak ditemukan");
      }
      

      const currentTotalWeight = calculateTotalWeight();
      const newTotalWeight = currentTotalWeight - kriteriaToUpdate.bobot + (bobot/100);

      if (newTotalWeight > 1) {
        toast.error(`Total bobot tidak boleh melebihi 100%. Total setelah perubahan: ${(newTotalWeight * 100).toFixed(0)}%`);
        return;
      }

      // Update kriteria di database
      const { error } = await supabase
        .from("kriteria")
        .update({
          nama_kriteria: nama,
          bobot: bobot/100
        })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Kriteria berhasil diperbarui");
      await fetchKriteria();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Gagal memperbarui kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteKriteria = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("kriteria").delete().eq("id", id);
      if (error) throw error;
      toast.success("Kriteria berhasil dihapus");
      await fetchKriteria();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal menghapus kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKriteria();
  }, [projectId]);

  return {
    kriteria,
    isLoading,
    error,
    addKriteria,
    updateKriteria,
    deleteKriteria,
    fetchKriteria,
  };
};