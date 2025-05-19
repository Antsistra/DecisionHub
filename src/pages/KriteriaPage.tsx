import { useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useKriteria } from "@/hooks/useKriteria";
import { AddKriteriaDialog } from "@/components/kriteria/AddKriteriaDialog";
import { KriteriaTable } from "@/components/kriteria/KriteriaTable";
import { Search, Database, Info, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import LoadingDots from "@/fragments/LoadingDots";

export default function KriteriaPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    kriteria,
    isLoading,
    error,
    addKriteria,
    deleteKriteria,
    updateKriteria,
  } = useKriteria(projectId);

  const totalWeight = useMemo(() => {
    return kriteria
      .reduce((total, item) => total + item.bobot * 100, 0)
      .toFixed(0);
  }, [kriteria]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const filteredKriteria = useMemo(() => {
    if (!searchQuery.trim()) return kriteria;

    return kriteria.filter((item) =>
      item.nama_kriteria.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [kriteria, searchQuery]);

  useEffect(() => {
    setSearchQuery("");
  }, [projectId]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-8">
        {/* Header section */}{" "}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Kriteria</h1>
            <Badge variant="outline" className="ml-2 px-3 py-1">
              {kriteria.length} Total
            </Badge>
            <Badge
              variant={Number(totalWeight) <= 100 ? "outline" : "destructive"}
              className="px-3 py-1"
            >
              Total Bobot: {totalWeight}%
            </Badge>
          </div>
          <p className="text-gray-500 max-w-4xl dark:text-white/70">
            Daftar kriteria yang digunakan untuk mengevaluasi alternatif dalam
            proses pengambilan keputusan. Setiap kriteria memiliki bobot yang
            menunjukkan tingkat kepentingannya.
          </p>
        </div>
        {/* Card for filters and actions */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Kelola Kriteria
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-white/70">
              Cari dan kelola kriteria untuk proses penilaian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search input with clear button */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="w-full pl-10 pr-10"
                  placeholder="Cari berdasarkan nama kriteria"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={handleClearSearch}
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Add button with tooltip */}
              <div className="ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <AddKriteriaDialog onAdd={addKriteria} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tambahkan kriteria baru untuk penilaian</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
          {filteredKriteria.length > 0 && searchQuery && (
            <CardFooter className="border-t pt-4 text-sm text-gray-500">
              Ditemukan {filteredKriteria.length} dari {kriteria.length}{" "}
              kriteria
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
        )}{" "}
        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center w-full py-12 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-dashed">
            <LoadingDots duration={1500} autoFade={false} />
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
              Memuat data kriteria...
            </p>
          </div>
        ) : filteredKriteria.length === 0 ? (
          <Card className="border border-dashed py-8">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Database className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchQuery
                  ? "Tidak ada kriteria yang sesuai"
                  : "Belum ada kriteria"}
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                {searchQuery
                  ? `Tidak ditemukan kriteria dengan kata kunci "${searchQuery}"`
                  : "Kriteria belum ditambahkan. Tambahkan kriteria untuk memulai proses penilaian."}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={handleClearSearch}>
                  Hapus Pencarian
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg shadow-sm overflow-hidden ">
            <KriteriaTable
              kriteria={filteredKriteria}
              onDelete={deleteKriteria}
              onUpdate={updateKriteria}
            />
          </div>
        )}
      </div>
    </div>
  );
}
