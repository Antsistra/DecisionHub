import PembobotanKriteriaDialog from "@/components/kriteria/PembobotanKriteriaDialog";
import PembobotanTable from "@/components/kriteria/PembobotanTable";
import { useWeightedKriteria } from "@/hooks/usePembobotaanKriteria";
import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { Search, X, Info, Scale, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import LoadingDots from "@/fragments/LoadingDots";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function WeightedPembobotanPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    weightedKriteria,
    isLoading,
    error,
    fetchWeightedKriteria,
    deleteWeightedKriteria,
  } = useWeightedKriteria(projectId);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKriteria, setSelectedKriteria] = useState<string[]>([]);
  const [hasFilters, setHasFilters] = useState(false);

  useMemo(() => {
    setHasFilters(selectedKriteria.length > 0);
  }, [selectedKriteria]);

  const toggleKriteriaFilter = (kriteriaName: string) => {
    setSelectedKriteria((prev) =>
      prev.includes(kriteriaName)
        ? prev.filter((name) => name !== kriteriaName)
        : [...prev, kriteriaName]
    );
  };

  const resetFilters = () => {
    setSelectedKriteria([]);
    setSearchTerm("");
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const safeGetNamaKriteria = (item: any) => {
    return item?.weighted_kriteria?.nama_kriteria || "Unknown";
  };

  const uniqueKriteriaNames = useMemo(() => {
    return Array.from(
      new Set(
        weightedKriteria
          .map((item) => safeGetNamaKriteria(item))
          .filter((name) => name !== "Unknown")
      )
    );
  }, [weightedKriteria]);

  const filteredKriteria = useMemo(() => {
    if (!searchTerm.trim() && selectedKriteria.length === 0)
      return weightedKriteria;

    return weightedKriteria.filter((item) => {
      const namaKriteria = safeGetNamaKriteria(item);

      const matchesSearch =
        searchTerm === "" ||
        (namaKriteria &&
          namaKriteria.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.keterangan &&
          item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesKriteria =
        selectedKriteria.length === 0 ||
        selectedKriteria.includes(namaKriteria);

      return matchesSearch && matchesKriteria;
    });
  }, [weightedKriteria, searchTerm, selectedKriteria]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <Scale className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">
              Pembobotan Kriteria
            </h1>
            <Badge variant="outline" className="ml-2 px-3 py-1">
              {weightedKriteria.length} Total
            </Badge>
          </div>
          <p className="text-gray-500 max-w-4xl">
            Halaman ini digunakan untuk mengelola bobot kriteria pada project.
            Pembobotan kriteria sangat penting dalam proses pengambilan
            keputusan karena menentukan tingkat kepentingan setiap kriteria
            dalam perhitungan akhir.
          </p>
        </div>

        {/* Card for filters and actions */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Kelola Pembobotan Kriteria
            </CardTitle>
            <CardDescription className="text-gray-500">
              Cari dan kelola pembobotan kriteria untuk proses pengambilan
              keputusan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search input with clear button */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="w-full pl-10 pr-10"
                  placeholder="Cari berdasarkan nama kriteria atau keterangan"
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

              {/* Filter dropdown */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={hasFilters ? "secondary" : "outline"}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filter{" "}
                      {hasFilters && (
                        <Badge className="ml-1" variant="outline">
                          {selectedKriteria.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="font-normal">
                      Kriteria
                    </DropdownMenuLabel>
                    {uniqueKriteriaNames.length > 0 ? (
                      uniqueKriteriaNames.map((name) => (
                        <DropdownMenuCheckboxItem
                          className="cursor-pointer"
                          key={name}
                          checked={selectedKriteria.includes(name)}
                          onCheckedChange={() => toggleKriteriaFilter(name)}
                        >
                          {name}
                        </DropdownMenuCheckboxItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        Tidak ada kriteria tersedia
                      </DropdownMenuItem>
                    )}

                    {hasFilters && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="justify-center text-red-500 cursor-pointer"
                          onClick={resetFilters}
                        >
                          Reset All Filters
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Add button with tooltip */}
              <div className="ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <PembobotanKriteriaDialog
                          fetchWeightedKriteria={fetchWeightedKriteria}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tambahkan pembobotan kriteria baru</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>

          {/* Active filters display */}
          {hasFilters && (
            <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
              {selectedKriteria.map((name) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => toggleKriteriaFilter(name)}
                >
                  Kriteria: {name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKriteriaFilter(name);
                    }}
                  />
                </Badge>
              ))}

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-gray-500"
                  onClick={resetFilters}
                >
                  Reset All
                </Button>
              )}
            </CardFooter>
          )}

          {filteredKriteria.length > 0 && searchTerm && !hasFilters && (
            <CardFooter className="border-t pt-4 text-sm text-gray-500">
              Ditemukan {filteredKriteria.length} dari {weightedKriteria.length}{" "}
              pembobotan kriteria
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
              Memuat data pembobotan kriteria...
            </p>
          </div>
        ) : filteredKriteria.length === 0 ? (
          <Card className="border border-dashed py-8">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Scale className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchTerm || hasFilters
                  ? "Tidak ada pembobotan kriteria yang sesuai"
                  : "Belum ada pembobotan kriteria"}
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                {searchTerm || hasFilters
                  ? `Tidak ditemukan pembobotan kriteria dengan filter yang dipilih`
                  : "Pembobotan kriteria belum ditambahkan. Tambahkan pembobotan kriteria untuk memulai proses perhitungan."}
              </p>
              {(searchTerm || hasFilters) && (
                <Button variant="outline" onClick={resetFilters}>
                  Hapus Filter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg shadow-sm overflow-hidden ">
            <PembobotanTable
              weightedKriteria={filteredKriteria}
              onDelete={deleteWeightedKriteria}
            />
          </div>
        )}
      </div>
    </div>
  );
}
