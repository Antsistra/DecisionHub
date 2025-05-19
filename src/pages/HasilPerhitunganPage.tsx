import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "@/utils/supabase";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  Award,
  BarChart3,
  Info,
  Calculator,
  Search,
  X,
  Printer,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { printProfileMatching } from "@/utils/printProfileMatching";

export default function HasilPerhitunganPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [alternatifs, setAlternatifs] = useState<any[]>([]);
  const [kriterias, setKriterias] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: alternatifData } = await supabase
          .from("alternatif")
          .select(
            `id, nama, kode,
            nilai (
              id, nilai_bobot, nilai_gap,
              sub_kriteria (
                id, faktor, kriteria
              )
            )
          `
          )
          .eq("project_id", projectId);

        const { data: kriteriaData } = await supabase
          .from("kriteria")
          .select("*")
          .eq("project_id", projectId);

        const { data: projectData } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        setAlternatifs(alternatifData || []);
        setKriterias(kriteriaData || []);
        setProject(projectData || null);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const calculateScoreDetail = (alt: any) => {
    let totalScore = 0;
    const details: any[] = [];

    kriterias.forEach((krit) => {
      const nilaiKriteria = alt.nilai.filter(
        (n: any) => n.sub_kriteria?.kriteria === krit.id
      );

      const coreValues = nilaiKriteria
        .filter((n: any) => n.sub_kriteria?.faktor?.toLowerCase() === "core")
        .map((n: any) => n.nilai_bobot);

      const secondaryValues = nilaiKriteria
        .filter(
          (n: any) => n.sub_kriteria?.faktor?.toLowerCase() === "secondary"
        )
        .map((n: any) => n.nilai_bobot);

      const ncf = coreValues.length
        ? coreValues.reduce((a: number, b: number) => a + b, 0) /
          coreValues.length
        : 0;
      const nsf = secondaryValues.length
        ? secondaryValues.reduce((a: number, b: number) => a + b, 0) /
          secondaryValues.length
        : 0;

      const skorCF = project.bobot_CF * ncf;
      const skorSF = project.bobot_SF * nsf;

      const skorPerKriteria = (skorCF + skorSF) * krit.bobot;

      totalScore += skorPerKriteria;

      details.push({
        kriteriaNama: krit.nama_kriteria,
        kriteriaBobot: krit.bobot,
        ncf: ncf.toFixed(4),
        nsf: nsf.toFixed(4),
        skorCF: skorCF.toFixed(4),
        skorSF: skorSF.toFixed(4),
        skorPerKriteria: skorPerKriteria.toFixed(4),
      });
    });

    return {
      totalScore: totalScore.toFixed(4),
      details,
    };
  };

  const sortedAlternatifs = isLoading
    ? []
    : [...alternatifs]
        .map((alt) => {
          const { totalScore } = calculateScoreDetail(alt);
          return { ...alt, totalScore: parseFloat(totalScore) };
        })
        .sort((a, b) => b.totalScore - a.totalScore);

  const filteredAlternatifs = searchTerm
    ? sortedAlternatifs.filter(
        (alt) =>
          alt.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alt.kode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sortedAlternatifs;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return (
      <span className="font-semibold text-gray-600 dark:text-white">
        {index + 1}
      </span>
    );
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-semibold">Memuat Data Perhitungan</h2>
          <p className="text-gray-500 dark:text-white">
            Harap tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  if (!alternatifs.length || !kriterias.length || !project) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Data Tidak Tersedia
            </CardTitle>
            <CardDescription className="text-center text-neutral-700 dark:text-white">
              Tidak ada data perhitungan yang dapat ditampilkan
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <Info className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="text-center text-gray-600 dark:text-white">
                Pastikan Anda telah mengisi data alternatif dan nilai untuk
                setiap kriteria.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-7 w-7 text-blue-600" />
              <h1 className="text-3xl font-bold">
                Hasil Perhitungan Profile Matching
              </h1>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() =>
                      printProfileMatching({
                        alternatifs,
                        kriterias,
                        project,
                        calculateScoreDetail,
                      })
                    }
                  >
                    <Printer className="h-4 w-4" />
                    Cetak Hasil
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cetak semua hasil perhitungan</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-gray-500 max-w-3xl">
            Hasil perhitungan menampilkan ranking alternatif berdasarkan nilai
            total dari metode Profile Matching.
          </p>
        </div>

        {/* Top 3 Alternatif Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredAlternatifs.slice(0, 3).map((alt, index) => (
            <Card
              key={alt.id}
              className={`border ${
                index === 0 ? "border-yellow-300 bg-yellow-50" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getRankIcon(index)}
                    <span>Ranking {index + 1}</span>
                  </span>
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    {alt.totalScore}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-neutral-700 dark:text-white">
                  {alt.kode}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-lg">{alt.nama}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 b"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-secondary dark:bg-primary">
            <TabsTrigger value="ringkasan" className="cursor-pointer">
              <BarChart3 className="h-4 w-4 mr-2" />
              Tabel Ranking
            </TabsTrigger>
            <TabsTrigger value="detail" className="cursor-pointer ">
              <Calculator className="h-4 w-4 mr-2" />
              Detail Perhitungan
            </TabsTrigger>
          </TabsList>

          {/* Tab Content: Ringkasan */}
          <TabsContent value="ringkasan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Peringkat Alternatif</CardTitle>
                <CardDescription className="text-neutral-700 dark:text-white">
                  Daftar alternatif terurut berdasarkan nilai akhir tertinggi ke
                  terendah
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search input */}
                <div className="relative w-full max-w-md mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    className="w-full pl-10 pr-10"
                    placeholder="Cari berdasarkan nama atau kode alternatif"
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

                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-[#2A2524]">
                      <TableRow>
                        <TableHead className="w-[80px] text-center">
                          Ranking
                        </TableHead>
                        <TableHead className="w-[100px]">Kode</TableHead>
                        <TableHead className="w-[300px]">Alternatif</TableHead>
                        <TableHead>Total Nilai</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAlternatifs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                              <Search className="h-8 w-8 mb-1" />
                              <p>
                                Tidak ditemukan alternatif dengan kata kunci "
                                {searchTerm}"
                              </p>
                              <Button
                                variant="link"
                                onClick={handleClearSearch}
                              >
                                Tampilkan semua
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAlternatifs.map((alt) => {
                          const { totalScore } = calculateScoreDetail(alt);
                          const globalIndex = sortedAlternatifs.findIndex(
                            (item) => item.id === alt.id
                          );
                          return (
                            <TableRow
                              key={alt.id}
                              className={
                                globalIndex === 0
                                  ? "bg-yellow-50 dark:bg-[#2A2524]"
                                  : ""
                              }
                            >
                              <TableCell className="text-center font-medium">
                                <div className="flex justify-center">
                                  {getRankIcon(globalIndex)}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {alt.kode}
                              </TableCell>
                              <TableCell>{alt.nama}</TableCell>
                              <TableCell className="font-semibold">
                                {totalScore}
                              </TableCell>
                              <TableCell className="text-right">
                                {globalIndex === 0 ? (
                                  <Badge className="bg-green-500">
                                    Terbaik
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Kandidat</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {searchTerm && filteredAlternatifs.length > 0 && (
                  <div className="mt-3 text-sm text-gray-500 text-right">
                    Ditemukan {filteredAlternatifs.length} dari{" "}
                    {sortedAlternatifs.length} alternatif
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bobot Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Bobot Faktor</CardTitle>
                <CardDescription>
                  Bobot yang digunakan dalam perhitungan profile matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-blue-50 border border-blue-100 dark:bg-[#2A2524] dark:border-none">
                    <p className="text-sm text-blue-700 font-medium mb-2 dark:text-primary">
                      Core Factor (CF)
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-primary">
                      {(project.bobot_CF * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-4 rounded-md bg-purple-50 border border-purple-100 dark:bg-[#2A2524] dark:border-none">
                    <p className="text-sm text-purple-700 font-medium mb-2 dark:text-primary">
                      Secondary Factor (SF)
                    </p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-primary">
                      {(project.bobot_SF * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Content: Detail */}
          <TabsContent value="detail" className="space-y-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                className="w-full pl-10 pr-10"
                placeholder="Cari perhitungan berdasarkan nama atau kode"
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

            {filteredAlternatifs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium">Tidak Ada Hasil</h3>
                  <p className="text-gray-500 max-w-md mt-2 mb-4">
                    Tidak ditemukan perhitungan dengan kata kunci "{searchTerm}"
                  </p>
                  <Button variant="outline" onClick={handleClearSearch}>
                    Tampilkan Semua Perhitungan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredAlternatifs.map((alt) => {
                const { totalScore, details } = calculateScoreDetail(alt);
                const globalIndex = sortedAlternatifs.findIndex(
                  (item) => item.id === alt.id
                );
                return (
                  <Card
                    key={alt.id}
                    className={`mb-6 ${
                      globalIndex === 0 ? "border-blue-200" : ""
                    }`}
                  >
                    <CardHeader className={globalIndex === 0 ? "" : ""}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getRankIcon(globalIndex)}
                          <CardTitle>
                            {alt.nama}{" "}
                            <span className="text-gray-500">({alt.kode})</span>
                          </CardTitle>
                        </div>
                        <Badge
                          className={
                            globalIndex === 0 ? "bg-blue-500" : "bg-gray-500"
                          }
                        >
                          Ranking {globalIndex + 1}
                        </Badge>
                      </div>
                      <CardDescription className="text-neutral-700 dark:text-white">
                        Detail perhitungan nilai untuk setiap kriteria
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-50 dark:bg-[#2A2524]">
                            <TableRow>
                              <TableHead className="p-3">Kriteria</TableHead>
                              <TableHead className="p-3">
                                Bobot Kriteria
                              </TableHead>
                              <TableHead className="p-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="flex items-center gap-1">
                                      <span>NCF</span>
                                      <Info className="h-3 w-3" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="w-56">
                                        Nilai rata-rata Core Factor (faktor
                                        utama)
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableHead>
                              <TableHead className="p-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="flex items-center gap-1">
                                      <span>NSF</span>
                                      <Info className="h-3 w-3" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="w-56">
                                        Nilai rata-rata Secondary Factor (faktor
                                        pendukung)
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableHead>
                              <TableHead className="p-3">
                                NCF × {(project.bobot_CF * 100).toFixed(0)}%
                              </TableHead>
                              <TableHead className="p-3">
                                NSF × {(project.bobot_SF * 100).toFixed(0)}%
                              </TableHead>
                              <TableHead className="p-3 text-right">
                                Nilai Kriteria
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {details.map((d, index) => (
                              <TableRow key={index}>
                                <TableCell className="p-3 font-medium">
                                  {d.kriteriaNama}
                                </TableCell>
                                <TableCell className="p-3">
                                  {(d.kriteriaBobot * 100).toFixed(0)}%
                                </TableCell>
                                <TableCell className="p-3">{d.ncf}</TableCell>
                                <TableCell className="p-3">{d.nsf}</TableCell>
                                <TableCell className="p-3">
                                  {d.skorCF}
                                </TableCell>
                                <TableCell className="p-3">
                                  {d.skorSF}
                                </TableCell>
                                <TableCell className="p-3 text-right font-semibold">
                                  {d.skorPerKriteria}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-gray-50 dark:bg-[#2A2524]">
                              <TableCell
                                colSpan={6}
                                className="p-3 text-right font-bold"
                              >
                                Total Nilai Akhir
                              </TableCell>
                              <TableCell className="p-3 text-right font-bold text-blue-700">
                                {totalScore}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Formula explanation */}
                      <div className="mt-6 p-4 bg-slate-50 dark:bg-[#2A2524] rounded-md text-sm">
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-white">
                          Rumus Perhitungan:
                        </h4>
                        <p className="mb-1">
                          1. NCF = Rata-rata nilai Core Factor
                        </p>
                        <p className="mb-1">
                          2. NSF = Rata-rata nilai Secondary Factor
                        </p>
                        <p className="mb-1">
                          3. Nilai Per Kriteria = (NCF ×{" "}
                          {(project.bobot_CF * 100).toFixed(0)}% + NSF ×{" "}
                          {(project.bobot_SF * 100).toFixed(0)}%) × Bobot
                          Kriteria
                        </p>
                        <p className="mb-1">
                          4. Total Nilai Akhir = Jumlah dari semua Nilai Per
                          Kriteria
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            {searchTerm && filteredAlternatifs.length > 0 && (
              <div className="text-sm text-gray-500 text-right dark:text-white">
                Ditemukan {filteredAlternatifs.length} dari{" "}
                {sortedAlternatifs.length} alternatif
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
