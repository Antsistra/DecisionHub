import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { Card, CardHeader, CardDescription, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Link, useParams } from "react-router-dom";
import { Info, ClipboardList, ExternalLink } from "lucide-react";

interface DetailKriteriaDialogProps {
  title: string;
  kriteriaId?: string;
}

export default function DetailKriteriaDialog(props: DetailKriteriaDialogProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [subKriteria, setSubKriteria] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchListSubKriteria = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sub_kriteria")
        .select("*")
        .eq("kriteria", props.kriteriaId);
      if (error) {
        console.error("Error fetching sub kriteria:", error);
      }
      setSubKriteria(data || []);
    } catch (error) {
      console.error("Exception when fetching sub kriteria:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (props.kriteriaId) {
      fetchListSubKriteria();
    }
  }, [props.kriteriaId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <ClipboardList className="h-4 w-4" />
          <span>Detail</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>{props.title}</span>
            <Badge variant="outline" className="ml-2">
              {subKriteria.length} Sub Kriteria
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            Detail kriteria dan sub-kriteria yang digunakan untuk penilaian
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        {isLoading ? (
          <div className="py-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Memuat data...</p>
            </div>
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto pr-1">
            {subKriteria.length > 0 ? (
              <div className="space-y-3">
                {subKriteria.map((sub) => (
                  <Card key={sub.id} className="border shadow-sm">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-base font-medium flex justify-between items-center">
                        <span>{sub.sub_kriteria}</span>
                        <Badge
                          variant={
                            sub.faktor === "core" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {sub.faktor} Factor
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm mt-1 text-neutral-700">
                        Bobot Profil:{" "}
                        <span className="font-medium">{sub.profil}</span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-2 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Info className="h-10 w-10 text-gray-400" />
                <h3 className="text-gray-500 font-medium">
                  Sub Kriteria Tidak Tersedia
                </h3>
                <p className="text-sm text-gray-400 max-w-[250px]">
                  Belum ada sub kriteria yang ditambahkan untuk kriteria ini
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 sm:gap-0 mt-2">
          <Link
            to={`/projects/${projectId}/profile-matching/kriteria/sub`}
            className="w-full sm:w-auto"
          >
            <Button className="w-full" variant="default">
              <ExternalLink className="mr-2 h-4 w-4" />
              Kelola Sub Kriteria
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
