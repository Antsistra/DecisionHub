import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { WeightedKriteria } from "@/hooks/useWeightedKriteria";

interface EditWeightedKriteriaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (
    id: string,
    kriteria: string,
    keterangan: string,
    bobot: number,
    kode: string
  ) => Promise<void>;
  kriteria: WeightedKriteria | null;
}

export const EditWeightedKriteriaDialog = ({
  isOpen,
  onClose,
  onUpdate,
  kriteria,
}: EditWeightedKriteriaDialogProps) => {
  const [namaKriteria, setNamaKriteria] = useState("");
  const [bobot, setBobot] = useState(0);
  const [keterangan, setKeterangan] = useState("");
  const [kode, setKode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (kriteria) {
      setNamaKriteria(kriteria.nama_kriteria);
      setBobot(kriteria.bobot);
      setKeterangan(kriteria.keterangan);
      setKode(kriteria.kode);
    }
  }, [kriteria]);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!namaKriteria.trim() || !bobot || !keterangan.trim() || !kriteria) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onUpdate(kriteria.id, namaKriteria.trim(), keterangan, bobot, kode);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kriteria</DialogTitle>
          <DialogDescription className="text-neutral-600">
            Ubah data kriteria yang sudah ada. Perubahan akan mempengaruhi hasil
            perhitungan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="kode">Kode</Label>
            <Input
              id="kode"
              placeholder="C1"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="namaKriteria">Kriteria</Label>
            <Input
              id="namaKriteria"
              placeholder="Kriteria"
              value={namaKriteria}
              onChange={(e) => setNamaKriteria(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bobot">Bobot</Label>
            <Input
              id="bobot"
              placeholder="Bobot"
              type="number"
              value={bobot}
              onChange={(e) => setBobot(e.target.valueAsNumber)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Select value={keterangan} onValueChange={setKeterangan}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Pilih Keterangan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="benefit"
                  className="cursor-pointer hover:bg-neutral-100"
                >
                  Benefit
                </SelectItem>
                <SelectItem
                  value="cost"
                  className="cursor-pointer hover:bg-neutral-100"
                >
                  Cost
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            type="submit"
            disabled={
              isSubmitting ||
              !namaKriteria.trim() ||
              !bobot ||
              !keterangan.trim()
            }
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
