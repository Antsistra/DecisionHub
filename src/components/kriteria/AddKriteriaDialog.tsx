import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddKriteriaDialogProps {
  onAdd: (kriteria: string, bobot: number) => Promise<void>;
}

export const AddKriteriaDialog = ({ onAdd }: AddKriteriaDialogProps) => {
  const [kriteria, setKriteria] = useState("");
  const [bobot, setBobot] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!kriteria.trim() || !bobot.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(kriteria.trim(), parseFloat(bobot.trim()));
      setKriteria("");
      setBobot("");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setKriteria("");
      setBobot("");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kode" className="text-right">
              Kriteria
            </Label>
            <Input
              id="kriteria"
              className="col-span-3"
              placeholder="Aspek Sikap Kerja"
              value={kriteria}
              onChange={(e) => setKriteria(e.target.value)}
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
            disabled={isSubmitting || !kriteria.trim() || !bobot.trim()}
          >
            {isSubmitting ? "Menambahkan..." : "Tambahkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
