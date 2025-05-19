import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { useParams } from "react-router-dom";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

interface AddNilaiDialogProps {
  nama: string;
  alternatifId: string;
}

export default function AddNilaiDialog(props: AddNilaiDialogProps) {
  const { projectId } = useParams<{ projectId: string }>();

  const [kriteria, setKriteria] = useState<any[]>([]);
  const [subKriteria, setSubKriteria] = useState<any[]>([]);
  const [nilai, setNilai] = useState<{ [subKriteriaId: string]: number }>({});
  const [nilaiExisting, setNilaiExisting] = useState<{
    [subKriteriaId: string]: any;
  }>({});

  const fetchKriteria = async () => {
    const { data, error } = await supabase
      .from("kriteria")
      .select("*")
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching kriteria:", error);
    } else {
      setKriteria(data || []);
    }
  };

  const fetchSubKriteria = async (kriteriaId: string) => {
    const { data, error } = await supabase
      .from("sub_kriteria")
      .select("*")
      .eq("kriteria", kriteriaId);

    if (error) {
      console.error("Error fetching sub kriteria:", error);
    } else {
      setSubKriteria(data || []);
      setNilai({});
      fetchExistingNilai(props.alternatifId);
    }
  };

  const fetchExistingNilai = async (alternatifId: string) => {
    const { data, error } = await supabase
      .from("nilai")
      .select("*")
      .eq("alternatif_id", alternatifId);

    if (error) {
      console.error("Gagal fetch nilai:", error);
    } else {
      const nilaiMap: { [subKriteriaId: string]: any } = {};
      data.forEach((item: any) => {
        nilaiMap[item.subKriteria_id] = item;
      });
      setNilaiExisting(nilaiMap);

      const nilaiBaru: { [subKriteriaId: string]: number } = {};
      data.forEach((item: any) => {
        nilaiBaru[item.subKriteria_id] = item.nilai;
      });
      setNilai(nilaiBaru);
    }
  };

  const handleNilaiChange = (subKriteriaId: string, value: number) => {
    setNilai((prev) => ({
      ...prev,
      [subKriteriaId]: value,
    }));
  };

  const convertGapToBobot = (gap: number) => {
    switch (gap) {
      case 0:
        return 5.0; // Tidak ada selisih
      case 1:
        return 4.5; // Kompetensi individu kelebihan 1 tingkat
      case -1:
        return 4.0; // Kompetensi individu kekurangan 1 tingkat
      case 2:
        return 3.5; // Kompetensi individu kelebihan 2 tingkat
      case -2:
        return 3.0; // Kompetensi individu kekurangan 2 tingkat
      case 3:
        return 2.5; // Kompetensi individu kelebihan 3 tingkat
      case -3:
        return 2.0; // Kompetensi individu kekurangan 3 tingkat
      case 4:
        return 1.5; // Kompetensi individu kelebihan 4 tingkat
      case -4:
        return 1.0; // Kompetensi individu kekurangan 4 tingkat
      default:
        if (gap > 4) return 1.5;
        if (gap < -4) return 1.0;
        return 0;
    }
  };
  const handleKriteriaChange = (kriteriaId: string) => {
    fetchSubKriteria(kriteriaId);
  };

  const handleSubmit = async () => {
    const nilaiArray = subKriteria.map((sub) => {
      const nilaiInput = nilai[sub.id];
      const nilaiTarget = sub.profil;
      const gap = nilaiInput - nilaiTarget;
      const nilaiBobot = convertGapToBobot(gap);

      const nilaiData: any = {
        alternatif_id: props.alternatifId,
        subKriteria_id: sub.id,
        nilai: nilaiInput,
        nilai_gap: gap,
        nilai_bobot: nilaiBobot,
      };

      if (nilaiExisting[sub.id]?.id) {
        nilaiData.id = nilaiExisting[sub.id].id;
      }

      return nilaiData;
    });

    const { error } = await supabase
      .from("nilai")
      .upsert(nilaiArray, { onConflict: "id" });

    if (error) {
      console.error("Gagal menyimpan nilai:", error);
      alert("Gagal menyimpan nilai.");
    } else {
      toast.success("Nilai berhasil disimpan!");
      setNilai({});
      setSubKriteria([]);
      setNilaiExisting({});

      const refreshEvent = new CustomEvent("refreshPenilaianData", {
        detail: { alternatifId: props.alternatifId },
      });
      window.dispatchEvent(refreshEvent);
    }
  };

  useEffect(() => {
    fetchKriteria();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Nilai</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{props.nama}</DialogTitle>
        </DialogHeader>

        {/* Select Kriteria */}
        <div className="grid mt-4">
          <Select onValueChange={handleKriteriaChange}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Pilih Kriteria Penilaian" />
            </SelectTrigger>
            <SelectContent>
              {kriteria.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.nama_kriteria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input Nilai Sub Kriteria */}
        {subKriteria.length > 0 ? (
          subKriteria.map((sub) => (
            <div key={sub.id} className="grid gap-2 mt-4">
              <Label htmlFor={sub.id}>{sub.sub_kriteria}</Label>
              <Input
                type="number"
                id={sub.id}
                placeholder={`Masukkan nilai ${sub.sub_kriteria}`}
                value={nilai[sub.id] || ""}
                onChange={(e) =>
                  handleNilaiChange(sub.id, parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
          ))
        ) : (
          <h1 className="text-center text-neutral-500 font-light mt-6">
            Sub Kriteria Tidak Tersedia
          </h1>
        )}

        {/* Tombol Simpan */}
        {subKriteria.length > 0 && (
          <div className="w-full mt-4">
            <Button className="w-full" onClick={handleSubmit}>
              Simpan Nilai
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
