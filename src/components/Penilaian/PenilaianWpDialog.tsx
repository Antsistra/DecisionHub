import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { useParams } from "react-router-dom";
import { Label } from "../ui/label";
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
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "../ui/badge";
interface PenilaianWpDialogProps {
  alternatifId: string;
  onComplete?: () => void;
}

const createPenilaianSchema = (kriteria: any[]) => {
  const schemaFields: Record<string, z.ZodNumber> = {};

  kriteria.forEach((item) => {
    schemaFields[item.id] = z
      .number({
        required_error: `Nilai ${item.nama_kriteria} wajib diisi`,
        invalid_type_error: "Harus berupa angka",
      })
      .min(0, "Nilai tidak boleh negatif");
  });

  return z.object(schemaFields);
};

export default function PenilaianWpDialog(props: PenilaianWpDialogProps) {
  const { projectId } = useParams();
  const [alternatif, setAlternatif] = useState<any[]>([]);
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [keterangan, setKeterangan] = useState<Record<string, any[]> | null>(
    null
  );
  const [selectedValues, setSelectedValues] = useState<Record<string, number>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingValues, setExistingValues] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  // Create form schema
  const schema = createPenilaianSchema(kriteria);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: selectedValues,
  });

  const fetchWeightedKriteria = async () => {
    const { data, error } = await supabase
      .from("weighted_kriteria")
      .select("*")
      .eq("project_id", projectId);
    if (error) {
      console.error("Error fetching kriteria:", error);
    } else {
      setKriteria(data);
    }
  };

  const fetchAlternatif = async () => {
    const { data, error } = await supabase
      .from("alternatif")
      .select("*")
      .eq("id", props.alternatifId);
    if (error) {
      console.error("Error fetching alternatif:", error);
    } else {
      setAlternatif(data);
    }
  };

  const fetchKeterangan = async () => {
    const { data, error } = await supabase
      .from("keterangan_weighted_kriteria")
      .select("kriteria_id, keterangan, bobot");
    if (error) {
      console.error("Error fetching keterangan:", error);
    } else {
      // Group keterangan by kriteria_id
      const groupedKeterangan = data.reduce((acc: any, item: any) => {
        if (!acc[item.kriteria_id]) {
          acc[item.kriteria_id] = [];
        }
        acc[item.kriteria_id].push(item);
        return acc;
      }, {});
      setKeterangan(groupedKeterangan);
    }
  };

  const fetchExistingValues = async () => {
    const { data, error } = await supabase
      .from("nilai_wp")
      .select("*")
      .eq("alternatif_id", props.alternatifId);

    if (error) {
      console.error("Error fetching existing values:", error);
    } else {
      setExistingValues(data || []);

      const values: Record<string, number> = {};
      data?.forEach((item: any) => {
        values[item.weighted_kriteria_id] = item.nilai;
      });
      setSelectedValues(values);
    }
  };

  useEffect(() => {
    if (open) {
      fetchWeightedKriteria();
      fetchAlternatif();
      fetchKeterangan();
      fetchExistingValues();
    }
  }, [projectId, props.alternatifId, open]);

  useEffect(() => {
    if (Object.keys(selectedValues).length > 0) {
      Object.entries(selectedValues).forEach(([key, value]) => {
        form.setValue(key, value);
      });
    }
  }, [selectedValues]);

  const handleValueChange = (kriteriaId: string, value: number) => {
    form.setValue(kriteriaId, value);
  };

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    setIsSubmitting(true);
    try {
      const valuesToUpsert = Object.entries(values).map(
        ([kriteriaId, nilai]) => ({
          alternatif_id: props.alternatifId,
          weighted_kriteria_id: kriteriaId,
          nilai: nilai,
        })
      );

      const { error: deleteError } = await supabase
        .from("nilai_wp")
        .delete()
        .eq("alternatif_id", props.alternatifId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from("nilai_wp")
        .insert(valuesToUpsert);

      if (insertError) throw insertError;

      await fetchExistingValues();
      toast.success(
        existingValues.length > 0
          ? "Berhasil mengupdate nilai alternatif"
          : "Berhasil menambahkan nilai alternatif"
      );

      if (props.onComplete) {
        props.onComplete();
      }

      setOpen(false);
    } catch (error) {
      console.error("Error updating values:", error);
      toast.error("Gagal menyimpan nilai alternatif");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nilai</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {alternatif[0]?.nama ? (
              <>
                Penilaian:{" "}
                <span className="font-semibold">{alternatif[0]?.nama}</span>
              </>
            ) : (
              "Loading..."
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {kriteria.map((item) => (
            <div key={item.id} className="space-y-2 border p-3 rounded-md">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  {item.nama_kriteria}
                </Label>
                {item.jenis === "benefit" ? (
                  <Badge className="bg-green-500">Benefit</Badge>
                ) : (
                  <Badge className="bg-red-500">Cost</Badge>
                )}
              </div>

              {keterangan && keterangan[item.id]?.length > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Pilih salah satu nilai yang sesuai:
                  </p>
                  <Select
                    value={form.watch(item.id)?.toString()}
                    onValueChange={(value) =>
                      handleValueChange(item.id, parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Keterangan" />
                    </SelectTrigger>
                    <SelectContent>
                      {keterangan[item.id]?.map((keteranganItem) => (
                        <SelectItem
                          key={keteranganItem.keterangan}
                          value={keteranganItem.bobot.toString()}
                        >
                          {keteranganItem.keterangan} (Bobot:{" "}
                          {keteranganItem.bobot})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Masukkan nilai numerik:
                  </p>
                  <Input
                    type="number"
                    placeholder="Masukkan nilai"
                    className="w-full"
                    {...form.register(item.id, { valueAsNumber: true })}
                  />
                </>
              )}
              {form.formState.errors[item.id] && (
                <p className="text-sm text-red-500">
                  {form.formState.errors[item.id]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="pt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : existingValues.length > 0
                ? "Update Nilai"
                : "Simpan Nilai"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
