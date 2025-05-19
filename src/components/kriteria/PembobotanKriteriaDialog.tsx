import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWeightedKriteria } from "@/hooks/usePembobotaanKriteria";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface PembobotanKriteriaDialogProps {
  fetchWeightedKriteria: () => Promise<void>;
}

export default function PembobotanKriteriaDialog({
  fetchWeightedKriteria,
}: PembobotanKriteriaDialogProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { addKeteranganWeightedKriteria, kriteriaList, isLoading } =
    useWeightedKriteria(projectId);
  const [selectedKriteria, setSelectedKriteria] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [keteranganFields, setKeteranganFields] = useState([
    { id: Date.now() },
  ]);

  const addKeteranganField = () => {
    setKeteranganFields([...keteranganFields, { id: Date.now() }]);
  };

  const removeKeteranganField = () => {
    if (keteranganFields.length > 1) {
      setKeteranganFields(keteranganFields.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (!selectedKriteria) {
      toast.error("Pilih kriteria terlebih dahulu");
      return;
    }

    for (const field of keteranganFields) {
      const keterangan = (
        document.getElementById(`keterangan-${field.id}`) as HTMLInputElement
      )?.value;
      const bobot = parseInt(
        (document.getElementById(`bobot-${field.id}`) as HTMLInputElement)
          ?.value || "0",
        10
      );

      if (!keterangan || isNaN(bobot)) {
        toast.error("Isi semua field dengan benar");
        return;
      }

      await addKeteranganWeightedKriteria(selectedKriteria, keterangan, bobot);
    }

    setIsOpen(false);
    setKeteranganFields([{ id: Date.now() }]);
    setSelectedKriteria(null);
    await fetchWeightedKriteria();
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedKriteria(null);
      setKeteranganFields([{ id: Date.now() }]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Kriteria</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Kriteria</DialogTitle>
          <DialogDescription className="text-neutral-600">
            Tambahkan Kriteria baru untuk penilaian. Anda dapat menambahkan kode
            dan informasi Kriteria lainnya.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="kriteria" className="text-right">
              Kriteria
            </Label>
            <Select onValueChange={(value) => setSelectedKriteria(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Kriteria" />
              </SelectTrigger>
              <SelectContent>
                {kriteriaList.map((kriteria) => (
                  <SelectItem key={kriteria.id} value={kriteria.id}>
                    {kriteria.nama_kriteria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedKriteria && (
            <>
              {keteranganFields.map((field) => (
                <div key={field.id} className="flex flex-col gap-y-2">
                  <div className="flex gap-x-2">
                    <Label
                      htmlFor={`keterangan-${field.id}`}
                      className="text-right w-1/2"
                    >
                      Keterangan
                    </Label>
                    <Label htmlFor={`bobot-${field.id}`} className="text-right">
                      Bobot
                    </Label>
                  </div>
                  <div className="flex gap-x-2">
                    <Input
                      id={`keterangan-${field.id}`}
                      placeholder="Keterangan"
                      disabled={isLoading}
                      required
                    />
                    <Input
                      id={`bobot-${field.id}`}
                      type="number"
                      placeholder="Bobot Kriteria"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addKeteranganField} variant={"secondary"}>
                Tambahkan Keterangan
              </Button>
              <Button onClick={removeKeteranganField} variant={"destructive"}>
                Kurangi Keterangan
              </Button>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Tambahkan Pembobotan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
