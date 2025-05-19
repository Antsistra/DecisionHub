import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";

export interface WeightedKriteria {
  weighted_kriteria: any;
  kode: string;
  id: string;
  nama_kriteria: string;
  bobot: number;
  keterangan: string;
  project_id: string; 
}

export const useWeightedKriteria = (projectId?: string) => {
  const [weightedKriteria, setWeightedKriteria] = useState<WeightedKriteria[]>([]);
  const [kriteriaList, setKriteriaList] = useState<WeightedKriteria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKriteriaList = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("weighted_kriteria")
        .select("*")
        .eq("project_id", projectId);

      if (error) throw error;
      setKriteriaList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal mengambil data kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeightedKriteria = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
     
      const { data, error } = await supabase
        .from("keterangan_weighted_kriteria")
        .select(`
          *,
          weighted_kriteria!kriteria_id (
            id,
            nama_kriteria,
            kode,
            project_id
          )
        `)
        .filter('weighted_kriteria.project_id', 'eq', projectId);

      if (error) throw error;
      
 
      const filteredData = data.filter(item => 
        item.weighted_kriteria && item.weighted_kriteria.project_id === projectId
      );
      
      setWeightedKriteria(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal mengambil data pembobotan kriteria");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWeightedKriteria = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("keterangan_weighted_kriteria").delete().eq("id", id);
      if (error) throw error;
      toast.success("Kriteria berhasil dihapus");
      await fetchWeightedKriteria();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addKeteranganWeightedKriteria = async (kriteriaId: string, keterangan: string, bobot: number) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("keterangan_weighted_kriteria")
        .insert([
          {
            kriteria_id: kriteriaId,
            keterangan: keterangan,
            bobot: bobot,
          }
        ]);
     
      if (error) throw error;
      toast.success("Keterangan kriteria berhasil ditambahkan");
      await fetchWeightedKriteria(); 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchWeightedKriteria();
      fetchKriteriaList();
    }
  }, [projectId]);
  
  return {
    weightedKriteria,
    kriteriaList,
    isLoading,
    error,
    fetchWeightedKriteria,
    deleteWeightedKriteria,
    addKeteranganWeightedKriteria
  }
}

