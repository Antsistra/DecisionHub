import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import supabase from "@/utils/supabase";
import { useParams } from "react-router-dom";
import { SubKriteria } from "@/types/subKriteria";

interface EditSubKriteriaDialogProps {
  onUpdate: (
    id: string,
    kode: string,
    subKriteria: string,
    kriteriaId: string,
    faktor: string,
    profil: number
  ) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subKriteria: SubKriteria;
}

const schema = z.object({
  kode: z.string().nonempty("Kode Kriteria harus diisi"),
  subKriteria: z.string().nonempty("Sub Kriteria harus diisi"),
  kriteriaId: z.string().nonempty("Kriteria harus dipilih"),
  faktor: z.string().nonempty("Faktor harus dipilih"),
  profil: z.number().min(1, "Profil harus dipilih"),
});

export const EditSubKriteriaDialog = ({
  onUpdate,
  open,
  onOpenChange,
  subKriteria,
}: EditSubKriteriaDialogProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kriteriaList, setKriteriaList] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      kode: "",
      subKriteria: "",
      kriteriaId: "",
      faktor: "",
      profil: 0,
    },
  });

  useEffect(() => {
    fetchKriteria();
  }, []);

  useEffect(() => {
    if (subKriteria && open) {
      setValue("kode", subKriteria.kode);
      setValue("subKriteria", subKriteria.sub_kriteria);
      setValue("kriteriaId", subKriteria.kriteria);
      setValue("faktor", subKriteria.faktor);
      setValue("profil", subKriteria.profil);
    }
  }, [subKriteria, open, setValue]);

  const fetchKriteria = async () => {
    const { data, error } = await supabase
      .from("kriteria")
      .select("*")
      .eq("project_id", projectId);
    if (error) {
      console.error("Error fetching kriteria:", error);
    } else {
      setKriteriaList(data);
    }
  };
  const onSubmit = async (data: any) => {
    if (!subKriteria) return;

    setIsSubmitting(true);
    try {
      await onUpdate(
        subKriteria.id,
        data.kode,
        data.subKriteria,
        data.kriteriaId,
        data.faktor,
        data.profil
      );
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sub Kriteria</DialogTitle>
          <DialogDescription className="text-neutral-600">
            Ubah informasi Sub Kriteria yang sudah ada. Anda dapat mengubah kode
            dan informasi Sub Kriteria lainnya.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kode" className="text-right">
              Kode
            </Label>
            <Input
              id="kode"
              className="col-span-3"
              placeholder="SK001"
              {...register("kode")}
              disabled={isSubmitting}
            />
            {errors.kode && (
              <>
                <div className="col-span-1"></div>
                <p className="col-span-3 text-red-500 text-sm ">
                  {errors.kode.message}
                </p>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subKriteria" className="text-right">
              Sub Kriteria
            </Label>
            <Input
              id="subKriteria"
              className="col-span-3"
              placeholder="Aspek Sikap Kerja"
              {...register("subKriteria")}
              disabled={isSubmitting}
            />
            {errors.subKriteria && (
              <>
                <div className="col-span-1"></div>
                <p className="col-span-3 text-red-500 text-sm ">
                  {errors.subKriteria.message}
                </p>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kriteriaId" className="text-right">
              Kriteria
            </Label>
            <Select
              onValueChange={(value) => setValue("kriteriaId", value)}
              value={subKriteria?.kriteria}
              disabled={isSubmitting}
            >
              <SelectTrigger className="col-span-3 w-full cursor-pointer">
                <SelectValue placeholder="Pilih Kriteria" />
              </SelectTrigger>
              <SelectContent>
                {kriteriaList.map((kriteria) => (
                  <SelectItem
                    key={kriteria.id}
                    value={kriteria.id}
                    className="cursor-pointer"
                  >
                    {kriteria.nama_kriteria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kriteriaId && (
              <>
                <div className="col-span-1"></div>
                <p className="col-span-3 text-red-500 text-sm">
                  {errors.kriteriaId.message}
                </p>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="faktor" className="text-right">
              Faktor
            </Label>
            <Select
              onValueChange={(value) => setValue("faktor", value)}
              value={subKriteria?.faktor}
              disabled={isSubmitting}
            >
              <SelectTrigger className="col-span-3 w-full cursor-pointer">
                <SelectValue placeholder="Pilih Faktor" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem className="cursor-pointer" value="Core">
                    Core
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="Secondary">
                    Secondary
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.faktor && (
              <>
                <div className="col-span-1"></div>
                <p className="col-span-3 text-red-500 text-sm">
                  {errors.faktor.message}
                </p>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profil" className="text-right">
              Profil
            </Label>
            <Select
              onValueChange={(value) => setValue("profil", parseInt(value))}
              value={subKriteria?.profil.toString()}
              disabled={isSubmitting}
            >
              <SelectTrigger className="col-span-3 w-full cursor-pointer">
                <SelectValue placeholder="Pilih Bobot Profil" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <SelectItem
                      key={value}
                      className="cursor-pointer"
                      value={value.toString()}
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.profil && (
              <>
                <div className="col-span-1"></div>
                <p className="col-span-3 text-red-500 text-sm">
                  {errors.profil.message}
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
