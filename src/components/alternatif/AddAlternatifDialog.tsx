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

interface AddAlternatifDialogProps {
  onAdd: (kode: string, nama: string) => Promise<void>;
}

export const AddAlternatifDialog = ({ onAdd }: AddAlternatifDialogProps) => {
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!kode.trim() || !nama.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(kode.trim(), nama.trim());
      setKode("");
      setNama("");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setKode("");
      setNama("");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Tambah</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Alternatif</DialogTitle>
          <DialogDescription className="text-neutral-600">
            Tambahkan alternatif baru untuk penilaian. Anda dapat menambahkan
            kode dan informasi alternatif lainnya.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kode" className="text-right">
              Kode
            </Label>
            <Input
              id="kode"
              className="col-span-3"
              placeholder="A0001"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nama" className="text-right">
              Nama
            </Label>
            <Input
              id="nama"
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
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !kode.trim() || !nama.trim()}
          >
            {isSubmitting ? "Menambahkan..." : "Tambahkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
