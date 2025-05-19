import { Link, useParams } from "react-router-dom";
import { useWeightedProduct } from "@/hooks/useWeightedProduct";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer } from "lucide-react";
import { useRef } from "react";
import printWeightedProduct from "@/utils/printWeightedProduct";

export default function HasilPerhitunganWp() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    criteria,
    vectorS,
    finalResults,
    totalBobot,
    normalizedWeights,
    isLoading,
    error,
    refetch,
  } = useWeightedProduct(projectId || "");

  const printContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    printWeightedProduct({
      criteria,
      vectorS,
      finalResults,
      totalBobot,
      normalizedWeights,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 lg:px-8">
        <div>
          <Skeleton className="h-8 w-[280px] mb-2" />
          <Skeleton className="h-4 w-[240px] mb-8" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[200px] w-full rounded-md" />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-md max-w-md text-center">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
        <Button onClick={() => refetch()}>Coba Lagi</Button>
      </div>
    );
  }

  const hasResults = finalResults.length > 0;
  const totalVectorS = vectorS.reduce((acc, curr) => acc + curr.vectorS, 0);

  const winner = hasResults ? finalResults[0] : null;

  return (
    <div className="flex flex-col gap-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hasil Perhitungan Weighted Product
          </h1>
          <p className="text-neutral-500">
            Hasil perhitungan dan perankingan alternatif menggunakan metode
            Weighted Product
          </p>
        </div>

        {hasResults && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Hasil</span>
            </Button>
          </div>
        )}
      </div>

      {!hasResults ? (
        <Card className="bg-indigo-100 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-primary font-bold text-xl">
              Data Tidak Lengkap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary font-semibold">
              Tidak dapat melakukan perhitungan. Pastikan semua alternatif sudah
              dinilai untuk semua kriteria.
            </p>
            <Link
              to={`/projects/${projectId}/weighted-product/penilaian-alternatif`}
            >
              <Button
                variant="outline"
                className="mt-4 bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200"
              >
                Ke Halaman Penilaian
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div ref={printContentRef}>
          {/* Winner Card */}
          {winner && (
            <Card className="bg-indigo-100 border-green-200 dark:bg-[#1a1a1a] dark:border-green-600/50">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-green-800 dark:text-green-300">
                  Alternatif Terbaik
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
                  <Badge className="w-fit mx-auto sm:mx-0 mb-2 bg-green-600">
                    {winner.kode}
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {winner.nama}
                  </h3>
                  <p className="mt-1 text-primary text-sm sm:text-base">
                    Ranking #1 dengan nilai {winner.vectorV.toFixed(4)}
                  </p>
                </div>
                <div className="flex items-center justify-center p-3 sm:p-4 border-primary border bg-green-100 border-none rounded-2xl h-24 w-24 sm:h-28 sm:w-28 mt-2 sm:mt-0 shrink-0">
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl font-bold text-green-700">
                      {winner.vectorV.toFixed(3)}
                    </span>
                    <span className="block text-xs text-green-600 mt-1">
                      Nilai V
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="ranking" className="w-full mt-4">
            <TabsList className="mb-4 bg-secondary dark:bg-primary">
              <TabsTrigger value="ranking" className="cursor-pointer">
                Perankingan
              </TabsTrigger>
              <TabsTrigger value="criteria" className="cursor-pointer">
                Kriteria
              </TabsTrigger>
              <TabsTrigger value="calculation" className="cursor-pointer">
                Perhitungan
              </TabsTrigger>
            </TabsList>

            {/* Ranking Tab */}
            <TabsContent value="ranking">
              <Card>
                <CardHeader>
                  <CardTitle>Hasil Perankingan Akhir</CardTitle>
                  <CardDescription className="text-neutral-500">
                    Daftar alternatif berdasarkan ranking tertinggi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-[#1a1a1a]">
                      <TableRow>
                        <TableHead className="w-16 font-medium text-gray-700 dark:text-white">
                          Ranking
                        </TableHead>
                        <TableHead className="w-24 font-medium text-gray-700 dark:text-white">
                          Kode
                        </TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-white">
                          Nama Alternatif
                        </TableHead>
                        <TableHead className="text-right font-medium text-gray-700 dark:text-white">
                          Nilai Vector V
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finalResults.map((result) => (
                        <TableRow
                          key={result.alternatifId}
                          className={
                            result.rank === 1
                              ? "bg-green-50 hover:bg-green-100 dark:bg-[#1a1a1a] dark:hover:bg-green-600/50"
                              : "hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                          }
                        >
                          <TableCell className="font-medium">
                            {result.rank === 1 ? (
                              <Badge
                                variant="outline"
                                className=" text-green-600 flex items-center justify-center"
                              >
                                {result.rank}
                              </Badge>
                            ) : (
                              result.rank
                            )}
                          </TableCell>
                          <TableCell>{result.kode}</TableCell>
                          <TableCell>
                            {result.nama}
                            {result.rank === 1 && (
                              <Badge className="ml-2 bg-green-500">
                                Terbaik
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {result.vectorV.toFixed(4)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Criteria Tab */}
            <TabsContent value="criteria">
              <Card>
                <CardHeader>
                  <CardTitle>Data Kriteria dan Bobot</CardTitle>
                  <CardDescription>
                    Bobot preferensi yang digunakan dalam perhitungan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-[#1a1a1a]">
                      <TableRow>
                        <TableHead className="w-24 font-medium text-gray-700 dark:text-white">
                          Kode
                        </TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-white">
                          Kriteria
                        </TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-white">
                          Jenis
                        </TableHead>
                        <TableHead className="font-medium text-gray-700 dark:text-white">
                          Bobot Asli
                        </TableHead>
                        <TableHead className="text-right font-medium text-gray-700 dark:text-white">
                          Bobot Normalisasi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criteria.map((crit) => (
                        <TableRow
                          key={crit.id}
                          className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                        >
                          <TableCell className="font-medium">
                            {crit.kode}
                          </TableCell>
                          <TableCell>{crit.nama_kriteria}</TableCell>
                          <TableCell>
                            {crit.keterangan.toLowerCase() === "benefit" ? (
                              <Badge className="bg-green-500">Benefit</Badge>
                            ) : (
                              <Badge className="bg-red-500">Cost</Badge>
                            )}
                          </TableCell>
                          <TableCell>{crit.bobot}</TableCell>
                          <TableCell className="text-right">
                            {normalizedWeights[crit.id].toFixed(4)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="font-semibold">
                          Total
                        </TableCell>
                        <TableCell>{totalBobot}</TableCell>
                        <TableCell className="text-right">1.0000</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calculation Tab */}
            <TabsContent value="calculation">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Perhitungan Vector S</CardTitle>
                    <CardDescription>
                      Nilai preferensi untuk setiap alternatif (S = ∏(Xi^Wi))
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-[#1a1a1a]">
                        <TableRow>
                          <TableHead className="w-24 font-medium text-gray-700 dark:text-white">
                            Kode
                          </TableHead>
                          <TableHead className="font-medium text-gray-700 dark:text-white">
                            Alternatif
                          </TableHead>
                          <TableHead className="text-right font-medium text-gray-700 dark:text-white">
                            Nilai Vector S
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vectorS.map((vs) => (
                          <TableRow
                            key={vs.alternatifId}
                            className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                          >
                            <TableCell className="font-medium">
                              {vs.kode}
                            </TableCell>
                            <TableCell>{vs.nama}</TableCell>
                            <TableCell className="text-right">
                              {vs.vectorS.toFixed(4)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2} className="font-semibold">
                            Total
                          </TableCell>
                          <TableCell className="text-right">
                            {totalVectorS.toFixed(4)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>

                    <div className="mt-6 bg-gray-50 p-4 rounded-md dark:bg-[#1a1a1a]">
                      <h3 className="font-semibold mb-2 ">
                        Rumus Perhitungan Vector V
                      </h3>
                      <p className="text-sm text-neutral-500 mb-2 dark:text-white/70">
                        Vector V dihitung dengan membagi nilai Vector S
                        alternatif dengan total nilai Vector S semua alternatif:
                      </p>
                      <p className="text-sm font-semibold mb-2">
                        V<sub>i</sub> = S<sub>i</sub> / ∑S<sub>i</sub>
                      </p>
                      <ul className="text-sm list-disc list-inside space-y-1 text-neutral-500 dark:text-white/70">
                        <li>
                          V<sub>i</sub> = Nilai vector V alternatif ke-i
                        </li>
                        <li>
                          S<sub>i</sub> = Nilai vector S alternatif ke-i
                        </li>
                        <li>
                          ∑S<sub>i</sub> = Total nilai vector S semua alternatif
                          ({totalVectorS.toFixed(4)})
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
