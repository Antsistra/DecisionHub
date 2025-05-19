import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
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

import { useSubKriteria } from "@/hooks/useSubKriteria";
import { useKriteria } from "@/hooks/useKriteria";
import { AddSubKriteriaDialog } from "@/components/subKriteria/AddSubKriteriaDialog";
import { SubKriteriaTable } from "@/components/subKriteria/SubKriteriaTable";
import { useParams } from "react-router-dom";
import { Search, X, Database, Filter, Info, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import LoadingDots from "@/fragments/LoadingDots";

export default function SubKriteriaPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    subKriteria,
    isLoading,
    error,
    addSubKriteria,
    deleteSubKriteria,
    updateSubKriteria,
  } = useSubKriteria(projectId);
  const { kriteria, isLoading: isLoadingKriteria } = useKriteria(projectId);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKriteria, setSelectedKriteria] = useState<string[]>([]);
  const [selectedFaktor, setSelectedFaktor] = useState<string[]>([]);
  const [hasFilters, setHasFilters] = useState(false);

  useEffect(() => {
    setHasFilters(selectedKriteria.length > 0 || selectedFaktor.length > 0);
  }, [selectedKriteria, selectedFaktor]);

  const toggleKriteriaFilter = (kriteriaId: string) => {
    setSelectedKriteria((prev) =>
      prev.includes(kriteriaId)
        ? prev.filter((id) => id !== kriteriaId)
        : [...prev, kriteriaId]
    );
  };

  const toggleFaktorFilter = (faktor: string) => {
    setSelectedFaktor((prev) =>
      prev.includes(faktor)
        ? prev.filter((f) => f !== faktor)
        : [...prev, faktor]
    );
  };

  const resetFilters = () => {
    setSelectedKriteria([]);
    setSelectedFaktor([]);
    setSearchQuery("");
  };

  const filteredSubKriteria = useMemo(() => {
    return subKriteria.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.sub_kriteria.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.kriteria_obj?.nama_kriteria || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesKriteria =
        selectedKriteria.length === 0 ||
        selectedKriteria.includes(item.kriteria);

      const matchesFaktor =
        selectedFaktor.length === 0 || selectedFaktor.includes(item.faktor);

      return matchesSearch && matchesKriteria && matchesFaktor;
    });
  }, [subKriteria, searchQuery, selectedKriteria, selectedFaktor]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Sub Kriteria</h1>
            <Badge variant="outline" className="ml-2 px-3 py-1">
              {subKriteria.length} Total
            </Badge>
          </div>
          <p className="text-gray-500 max-w-4xl dark:text-white/70">
            Daftar sub kriteria yang digunakan dalam proses penilaian
            alternatif. Sub kriteria memiliki faktor (Core/Secondary) dan nilai
            profil ideal yang digunakan dalam perhitungan profile matching.
          </p>
        </div>
        {/* Card for filters and actions */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Kelola Sub Kriteria
            </CardTitle>
            <CardDescription className="text-gray-500">
              Cari, filter dan kelola sub kriteria untuk proses penilaian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search input with clear button */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="w-full pl-10 pr-10"
                  placeholder="Cari berdasarkan kode atau nama sub kriteria"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setSearchQuery("")}
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
                          {selectedKriteria.length + selectedFaktor.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center">
                        <ListFilter className="mr-2 h-4 w-4" />
                        <span>Kriteria</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {isLoadingKriteria ? (
                            <DropdownMenuItem disabled>
                              Loading kriteria...
                            </DropdownMenuItem>
                          ) : kriteria.length > 0 ? (
                            kriteria.map((item) => (
                              <DropdownMenuCheckboxItem
                                key={item.id}
                                checked={selectedKriteria.includes(item.id)}
                                onCheckedChange={() =>
                                  toggleKriteriaFilter(item.id)
                                }
                              >
                                {item.nama_kriteria}
                              </DropdownMenuCheckboxItem>
                            ))
                          ) : (
                            <DropdownMenuItem disabled>
                              No kriteria found
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center">
                        <ListFilter className="mr-2 h-4 w-4" />
                        <span>Faktor</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuCheckboxItem
                            checked={selectedFaktor.includes("Core")}
                            onCheckedChange={() => toggleFaktorFilter("Core")}
                          >
                            Core
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={selectedFaktor.includes("Secondary")}
                            onCheckedChange={() =>
                              toggleFaktorFilter("Secondary")
                            }
                          >
                            Secondary
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

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
                        <AddSubKriteriaDialog onAdd={addSubKriteria} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tambahkan sub kriteria baru</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>

          {/* Active filters display */}
          {hasFilters && (
            <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
              {selectedKriteria.map((id) => {
                const foundKriteria = kriteria.find((k) => k.id === id);
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => toggleKriteriaFilter(id)}
                  >
                    Kriteria: {foundKriteria?.nama_kriteria || id}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleKriteriaFilter(id);
                      }}
                    />
                  </Badge>
                );
              })}

              {selectedFaktor.map((faktor) => (
                <Badge
                  key={faktor}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => toggleFaktorFilter(faktor)}
                >
                  Faktor: {faktor}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFaktorFilter(faktor);
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

          {filteredSubKriteria.length > 0 && searchQuery && !hasFilters && (
            <CardFooter className="border-t pt-4 text-sm text-gray-500">
              Ditemukan {filteredSubKriteria.length} dari {subKriteria.length}{" "}
              sub kriteria
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
            <LoadingDots duration={1000} autoFade={false} />
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
              Memuat data sub kriteria...
            </p>
          </div>
        ) : filteredSubKriteria.length === 0 ? (
          <Card className="border border-dashed py-8">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Database className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-white">
                {searchQuery || hasFilters
                  ? "Tidak ada sub kriteria yang sesuai"
                  : "Belum ada sub kriteria"}
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                {searchQuery || hasFilters
                  ? `Tidak ditemukan sub kriteria dengan filter yang dipilih`
                  : "Sub kriteria belum ditambahkan. Tambahkan sub kriteria untuk memulai proses penilaian."}
              </p>
              {(searchQuery || hasFilters) && (
                <Button variant="outline" onClick={resetFilters}>
                  Hapus Filter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <SubKriteriaTable
              subKriteria={filteredSubKriteria}
              onDelete={deleteSubKriteria}
              onUpdate={updateSubKriteria}
            />
          </div>
        )}
      </div>
    </div>
  );
}
