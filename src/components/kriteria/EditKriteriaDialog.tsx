import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Kriteria } from "@/hooks/useKriteria";

interface EditKriteriaDialogProps {
  kriteria: Kriteria;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, nama: string, bobot: number) => Promise<void>;
}

export const EditKriteriaDialog = ({
  kriteria,
  isOpen,
  onClose,
  onUpdate,
}: EditKriteriaDialogProps) => {
  const [namaKriteria, setNamaKriteria] = useState("");
  const [bobot, setBobot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (kriteria) {
      setNamaKriteria(kriteria.nama_kriteria);
      setBobot((kriteria.bobot * 100).toString());
    }
  }, [kriteria]);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!namaKriteria.trim() || !bobot.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onUpdate(
        kriteria.id,
        namaKriteria.trim(),
        parseFloat(bobot.trim())
      );
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Kriteria</DialogTitle>
          <DialogDescription className="text-neutral-600">
            Update informasi Kriteria. Pastikan bobot tidak melebihi total 100%.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nama_kriteria" className="text-right">
              Kriteria
            </Label>
            <Input
              id="nama_kriteria"
              className="col-span-3"
              placeholder="Aspek Sikap Kerja"
              value={namaKriteria}
              onChange={(e) => setNamaKriteria(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bobot" className="text-right">
              Bobot
            </Label>
            <Input
              id="bobot"
              type="number"
              min="0"
              max="100"
              placeholder="60%"
              className="col-span-3"
              value={bobot}
              onChange={(e) => setBobot(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            type="submit"
            disabled={isSubmitting || !namaKriteria.trim() || !bobot.trim()}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
