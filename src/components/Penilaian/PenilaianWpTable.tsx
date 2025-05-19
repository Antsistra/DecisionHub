import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { useParams } from "react-router-dom";

import PenilaianWpDialog from "@/components/Penilaian/PenilaianWpDialog";
export default function PenilaianWpTable() {
  const { projectId } = useParams();
  const [alternatif, setAlternatif] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlternatif = async () => {
    const { data, error } = await supabase
      .from("alternatif")
      .select("*")
      .eq("project_id", projectId);
    if (error) {
      console.error("Error fetching alternatif:", error);
    } else {
      setAlternatif(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlternatif();
  }, [projectId]);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : alternatif.length > 0 ? (
          alternatif.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.kode}</TableCell>
              <TableCell>{item.nama}</TableCell>
              <TableCell className="text-right">
                <PenilaianWpDialog alternatifId={item.id}></PenilaianWpDialog>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No data available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
