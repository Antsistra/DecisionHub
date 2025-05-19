import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";

export interface WeightedKriteria {
  kode: string;
  id: string;
  nama_kriteria: string;
  bobot: number;
  keterangan: string;
}

export const useWeightedKriteria = (projectId?: string) => {
  const [weightedKriteria, setWeightedKriteria] = useState<WeightedKriteria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeightedKriteria = async () => {
    setIsLoading(true);
    try {
      const query = supabase.from("weighted_kriteria").select("*");
      
      
      if (projectId) {
        query.eq("project_id", projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setWeightedKriteria(data);
      console.log(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal mengambil data kriteria");
    } finally {
      setIsLoading(false);
    }
  };


  const addWeightedKriteria = async (kriteria: string, keterangan:string, bobot: number,kode:string) => {
    setIsLoading(true); 
    try {
      const { error } = await supabase.from("weighted_kriteria").insert([
        {
         nama_kriteria: kriteria,
         keterangan,
         bobot,
        project_id: projectId,
        kode
        },
      ]);
      
      if (error) throw error;
      
      toast.success("Kriteria berhasil ditambahkan");
      await fetchWeightedKriteria();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Gagal menambahkan kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWeightedKriteria = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("weighted_kriteria").delete().eq("id", id);
      if (error) throw error;
      toast.success("Kriteria berhasil dihapus");
      await fetchWeightedKriteria();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal menghapus kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const updateWeightedKriteria = async (id: string, kriteria: string, keterangan: string, bobot: number, kode: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("weighted_kriteria")
        .update({
          nama_kriteria: kriteria,
          keterangan,
          bobot,
          kode
        })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Kriteria berhasil diperbarui");
      await fetchWeightedKriteria();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Gagal memperbarui kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightedKriteria();
  }, [projectId]);


  return{
    weightedKriteria,
    isLoading,
    error,
    addWeightedKriteria,
    fetchWeightedKriteria,
    deleteWeightedKriteria,
    updateWeightedKriteria,
  }
}



