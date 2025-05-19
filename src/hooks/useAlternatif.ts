import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";

interface Alternatif {
  id: string;
  kode: string;
  nama: string;
  status: string;
  project_id?: string;
}

export const useAlternatif = (projectId?: string) => {
  const [alternatif, setAlternatif] = useState<Alternatif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlternatif = async () => {
    setIsLoading(true);
    try {
      const query = supabase.from("alternatif").select("*");
      
      if (projectId) {
        query.eq("project_id", projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setAlternatif(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal mengambil data alternatif");
    } finally {
      setIsLoading(false);
    }
  };

  const checkKodeExists = async (kode: string): Promise<boolean> => {
    const query = supabase
      .from("alternatif")
      .select("kode")
      .eq("kode", kode);

    if (projectId) {
      query.eq("project_id", projectId);
    }
    
    const { data, error } = await query.single();
    
    if (error && error.code !== "PGRST116") { // PGRST116 is the error code for no rows returned
      throw error;
    }
    
    return !!data;
  };

  const addAlternatif = async (kode: string, nama: string) => {
    setIsLoading(true);
    try {
    
      const exists = await checkKodeExists(kode);
      if (exists) {
        toast.error("Kode alternatif sudah digunakan");
        return;
      }

      const { error } = await supabase.from("alternatif").insert([
        {
          kode,
          nama,
          status: "Belum Dinilai",
          project_id: projectId,
        },
      ]);
      
      if (error) throw error;
      
      toast.success("Alternatif berhasil ditambahkan");
      await fetchAlternatif();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Gagal menambahkan alternatif");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAlternatif = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("alternatif").delete().eq("id", id);
      if (error) throw error;
      toast.success("Alternatif berhasil dihapus");
      await fetchAlternatif();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Gagal menghapus alternatif");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAlternatif = async (id: string, kode: string, nama: string) => {
    setIsLoading(true);
    try {
      
      const { data: existingData } = await supabase
        .from("alternatif")
        .select("kode, project_id")
        .eq("kode", kode)
        .neq("id", id);
      
      if (projectId) {
     
        existingData?.filter(item => item.project_id === projectId);
      }
      
      if (existingData && existingData.length > 0) {
        toast.error("Kode alternatif sudah digunakan");
        return;
      }

      const { error } = await supabase
        .from("alternatif")
        .update({ kode, nama })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Alternatif berhasil diperbarui");
      await fetchAlternatif();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Gagal memperbarui alternatif");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlternatif();
  }, [projectId]);

  return {
    alternatif,
    isLoading,
    error,
    addAlternatif,
    deleteAlternatif,
    updateAlternatif,
    fetchAlternatif,
  };
};