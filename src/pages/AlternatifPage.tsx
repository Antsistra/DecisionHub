import { Input } from "@/components/ui/input";
import { useAlternatif } from "@/hooks/useAlternatif";
import { AddAlternatifDialog } from "@/components/alternatif/AddAlternatifDialog";
import { AlternatifTable } from "@/components/alternatif/AlternatifTable";
import { useParams } from "react-router-dom";
import LoadingDots from "@/fragments/LoadingDots";
import { Search, Database, Info, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AlternatifPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    alternatif,
    isLoading,
    error,
    addAlternatif,
    deleteAlternatif,
    updateAlternatif,
  } = useAlternatif(projectId);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filteredAlternatif = useMemo(() => {
    let filtered = alternatif;

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.kode.toLowerCase().includes(lowerSearch) ||
          item.nama.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  }, [alternatif, searchTerm, statusFilter]);

  useEffect(() => {
    setSearchTerm("");
    setStatusFilter("all");
  }, [projectId]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Alternatif</h1>
            <Badge variant="outline" className="ml-2 px-3 py-1">
              {alternatif.length} Total
            </Badge>
          </div>
          <p className="text-gray-500 max-w-4xl dark:text-gray-200">
            Daftar alternatif yang dapat dievaluasi berdasarkan kriteria yang
            ditentukan untuk mendukung pengambilan keputusan.
          </p>
        </div>

        {/* Card for filters and actions */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Kelola Alternatif
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-white">
              Cari dan kelola alternatif untuk proses penilaian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search input with clear button */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="w-full pl-10 pr-10"
                  placeholder="Cari berdasarkan kode atau nama alternatif"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={handleClearSearch}
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <AddAlternatifDialog onAdd={addAlternatif} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tambahkan alternatif baru untuk penilaian</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
          {filteredAlternatif.length > 0 && searchTerm && (
            <CardFooter className="border-t pt-4 text-sm text-gray-500">
              Ditemukan {filteredAlternatif.length} dari {alternatif.length}{" "}
              alternatif
            </CardFooter>
          )}
        </Card>

        {/* Error message if any */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Terjadi kesalahan
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center w-full py-12 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-dashed">
            <LoadingDots duration={1000} autoFade={false} />
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
              Memuat data alternatif...
            </p>
          </div>
        ) : filteredAlternatif.length === 0 ? (
          <Card className="border border-dashed py-8">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Database className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchTerm
                  ? "Tidak ada alternatif yang sesuai"
                  : "Belum ada alternatif"}
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                {searchTerm
                  ? `Tidak ditemukan alternatif dengan kata kunci "${searchTerm}"`
                  : "Alternatif belum ditambahkan. Tambahkan alternatif untuk memulai proses penilaian."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={handleClearSearch}>
                  Hapus Pencarian
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg shadow-sm overflow-hidden ">
            <AlternatifTable
              alternatif={filteredAlternatif}
              onDelete={deleteAlternatif}
              onUpdate={updateAlternatif}
            />
          </div>
        )}
      </div>
    </div>
  );
}
