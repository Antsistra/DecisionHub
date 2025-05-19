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

interface EditAlternatifDialogProps {
  alternatif: {
    id: string;
    kode: string;
    nama: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, kode: string, nama: string) => Promise<void>;
}

export const EditAlternatifDialog = ({
  alternatif,
  isOpen,
  onClose,
  onUpdate,
}: EditAlternatifDialogProps) => {
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (alternatif) {
      setKode(alternatif.kode);
      setNama(alternatif.nama);
    }
  }, [alternatif]);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!alternatif || !kode.trim() || !nama.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(alternatif.id, kode.trim(), nama.trim());
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
          <DialogTitle>Edit Alternatif</DialogTitle>
          <DialogDescription className="text-neutral-600">
            Perbarui informasi alternatif yang sudah ada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-kode" className="text-right">
              Kode
            </Label>
            <Input
              id="edit-kode"
              className="col-span-3"
              placeholder="A0001"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-nama" className="text-right">
              Nama
            </Label>
            <Input
              id="edit-nama"
              placeholder="John Doe"
              className="col-span-3"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !kode.trim() || !nama.trim()}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
