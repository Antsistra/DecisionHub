import { useKriteria } from "@/hooks/useKriteria";
import supabase from "@/utils/supabase";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import DetailKriteriaDialog from "@/components/Penilaian/DetailKriteriaDialog";
import AddNilaiDialog from "@/components/Penilaian/AddNilaiDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PenilaianPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [alternatif, setAlternatif] = useState<any>([]);
  const [filteredAlternatif, setFilteredAlternatif] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [project, setProject] = useState<any>(null);
  const { isLoading, error, kriteria } = useKriteria(projectId);
  const [assessedAlternatives, setAssessedAlternatives] = useState<string[]>(
    []
  );
  const [alternativeAssessmentDetails, setAlternativeAssessmentDetails] =
    useState<Record<string, number>>({});
  const [totalSubKriteriaCount, setTotalSubKriteriaCount] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "assessed" | "unassessed"
  >("all");

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (error) {
      console.error("Error fetching project:", error);
    }

    setProject(data);
  };

  const fetchAlternatif = async () => {
    const { data, error } = await supabase
      .from("alternatif")
      .select("*")
      .eq("project_id", projectId);
    if (error) {
      console.error("Error fetching alternatif:", error);
    }

    setAlternatif(data || []);
    setFilteredAlternatif(data || []);

    if (data && data.length > 0) {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from("nilai")
        .select("alternatif_id, subKriteria_id")
        .in(
          "alternatif_id",
          data.map((a) => a.id)
        );

      if (!assessmentError && assessmentData) {
        const uniqueAssessed = [
          ...new Set(assessmentData.map((a) => a.alternatif_id)),
        ];
        setAssessedAlternatives(uniqueAssessed);

        const assessmentDetails: Record<string, number> = {};
        assessmentData.forEach((assessment) => {
          if (assessment.alternatif_id) {
            assessmentDetails[assessment.alternatif_id] =
              (assessmentDetails[assessment.alternatif_id] || 0) + 1;
          }
        });

        setAlternativeAssessmentDetails(assessmentDetails);
      }
    }
  };

  const fetchSubKriteriaCount = async () => {
    const { data, error } = await supabase
      .from("sub_kriteria")
      .select(
        `
        id,
        kriteria_obj:kriteria (
          project_id
        )
      `
      )
      .eq("kriteria_obj.project_id", projectId);

    if (error) {
      console.error("Error fetching sub kriteria count:", error);
      return;
    }

    const filteredData = data.filter((item) => item.kriteria_obj !== null);
    setTotalSubKriteriaCount(filteredData.length);
  };

  const getAssessmentStatus = (alternativeId: string) => {
    const isAssessed = assessedAlternatives.includes(alternativeId);

    if (!isAssessed) {
      return <Badge variant="outline">Belum Dinilai</Badge>;
    }

    const subKriteriaAssessed =
      alternativeAssessmentDetails[alternativeId] || 0;
    const totalSubKriteria = totalSubKriteriaCount;

    const percentage = Math.round(
      (subKriteriaAssessed / totalSubKriteria) * 100
    );

    return (
      <div className="flex flex-col gap-1 items-center w-full">
        <div className="flex justify-between w-full text-xs px-1">
          <span>
            {subKriteriaAssessed}/{totalSubKriteria}
          </span>
          <Badge
            className={percentage === 100 ? "bg-green-500" : "bg-blue-500"}
          >
            {percentage}%
          </Badge>
        </div>
        <Progress value={percentage} className="h-2 w-full" />
      </div>
    );
  };

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      filterAlternatif(value, statusFilter);
    },
    [alternatif, statusFilter]
  );

  const filterAlternatif = useCallback(
    (search: string, status: "all" | "assessed" | "unassessed") => {
      let filtered = alternatif;

      if (search.trim()) {
        filtered = alternatif.filter(
          (alt: any) =>
            alt.nama.toLowerCase().includes(search.toLowerCase()) ||
            alt.kode.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (status !== "all") {
        filtered = filtered.filter((alt: any) => {
          const subKriteriaAssessed = alternativeAssessmentDetails[alt.id] || 0;
          const percentage = Math.round(
            (subKriteriaAssessed / totalSubKriteriaCount) * 100
          );

          if (status === "assessed") {
            return percentage === 100;
          }

          return percentage < 100;
        });
      }

      setFilteredAlternatif(filtered);
    },
    [
      alternatif,
      assessedAlternatives,
      alternativeAssessmentDetails,
      totalSubKriteriaCount,
    ]
  );

  const handleStatusFilterChange = useCallback(
    (status: "all" | "assessed" | "unassessed") => {
      setStatusFilter(status);
      filterAlternatif(searchTerm, status);
    },
    [searchTerm, filterAlternatif]
  );

  const refreshAssessmentData = async () => {
    await fetchAlternatif();
    await fetchSubKriteriaCount();
  };

  useEffect(() => {
    const handleRefreshData = () => {
      refreshAssessmentData();
    };

    window.addEventListener("refreshPenilaianData", handleRefreshData);

    return () => {
      window.removeEventListener("refreshPenilaianData", handleRefreshData);
    };
  }, []);

  useEffect(() => {
    fetchProject();
    refreshAssessmentData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Memuat Data...</h2>
          <p className="text-gray-500">Harap tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-500">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-700">{error.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header with title and description */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Penilaian Alternatif</h1>
          <p className="text-gray-500">
            Isi nilai untuk setiap alternatif berdasarkan kriteria yang telah
            ditentukan
          </p>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Kriteria Penilaian */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Kriteria Penilaian</h2>
              <Badge variant="outline" className="px-2 py-1">
                {kriteria.length} Kriteria
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kriteria.map((k: any) => (
                <Card
                  key={k.id}
                  className="w-full bg-white border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {k.nama_kriteria}
                      </CardTitle>
                      <Badge variant="secondary" className="ml-2">
                        Bobot: {(k.bobot * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <CardDescription className="text-neutral-700">
                      {k.jenis === "benefit" ? "Benefit" : "Cost"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex justify-end">
                    <DetailKriteriaDialog
                      title={k.nama_kriteria}
                      kriteriaId={k.id}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right column - Project Info & Factor Weights */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bobot Faktor</h2>

            {project ? (
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Bobot</CardTitle>
                  <CardDescription className="text-neutral-700 dark:text-white">
                    Bobot untuk perhitungan profile matching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.bobot_CF === 0 ? (
                    <div className="p-3 bg-red-50 text-red-800 rounded-md border border-red-200 dark:bg-[#1a1a1a] dark:border-[#333]">
                      <p className="font-medium flex items-center">
                        <Info size={16} className="mr-2" />
                        Bobot Core Factor dan Secondary Factor belum diisi
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded-md dark:bg-[#1a1a1a] dark:border-[#333]">
                        <span>Core Factor:</span>
                        <Badge variant="secondary">
                          {(project.bobot_CF * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-purple-50 rounded-md dark:bg-[#1a1a1a] dark:border-[#333]">
                        <span>Secondary Factor:</span>
                        <Badge variant="secondary">
                          {(project.bobot_SF * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border shadow-sm p-4 text-center">
                <p className="text-gray-500">Memuat informasi project...</p>
              </Card>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg dark:bg-[#1a1a1a] dark:border-[#333]">
                    <h3 className="font-medium text-blue-700 mb-2 dark:text-primary">
                      Cara Penilaian
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-primary/80">
                      Klik tombol "Tambah Nilai" pada setiap alternatif untuk
                      mengisi nilai berdasarkan kriteria yang ada.
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Pastikan untuk mengisi semua nilai sesuai dengan ketentuan
                    kriteria
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Search and Table Section */}
        <div className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Daftar Alternatif</h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  Status Penilaian:
                </span>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    handleStatusFilterChange(
                      value as "all" | "assessed" | "unassessed"
                    )
                  }
                >
                  <SelectTrigger className="h-9 w-[200px] cursor-pointer">
                    <SelectValue placeholder="Semua Alternatif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      Semua Alternatif
                    </SelectItem>
                    <SelectItem value="assessed" className="cursor-pointer">
                      Completed
                    </SelectItem>
                    <SelectItem value="unassessed" className="cursor-pointer">
                      Incomplete
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-64 lg:w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  placeholder="Cari berdasarkan nama atau kode"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table className="min-w-full">
              <TableHeader className="bg-slate-50 dark:bg-[#1a1a1a]">
                <TableRow>
                  <TableHead className="w-[100px] p-3 text-center">
                    Kode
                  </TableHead>
                  <TableHead className="p-3">Nama Alternatif</TableHead>
                  <TableHead className="p-3 text-center">
                    Status Penilaian
                  </TableHead>
                  <TableHead className="w-[150px] p-3 text-center">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlternatif.length > 0 ? (
                  filteredAlternatif.map((alt: any) => (
                    <TableRow
                      key={alt.id}
                      className="hover:bg-gray-5 dark:hover:bg-gray-700 transition-colors"
                    >
                      <TableCell className="font-medium text-center p-3">
                        {alt.kode}
                      </TableCell>
                      <TableCell className="p-3">{alt.nama}</TableCell>
                      <TableCell className="text-center p-3">
                        {getAssessmentStatus(alt.id)}
                      </TableCell>
                      <TableCell className="text-center p-3">
                        <AddNilaiDialog nama={alt.nama} alternatifId={alt.id} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center p-8">
                      {searchTerm ? (
                        <div className="flex flex-col items-center text-gray-500">
                          <Search className="h-8 w-8 mb-2 text-gray-400" />
                          <p>
                            Tidak ditemukan alternatif dengan kata kunci "
                            {searchTerm}"
                          </p>
                          <Button
                            variant="link"
                            className="mt-1"
                            onClick={() => {
                              setSearchTerm("");
                              setFilteredAlternatif(alternatif);
                            }}
                          >
                            Tampilkan semua
                          </Button>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          Tidak ada alternatif tersedia
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredAlternatif.length > 0 && (
            <div className="text-right text-sm text-gray-500">
              Menampilkan {filteredAlternatif.length} dari {alternatif.length}{" "}
              alternatif
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
