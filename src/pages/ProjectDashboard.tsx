import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import supabase from "@/utils/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileChartColumn,
  FileCog,
  FileSpreadsheet,
  List,
  PlusCircle,
  Search,
  Sliders,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import InvitationCodeDialog from "@/fragments/InvitationCodeDialog";

interface Project {
  id: string;
  name: string;
  description: string;
  metode: "pm" | "wp" | string;
  bobot_CF: number;
  bobot_SF: number;
  code: string;
  created_at: string;
}

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface HasilProfileMatching {
  alternatif_id: string;
  nilai_akhir: number;
  rangking: number;
  alternatif?: {
    id: string;
    nama: string;
    kode: string;
  };
}

interface NilaiWp {
  alternatif_id: string;
  nilai: number;
  alternatif?: {
    id: string;
    nama: string;
    kode: string;
  };
}

type TopAlternatif = HasilProfileMatching | NilaiWp;

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [alternatifCount, setAlternatifCount] = useState<number>(0);
  const [kriteriaCount, setKriteriaCount] = useState<number>(0);
  const [subKriteriaCount, setSubKriteriaCount] = useState<number>(0);
  const [penilaianCount, setPenilaianCount] = useState<number>(0);
  const [topAlternatifs, setTopAlternatifs] = useState<TopAlternatif[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [memberSearch, setMemberSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [membersPerPage] = useState<number>(5);

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) {
        console.error("Error fetching project:", projectError);
        return;
      }

      setProject(projectData as Project);

      const { count: altCount, error: altError } = await supabase
        .from("alternatif")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (!altError) setAlternatifCount(altCount || 0);

      const { data: kriteriaData, error: kriteriaError } = await supabase
        .from("kriteria")
        .select("id")
        .eq("project_id", projectId);

      if (!kriteriaError) {
        setKriteriaCount(kriteriaData?.length || 0);

        if ((projectData as Project)?.metode === "pm") {
          const kriteriaIds = kriteriaData?.map((k) => k.id) || [];

          if (kriteriaIds.length > 0) {
            const { count: subKCount, error: subKError } = await supabase
              .from("sub_kriteria")
              .select("*", { count: "exact", head: true })
              .in("kriteria", kriteriaIds);

            if (!subKError) setSubKriteriaCount(subKCount || 0);
          }
        } else if ((projectData as Project)?.metode === "wp") {
          const { count: wpKCount, error: wpKError } = await supabase
            .from("weighted_kriteria")
            .select("*", { count: "exact", head: true })
            .eq("project_id", projectId);

          if (!wpKError) setSubKriteriaCount(wpKCount || 0);
        }
      }

      if ((projectData as Project)?.metode === "pm") {
        const { data: topAlts, error: topAltsError } = await supabase
          .from("hasil_profile_matching")
          .select(
            `
            alternatif_id,
            nilai_akhir,
            rangking,
            alternatif (
              id,
              nama,
              kode
            )
          `
          )
          .eq("project_id", projectId)
          .order("rangking", { ascending: true })
          .limit(5);

        if (!topAltsError && topAlts && topAlts.length > 0) {
          setTopAlternatifs(topAlts as unknown as HasilProfileMatching[]);
        } else {
          const { data: altData, error: altDataError } = await supabase
            .from("alternatif")
            .select("id, nama, kode")
            .eq("project_id", projectId)
            .limit(5);

          if (!altDataError && altData && altData.length > 0) {
            const formattedAlts = altData.map((alt, index) => ({
              alternatif_id: alt.id,
              nilai_akhir: 0, // Default value
              rangking: index + 1, // Ranking based on order
              alternatif: {
                id: alt.id,
                nama: alt.nama,
                kode: alt.kode,
              },
            }));

            setTopAlternatifs(
              formattedAlts as unknown as HasilProfileMatching[]
            );
          }
        }

        const { data: alternatifIds } = await supabase
          .from("alternatif")
          .select("id")
          .eq("project_id", projectId);

        if (alternatifIds && alternatifIds.length > 0) {
          const alternatifIdList = alternatifIds.map((a) => a.id);

          const { count: nilaiCount, error: nilaiError } = await supabase
            .from("nilai")
            .select("id", { count: "exact", head: true })
            .in("alternatif_id", alternatifIdList);

          if (!nilaiError) setPenilaianCount(nilaiCount || 0);
        }
      } else if ((projectData as Project)?.metode === "wp") {
        const { data: alternatifIds } = await supabase
          .from("alternatif")
          .select("id")
          .eq("project_id", projectId);

        if (alternatifIds && alternatifIds.length > 0) {
          const alternatifIdList = alternatifIds.map((a) => a.id);

          const { data: topAlts, error: topAltsError } = await supabase
            .from("nilai_wp")
            .select(
              `
            alternatif_id,
            nilai,
            alternatif (
              id,
              nama,
              kode
            )
          `
            )
            .in("alternatif_id", alternatifIdList)
            .order("nilai", { ascending: false })
            .limit(5);

          if (!topAltsError && topAlts && topAlts.length > 0) {
            setTopAlternatifs(topAlts as unknown as NilaiWp[]);
          } else {
            const { data: altData, error: altDataError } = await supabase
              .from("alternatif")
              .select("id, nama, kode")
              .eq("project_id", projectId)
              .limit(5);

            if (!altDataError && altData && altData.length > 0) {
              const formattedAlts = altData.map((alt) => ({
                alternatif_id: alt.id,
                nilai: 0, // Default value
                alternatif: {
                  id: alt.id,
                  nama: alt.nama,
                  kode: alt.kode,
                },
              }));

              setTopAlternatifs(formattedAlts as unknown as NilaiWp[]);
            }
          }

          const { count: nilaiWpCount, error: nilaiWpError } = await supabase
            .from("nilai_wp")
            .select("id", { count: "exact", head: true })
            .in("alternatif_id", alternatifIdList);

          if (!nilaiWpError) setPenilaianCount(nilaiWpCount || 0);
        }
      }

      const totalSteps = (projectData as Project)?.metode === "pm" ? 4 : 3;
      let completedSteps = 0;

      if (alternatifCount > 0) completedSteps++;
      if (kriteriaCount > 0) completedSteps++;
      if (subKriteriaCount > 0) completedSteps++;
      if (penilaianCount > 0) completedSteps++;

      setCompletionPercentage(Math.floor((completedSteps / totalSteps) * 100));

      const { data: membersData, error: membersError } = await supabase
        .from("user_project")
        .select(
          `
          id,
          created_at,
          users (
            id,
            name,
            email
          )
        `
        )
        .eq("project_id", projectId);

      if (!membersError && membersData) {
        const formattedMembers: ProjectMember[] = membersData.map(
          (item: any) => ({
            id: item.users.id,
            name: item.users.name,
            email: item.users.email,
            created_at: item.created_at,
          })
        );
        setProjectMembers(formattedMembers);
      }

      setLoading(false);
    }

    fetchProject();
  }, [
    projectId,
    alternatifCount,
    kriteriaCount,
    subKriteriaCount,
    penilaianCount,
  ]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6 ">
        <Card>
          <CardHeader>
            <CardTitle>Error Memuat Proyek</CardTitle>
            <CardDescription>
              Kami tidak dapat memuat detail proyek. Silakan coba lagi.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/dashboard">Kembali ke Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const methodName =
    project.metode === "pm"
      ? "Profile Matching"
      : project.metode === "wp"
      ? "Weighted Product"
      : "Unknown Method";

  const quickLinks =
    project.metode === "pm"
      ? [
          {
            name: "Alternatif",
            icon: <Users className="h-5 w-5" />,
            url: `/projects/${projectId}/profile-matching/alternatif`,
          },
          {
            name: "Kriteria",
            icon: <List className="h-5 w-5" />,
            url: `/projects/${projectId}/profile-matching/kriteria`,
          },
          {
            name: "Sub Kriteria",
            icon: <FileSpreadsheet className="h-5 w-5" />,
            url: `/projects/${projectId}/profile-matching/kriteria/sub`,
          },
          {
            name: "Penilaian",
            icon: <Sliders className="h-5 w-5" />,
            url: `/projects/${projectId}/profile-matching/penilaian`,
          },
          {
            name: "Hasil",
            icon: <FileChartColumn className="h-5 w-5" />,
            url: `/projects/${projectId}/profile-matching/hasil-perhitungan`,
          },
        ]
      : [
          {
            name: "Alternatif",
            icon: <Users className="h-5 w-5" />,
            url: `/projects/${projectId}/weighted-product/alternatif`,
          },
          {
            name: "Kriteria",
            icon: <List className="h-5 w-5" />,
            url: `/projects/${projectId}/weighted-product/kriteria`,
          },
          {
            name: "Pembobotan",
            icon: <Sliders className="h-5 w-5" />,
            url: `/projects/${projectId}/weighted-product/pembobotan-kriteria`,
          },
          {
            name: "Penilaian",
            icon: <FileCog className="h-5 w-5" />,
            url: `/projects/${projectId}/weighted-product/penilaian-alternatif`,
          },
          {
            name: "Hasil",
            icon: <Calculator className="h-5 w-5" />,
            url: `/projects/${projectId}/weighted-product/hasil-perhitungan`,
          },
        ];

  const isHasilProfileMatching = (
    item: TopAlternatif
  ): item is HasilProfileMatching => {
    return "nilai_akhir" in item;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex md:flex-row flex-col md:items-center md:justify-between ">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-500">
            {project.description}
            <Badge variant="outline" className="md:ml-2 mt-2 md:mt-0">
              {methodName}
            </Badge>
          </p>
        </div>
        <div className="flex flex-col mt-2 gap-y-2 md:gap-y-4 lg:flex-row gap-x-4">
          <Button asChild>
            <Link
              to={
                project.metode === "pm"
                  ? `/projects/${projectId}/profile-matching/hasil-perhitungan`
                  : `/projects/${projectId}/weighted-product/hasil-perhitungan`
              }
            >
              <Activity className="mr-2 h-4 w-4" />
              Lihat Hasil
            </Link>
          </Button>
          <InvitationCodeDialog>
            <Button variant="outline">
              <Copy className="h-4 w-4" />
              <span>Invitation Code</span>
            </Button>
          </InvitationCodeDialog>
        </div>
      </div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alternatif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {alternatifCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Users className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Belum ada alternatif
                </p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{alternatifCount}</div>
                <p className="text-xs text-muted-foreground">
                  {alternatifCount} alternatif terdaftar
                </p>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link
                to={
                  project.metode === "pm"
                    ? `/projects/${projectId}/profile-matching/alternatif`
                    : `/projects/${projectId}/weighted-product/alternatif`
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Kelola Alternatif
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {project.metode === "pm" ? "Kriteria & Sub-Kriteria" : "Kriteria"}
            </CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {project.metode === "pm" ? (
              kriteriaCount === 0 && subKriteriaCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <List className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Belum ada kriteria & sub-kriteria
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {kriteriaCount} / {subKriteriaCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {kriteriaCount} kriteria dan {subKriteriaCount} sub-kriteria
                  </p>
                </>
              )
            ) : subKriteriaCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <List className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Belum ada kriteria
                </p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{subKriteriaCount}</div>
                <p className="text-xs text-muted-foreground">
                  {subKriteriaCount} kriteria terdaftar
                </p>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link
                to={
                  project.metode === "pm"
                    ? `/projects/${projectId}/profile-matching/kriteria`
                    : `/projects/${projectId}/weighted-product/kriteria`
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Kelola Kriteria
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Penyelesaian Proyek
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {completionPercentage === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Target className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Mulai isi data proyek Anda
                </p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {completionPercentage}%
                </div>
                <Progress value={completionPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {completionPercentage < 100
                    ? "Selesaikan semua langkah untuk melihat hasil akhir"
                    : "Proyek siap untuk dianalisis"}
                </p>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link
                to={
                  project.metode === "pm"
                    ? `/projects/${projectId}/profile-matching/penilaian`
                    : `/projects/${projectId}/weighted-product/penilaian-alternatif`
                }
              >
                <Sliders className="mr-2 h-4 w-4" />
                Lanjutkan Pengaturan
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>{" "}
      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Method specific info and members card */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                {project.metode === "pm"
                  ? "Informasi Profile Matching"
                  : "Informasi Weighted Product"}
              </CardTitle>
              <CardDescription>
                {project.metode === "pm"
                  ? "Perbandingan antara nilai alternatif dan nilai profil ideal"
                  : "Pengambilan keputusan berdasarkan perkalian kriteria berbobot"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {project.metode === "pm" ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100 dark:bg-[#1e3a5b] dark:border-blue-200">
                      <div className="text-xs font-semibold text-blue-700 dark:text-white">
                        Core Factor (CF)
                      </div>
                      <div className="text-xl font-bold text-blue-800 dark:text-white">
                        {(project.bobot_CF * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-blue-600 dark:text-white">
                        Kriteria utama
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 dark:bg-[#4f46e5] dark:border-indigo-200">
                      <div className="text-xs font-semibold text-indigo-700 dark:text-white">
                        Secondary Factor (SF)
                      </div>
                      <div className="text-xl font-bold text-indigo-800 dark:text-white">
                        {(project.bobot_SF * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-white">
                        Kriteria pendukung
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold mb-1">
                      Cara Kerja Profile Matching:
                    </h3>
                    <ol className="text-xs list-decimal list-inside space-y-0">
                      <li>
                        Menentukan GAP (perbedaan nilai alternatif dan nilai
                        profil)
                      </li>
                      <li>Mengkonversi GAP menjadi nilai bobot standar</li>
                      <li>Menghitung nilai Core Factor dan Secondary Factor</li>
                      <li>Menghitung nilai akhir berdasarkan bobot kriteria</li>
                      <li>Mengurutkan alternatif berdasarkan nilai akhir</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-green-50 p-3 rounded-md border border-green-100 dark:bg-[#1f2937] dark:border-green-200">
                    <div className="text-xs font-semibold text-green-700 dark:text-white">
                      Metode Weighted Product
                    </div>
                    <div className="text-lg font-medium text-green-800 mt-1 dark:text-white">
                      <span className="font-mono">S(i) = ∏(Xij)^Wj</span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-white">
                      S(i): preferensi, Xij: nilai alternatif, Wj: bobot
                      kriteria
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold mb-1">
                      Cara Kerja Weighted Product:
                    </h3>
                    <ol className="text-xs list-decimal list-inside space-y-0">
                      <li>Menentukan kriteria dan bobotnya</li>
                      <li>Normalisasi bobot kriteria</li>
                      <li>
                        Menilai setiap alternatif terhadap setiap kriteria
                      </li>
                      <li>Menghitung nilai preferensi menggunakan rumus WP</li>
                      <li>
                        Mengurutkan alternatif berdasarkan nilai preferensi
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                asChild
              >
                <Link
                  to={
                    project.metode === "pm"
                      ? `/projects/${projectId}/profile-matching/hasil-perhitungan`
                      : `/projects/${projectId}/weighted-product/hasil-perhitungan`
                  }
                >
                  <Calculator className="mr-2 h-3 w-3" />
                  Lihat Hasil Perhitungan
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Project Members Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Anggota Proyek</CardTitle>
                <InvitationCodeDialog>
                  <Button variant="outline" size="sm">
                    <Copy className="mr-2 h-3 w-3" />
                    <span className="text-xs">Invitation Code</span>
                  </Button>
                </InvitationCodeDialog>
              </div>
              <CardDescription>
                Daftar anggota yang berpartisipasi dalam proyek ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {" "}
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari anggota..."
                  className="w-full pl-8 text-sm"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>
              {/* Members list */}
              {projectMembers.length > 0 ? (
                <div className="space-y-2">
                  {projectMembers
                    .filter(
                      (member) =>
                        member.name
                          .toLowerCase()
                          .includes(memberSearch.toLowerCase()) ||
                        member.email
                          .toLowerCase()
                          .includes(memberSearch.toLowerCase())
                    )
                    .slice(
                      (currentPage - 1) * membersPerPage,
                      currentPage * membersPerPage
                    )
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-primary-foreground rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700">
                            <span className="text-sm font-medium">
                              {member.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {member.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Pagination */}
                  {(() => {
                    const filteredMembers = projectMembers.filter(
                      (member) =>
                        member.name
                          .toLowerCase()
                          .includes(memberSearch.toLowerCase()) ||
                        member.email
                          .toLowerCase()
                          .includes(memberSearch.toLowerCase())
                    );
                    const totalPages = Math.ceil(
                      filteredMembers.length / membersPerPage
                    );

                    return totalPages > 1 ? (
                      <div className="flex items-center justify-center space-x-2 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            className="text-xs"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Users className="h-10 w-10 text-gray-300 mb-2" />
                  <h3 className="text-sm font-medium mb-1">
                    Belum Ada Anggota Lain
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xs mb-3">
                    Bagikan kode undangan untuk mengajak anggota lain bergabung
                    dalam proyek ini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Quick links and top alternatives */}
        <div className="space-y-6">
          {/* Quick links card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
              <CardDescription>
                Akses bagian utama dari proyek {methodName} Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-3 space-y-2"
                    asChild
                  >
                    <Link to={link.url}>
                      {link.icon}
                      <span className="text-xs">{link.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* List Alternatif card */}{" "}
          <Card>
            <CardHeader>
              <CardTitle>List Alternatif</CardTitle>
            </CardHeader>
            <CardContent>
              {alternatifCount > 0 && topAlternatifs.length > 0 ? (
                <div className="space-y-3">
                  {topAlternatifs.map((alt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-primary-foreground rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700">
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {alt.alternatif?.nama || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {alt.alternatif?.kode || "No Code"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {isHasilProfileMatching(alt) && alt.rangking && (
                          <Badge variant="outline">Rank: {alt.rangking}</Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full mt-3" asChild>
                    <Link
                      to={
                        project.metode === "pm"
                          ? `/projects/${projectId}/profile-matching/alternatif`
                          : `/projects/${projectId}/weighted-product/alternatif`
                      }
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Tampilkan Lebih Banyak Alternatif
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium mb-1">
                    Belum Ada Alternatif
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs mb-4">
                    Tambahkan alternatif untuk memulai proses penilaian
                  </p>
                  <Button asChild>
                    <Link
                      to={
                        project.metode === "pm"
                          ? `/projects/${projectId}/profile-matching/alternatif`
                          : `/projects/${projectId}/weighted-product/alternatif`
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah Alternatif
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>{" "}
      </div>
      {/* Project settings link */}
    </div>
  );
}
