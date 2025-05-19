import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { Link, useParams } from "react-router-dom";
import PenilaianWpDialog from "@/components/Penilaian/PenilaianWpDialog";

export default function PenilaianAlternatifPage() {
  const { projectId } = useParams();
  const [alternatif, setAlternatif] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    assessed: 0,
  });
  const [assessedAlternatives, setAssessedAlternatives] = useState<string[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<"kode" | "nama">("kode");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "assessed" | "unassessed"
  >("all");

  const fetchAlternatif = async () => {
    try {
      const { data: alternativeData, error: alternativeError } = await supabase
        .from("alternatif")
        .select("*")
        .eq("project_id", projectId);

      if (alternativeError) throw alternativeError;

      if (alternativeData) {
        setAlternatif(alternativeData);
        setStats((prev) => ({ ...prev, total: alternativeData.length }));

        const { data: assessmentData, error: assessmentError } = await supabase
          .from("nilai_wp")
          .select("alternatif_id")
          .in(
            "alternatif_id",
            alternativeData.map((a) => a.id)
          );

        if (!assessmentError && assessmentData) {
          const uniqueAssessed = [
            ...new Set(assessmentData.map((a) => a.alternatif_id)),
          ];
          setAssessedAlternatives(uniqueAssessed);
          setStats((prev) => ({ ...prev, assessed: uniqueAssessed.length }));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlternatif();
  }, [projectId]);

  const handleAssessmentComplete = () => {
    fetchAlternatif();
  };

  const getAssessmentStatus = (alternativeId: string) => {
    const isAssessed = assessedAlternatives.includes(alternativeId);
    return isAssessed ? (
      <Badge className="bg-green-500">Sudah Dinilai</Badge>
    ) : (
      <Badge variant="outline">Belum Dinilai</Badge>
    );
  };

  // Sorting logic
  const sortedAlternatif = [...alternatif].sort((a, b) => {
    if (sortField === "kode") {
      return sortOrder === "asc"
        ? a.kode.localeCompare(b.kode)
        : b.kode.localeCompare(a.kode);
    } else {
      return sortOrder === "asc"
        ? a.nama.localeCompare(b.nama)
        : b.nama.localeCompare(a.nama);
    }
  });

  const filteredAlternatif =
    statusFilter === "all"
      ? sortedAlternatif
      : sortedAlternatif.filter((item) => {
          if (statusFilter === "assessed") {
            return assessedAlternatives.includes(item.id);
          } else {
            return !assessedAlternatives.includes(item.id);
          }
        });

  const totalPages = Math.ceil(filteredAlternatif.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const toggleSort = (field: "kode" | "nama") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 lg:px-8">
        <Skeleton className="h-8 w-[250px] mb-2" />
        <Skeleton className="h-4 w-full max-w-[450px] mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-4 w-[180px]" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Penilaian Alternatif
        </h1>
        <p className="text-neutral-700 dark:text-white/80">
          Lakukan penilaian terhadap alternatif berdasarkan kriteria yang telah
          ditentukan.
        </p>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="mb-4 bg-secondary dark:bg-primary">
          <TabsTrigger value="table" className="cursor-pointer">
            Tabel Penilaian
          </TabsTrigger>
          <TabsTrigger value="stats" className="cursor-pointer">
            Statistik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Alternatif</CardTitle>
              <CardDescription className="text-stone-500">
                Silahkan pilih alternatif untuk melakukan penilaian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-white">
                      Tampilkan:
                    </span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage.toString()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-white">
                      Status Penilaian:
                    </span>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(
                          value as "all" | "assessed" | "unassessed"
                        );
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 min-w-[200px] cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Filter className="h-3.5 w-3.5 text-gray-500" />
                          <SelectValue placeholder="Status Penilaian" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status Penilaian</SelectLabel>
                          <SelectItem value="all" className="cursor-pointer">
                            Semua Penilaian
                          </SelectItem>
                          <SelectItem
                            value="assessed"
                            className="cursor-pointer"
                          >
                            Completed
                          </SelectItem>
                          <SelectItem
                            value="unassessed"
                            className="cursor-pointer"
                          >
                            Incomplete
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-[#1a1a1a]">
                      <TableRow>
                        <TableHead className="w-[100px] font-medium text-gray-700 dark:text-white">
                          <div className="flex items-center gap-1">
                            <span>Kode</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => toggleSort("kode")}
                              title={`Sort ${
                                sortOrder === "asc" ? "descending" : "ascending"
                              }`}
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-white">
                          <div className="flex items-center gap-1">
                            <span>Nama Alternatif</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => toggleSort("nama")}
                              title={`Sort ${
                                sortOrder === "asc" ? "descending" : "ascending"
                              }`}
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-white">
                          Status Penilaian
                        </TableHead>
                        <TableHead className="text-right font-medium text-gray-700 dark:text-white">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAlternatif.length > 0 ? (
                        filteredAlternatif.map((item) => (
                          <TableRow
                            key={item.id}
                            className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                          >
                            <TableCell className="font-medium">
                              {item.kode}
                            </TableCell>
                            <TableCell>{item.nama}</TableCell>
                            <TableCell>
                              {getAssessmentStatus(item.id)}
                            </TableCell>
                            <TableCell className="text-right">
                              <PenilaianWpDialog
                                alternatifId={item.id}
                                onComplete={handleAssessmentComplete}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-6 text-gray-500"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-neutral-500">
                                Belum ada data alternatif
                              </p>
                              <Link
                                to={`/projects/${projectId}/weighted-product/alternatif`}
                              >
                                <Button variant="outline" size="sm">
                                  Kembali ke Halaman Alternatif
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4 px-2">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="hidden sm:flex h-8 w-8 p-0"
                      >
                        <span className="sr-only">First page</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 rotate-180"
                        >
                          <path
                            d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L6.85355 7.85355C7.04882 7.65829 7.04882 7.34171 6.85355 7.14645L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355L5.79289 7.5L2.14645 11.1464ZM8.14645 11.1464C7.95118 11.3417 7.95118 11.6583 8.14645 11.8536C8.34171 12.0488 8.65829 12.0488 8.85355 11.8536L12.8536 7.85355C13.0488 7.65829 13.0488 7.34171 12.8536 7.14645L8.85355 3.14645C8.65829 2.95118 8.34171 2.95118 8.14645 3.14645C7.95118 3.34171 7.95118 3.65829 8.14645 3.85355L11.7929 7.5L8.14645 11.1464Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Previous page</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Next page</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.565 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.1584 11.8647C6.35986 12.0535 6.67627 12.0433 6.86514 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86514 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="hidden sm:flex h-8 w-8 p-0"
                      >
                        <span className="sr-only">Last page</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L6.85355 7.85355C7.04882 7.65829 7.04882 7.34171 6.85355 7.14645L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355L5.79289 7.5L2.14645 11.1464ZM8.14645 11.1464C7.95118 11.3417 7.95118 11.6583 8.14645 11.8536C8.34171 12.0488 8.65829 12.0488 8.85355 11.8536L12.8536 7.85355C13.0488 7.65829 13.0488 7.34171 12.8536 7.14645L8.85355 3.14645C8.65829 2.95118 8.34171 2.95118 8.14645 3.14645C7.95118 3.34171 7.95118 3.65829 8.14645 3.85355L11.7929 7.5L8.14645 11.1464Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Alternatif
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-neutral-500"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-neutral-500 py-2">
                  Jumlah alternatif yang tersedia untuk dinilai
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Alternatif Sudah Dinilai
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-neutral-500"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.assessed} / {stats.total}
                </div>
                <p className="text-xs text-neutral-500 py-2">
                  {stats.assessed === stats.total
                    ? "Semua alternatif sudah dinilai"
                    : `${
                        stats.total - stats.assessed
                      } alternatif belum dinilai`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Kemajuan Penilaian
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-neutral-500"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total
                    ? Math.round((stats.assessed / stats.total) * 100)
                    : 0}
                  %
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${
                        stats.total ? (stats.assessed / stats.total) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Progress penilaian alternatif
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
