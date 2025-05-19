import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
interface AddWeightedKriteriaDialogProps {
  onAdd: (
    kriteria: string,
    keterangan: string,
    bobot: number,
    kode: string
  ) => Promise<void>;
}

export const AddWeightedKriteriaDialog = ({
  onAdd,
}: AddWeightedKriteriaDialogProps) => {
  const [kriteria, setKriteria] = useState("");
  const [bobot, setBobot] = useState(0);
  const [keterangan, setKeterangan] = useState("");
  const [kode, setKode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!kriteria.trim() || !bobot || !keterangan.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(kriteria.trim(), keterangan, bobot, kode);
      setKriteria("");
      setBobot(0);
      setKeterangan("");
      setKode("");
      setIsOpen(false);
      toast.success("Kriteria berhasil ditambahkan");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setKriteria("");
      setBobot(0);
      setKeterangan("");
      setKode("");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Kriteria</DialogTitle>
          <DialogDescription className="text-neutral-600">
            Tambahkan Kriteria baru untuk penilaian. Anda dapat menambahkan kode
            dan informasi Kriteria lainnya.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 ">
          <div className="grid gap-2">
            <Label htmlFor="kriteria">Kode</Label>
            <Input
              id="Kode"
              placeholder="C1"
              onChange={(e) => setKode(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="kriteria">Kriteria</Label>
            <Input
              id="kriteria"
              placeholder="Kriteria"
              onChange={(e) => setKriteria(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bobot">Bobot</Label>
            <Input
              id="bobot"
              placeholder="Bobot"
              type="number"
              onChange={(e) => setBobot(e.target.valueAsNumber)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Select onValueChange={setKeterangan}>
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
        <Button
          onClick={handleSubmit}
          type="submit"
          disabled={
            isSubmitting || !kriteria.trim() || !bobot || !keterangan.trim()
          }
        >
          {isSubmitting ? "Menambahkan..." : "Tambahkan"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
