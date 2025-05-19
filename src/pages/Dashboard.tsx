import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "@/utils/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  Clock,
  FileText,
  ListChecks,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CreateProjectDialog from "@/fragments/CreateProjectDialog";
import JoinProjectDialog from "@/fragments/JoinProjectDialog";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  name: string;
  description: string;
  metode: "pm" | "wp" | string;
  created_at: string;
  updated_at: string;
  user_id: string;
  // Tambahan untuk statistik
  _count?: {
    alternatif: number;
    kriteria: number;
  };
}

interface UserStats {
  totalProjects: number;
  totalProfileMatchingProjects: number;
  totalWeightedProductProjects: number;
  recentlyActive: Project[];
  completedProjects: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [userStats, setUserStats] = useState<UserStats>({
    totalProjects: 0,
    totalProfileMatchingProjects: 0,
    totalWeightedProductProjects: 0,
    recentlyActive: [],
    completedProjects: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: projectsData, error: projectsError } = await supabase
          .from("user_project")
          .select(
            `
            projects (
              id,
              name,
              description,
              code,
              metode,
              created_at,
              alternatif:alternatif(count),
              kriteria:kriteria(count),
              weighted_kriteria:weighted_kriteria(count)
            )
          `
          )
          .eq("user_id", user.id);

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
          setLoading(false);
          return;
        }

        const formattedProjects = projectsData.map((item: any) => ({
          id: item.projects.id,
          name: item.projects.name,
          description: item.projects.description,
          metode: item.projects.metode,
          created_at: item.projects.created_at,
          updated_at: item.projects.created_at,
          user_id: user.id,
          _count: {
            alternatif: item.projects.alternatif?.length || 0,
            kriteria: item.projects.kriteria?.length || 0,
            weighted_kriteria: item.projects.weighted_kriteria?.length || 0,
          },
        }));

        setProjects(formattedProjects);

        setRecentProjects(formattedProjects.slice(0, 3));

        const pmProjects = formattedProjects.filter(
          (p) => p.metode === "pm"
        ).length;
        const wpProjects = formattedProjects.filter(
          (p) => p.metode === "wp"
        ).length;

        const completedProjects = formattedProjects.filter((p) => {
          if (p.metode === "pm") {
            return (
              (p._count?.alternatif || 0) > 0 && (p._count?.kriteria || 0) > 0
            );
          } else if (p.metode === "wp") {
            return (
              (p._count?.alternatif || 0) > 0 &&
              (p._count?.weighted_kriteria || 0) > 0
            );
          }
          return false;
        }).length;

        setUserStats({
          totalProjects: formattedProjects.length,
          totalProfileMatchingProjects: pmProjects,
          totalWeightedProductProjects: wpProjects,
          recentlyActive: formattedProjects.slice(0, 5),
          completedProjects: completedProjects,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProjects = searchQuery
    ? projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>

        <Skeleton className="h-80 rounded-xl mt-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6">
      {/* Header dan Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Selamat Datang di DecisionHub</h1>
          <p className="text-muted-foreground">
            Platform Sistem Pendukung Keputusan untuk membantu analisis dengan
            metode Profile Matching dan Weighted Product
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari proyek..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <CreateProjectDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Proyek
              </Button>
            </CreateProjectDialog>

            <JoinProjectDialog>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Gabung
              </Button>
            </JoinProjectDialog>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <h1 className="font-semibold text-lg pb-2">Total Proyek</h1>
            <div className="text-3xl font-bold pb-2">
              {userStats.totalProjects}
            </div>
            <div className="mt-1 flex items-center text-sm text-muted-foreground">
              <div className="flex gap-1">
                <Badge variant="outline" className="bg-blue-50">
                  <span className="text-xs">
                    Profile Matching: {userStats.totalProfileMatchingProjects}
                  </span>
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  <span className="text-xs">
                    Weighted Product: {userStats.totalWeightedProductProjects}
                  </span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h1 className="font-semibold pb-2"> Aktivitas Terbaru</h1>
            <div className="text-3xl font-bold pb-2">
              {formatDate(new Date().toISOString())}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentProjects.length > 0
                ? `Terakhir bekerja pada ${recentProjects[0]?.name || "proyek"}`
                : "Belum ada aktivitas proyek"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Proyek Terbaru dan Metode SPK */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Proyek Terbaru */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Proyek Terbaru</CardTitle>
            </div>
            <CardDescription>
              Proyek yang baru-baru ini Anda buat atau modifikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-2">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-4 rounded-lg border p-3 mx-4 hover:bg-accent transition-colors dark:hover:bg-secondary/70">
                      <div className="rounded-md bg-primary/10 p-2">
                        {project.metode === "pm" ? (
                          <ListChecks className="h-6 w-6 text-primary" />
                        ) : (
                          <Activity className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">
                            {project.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {project.metode === "pm"
                                ? "Profile Matching"
                                : "Weighted Product"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 dark:text-white">
                          {project.description || "Tidak ada deskripsi"}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground dark:text-white">
                          <Clock className="mr-1 h-3 w-3" />
                          Diperbarui pada {formatDate(project.updated_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="text-lg font-medium mb-1">Belum Ada Proyek</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    Mulai membuat proyek baru untuk menerapkan metode Profile
                    Matching atau Weighted Product
                  </p>
                  <CreateProjectDialog>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Buat Proyek Pertama
                    </Button>
                  </CreateProjectDialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel Kanan - Metode SPK */}
        <div className="">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Metode SPK</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 dark:bg-[#1e3a8a]/10 dark:border-blue-900/50">
                  <h4 className="text-sm font-medium text-blue-700 mb-2 dark:text-white ">
                    Profile Matching
                  </h4>
                  <p className="text-xs text-blue-600 mb-3 dark:text-white">
                    Membandingkan kompetensi individu dengan kompetensi ideal
                    untuk suatu posisi
                  </p>
                  <div className="bg-white/50 p-3 rounded text-xs font-mono text-blue-800 dark:text-white dark:bg-[#1e3a8a]/10 ">
                    <p>NCF = ∑NC / ∑IC</p>
                    <p>NSF = ∑NS / ∑IS</p>
                    <p className="mt-1">Nilai Total = (x)NCF + (y)NSF</p>
                    <p className="mt-2  text-blue dark:text-white">
                      NCF: Nilai Core Factor NSF: Nilai Secondary Factor x,y:
                      Persentase bobot
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 border border-green-100 dark:bg-[#16a34a]/10 dark:border-green-900/50 ">
                  <h4 className="text-sm font-medium text-green-700 mb-2 dark:text-white">
                    Weighted Product
                  </h4>
                  <p className="text-xs text-green-600 mb-3 dark:text-white">
                    Pengambilan keputusan berdasarkan perkalian kriteria dengan
                    bobot pangkat yang relevan
                  </p>
                  <div className="bg-white/50 p-3 rounded text-xs font-mono text-green-800 dark:text-white dark:bg-[#16a34a]/10 ">
                    <p>Si = ∏(Xij^Wj)</p>
                    <p>Vi = Si / ∑Si</p>
                    <p className="mt-2  text-green-600 dark:text-white">
                      Si: Preferensi alternatif Xij: Nilai alternatif ke-i
                      terhadap kriteria ke-j Wj: Bobot kriteria/subkriteria
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daftar Proyek */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Semua Proyek</CardTitle>
            <CreateProjectDialog>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Proyek Baru
              </Button>
            </CreateProjectDialog>
          </div>
          <CardDescription>
            {filteredProjects.length} proyek ditemukan{" "}
            {searchQuery && `untuk pencarian "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          {filteredProjects.length > 0 ? (
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 rounded-lg border p-3 hover:bg-accent transition-colors dark:hover:bg-secondary/70">
                    <div className="rounded-md bg-primary/10 p-2">
                      {project.metode === "pm" ? (
                        <ListChecks className="h-5 w-5 text-primary" />
                      ) : (
                        <Activity className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {project.name}
                        </p>
                        <Badge
                          variant={
                            project.metode === "pm" ? "outline" : "secondary"
                          }
                        >
                          {project.metode === "pm"
                            ? "Profile Matching"
                            : "Weighted Product"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 dark:text-white">
                        {project.description || "Tidak ada deskripsi"}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground dark:text-white">
                        <Clock className="mr-1 h-3 w-3" />
                        Dibuat: {formatDate(project.created_at)}
                        <span className="mx-1">•</span>
                        Update: {formatDate(project.updated_at)}
                        <span className="mx-1">•</span>
                        <span className="flex items-center dark:text-white">
                          <Users className="mr-1 h-3 w-3 " />
                          {project._count?.alternatif || 0} alt
                        </span>
                        <span className="mx-1">•</span>
                        <span className="flex items-center dark:text-white">
                          <ListChecks className="mr-1 h-3 w-3" />
                          {project._count?.kriteria || 0} krit
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-3" />
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-medium mb-1">Tidak Ada Hasil</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tidak ada proyek yang cocok dengan pencarian "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Hapus Pencarian
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-1">Belum Ada Proyek</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mulai membuat proyek baru untuk menerapkan metode SPK Anda
                  </p>
                  <CreateProjectDialog>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Buat Proyek Baru
                    </Button>
                  </CreateProjectDialog>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
