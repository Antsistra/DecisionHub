import * as React from "react";
import {
  FileChartColumn,
  Plus,
  Settings,
  Users,
  Copy,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import CreateProjectDialog from "@/fragments/CreateProjectDialog";
import ProjectSettingsDialog from "@/fragments/ProjectSettingsDialog";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import JoinProjectDialog from "@/fragments/JoinProjectDialog";
import supabase from "@/utils/supabase";
import InvitationCodeDialog from "@/fragments/InvitationCodeDialog";
import ExitProjectDialog from "@/fragments/ExitProjectDialog";
import ThemeToggle from "@/fragments/ThemeToggle";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const location = useLocation();
  const isProjectPage = location.pathname.startsWith("/projects/");
  const projectId = isProjectPage ? location.pathname.split("/")[2] : null;

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: userData } = await supabase
          .from("users")
          .select("name, email")
          .eq("id", user.id)
          .single();

        if (userData) {
          const initials: string = userData.name
            .split(" ")
            .map((word: string) => word[0])
            .join("")
            .toUpperCase();

          setUserData({
            name: userData.name,
            email: userData.email,
            avatar: initials,
          });
        }
      }
    };
    fetchUser();
  }, []);

  const navMainItems = [
    {
      title: "Profile Matching",
      url: "#",
      icon: FileChartColumn,
      isActive: true,
      items: [
        {
          title: "Alternatif",
          url: "/profile-matching/alternatif",
        },
        {
          title: "Kriteria",
          url: "/profile-matching/kriteria",
        },
        {
          title: "Sub Kriteria",
          url: "/profile-matching/kriteria/sub",
        },
        {
          title: "Penilaian Alternatif",
          url: "/profile-matching/Penilaian",
        },
        {
          title: "Hasil Perhitungan",
          url: "/profile-matching/hasil-perhitungan",
        },
      ],
    },
    {
      title: "Weighted Product",
      url: "#",
      icon: FileChartColumn,
      isActive: true,
      items: [
        {
          title: "Alternatif",
          url: "/weighted-product/alternatif",
        },
        {
          title: "Kriteria",
          url: "/weighted-product/kriteria",
        },
        {
          title: "Bobot Kriteria",
          url: "/weighted-product/pembobotan-kriteria",
        },
        {
          title: "Penilaian",
          url: "/weighted-product/penilaian-alternatif",
        },
        {
          title: "Hasil Perhitungan",
          url: "/weighted-product/hasil-perhitungan",
        },
      ],
    },
  ];

  const navMainWithProjectId = navMainItems
    .filter((item) => {
      if (isProjectPage && projectId) {
        const currentProject = projects.find(
          (project) => project.project_id === projectId
        );

        if (currentProject?.projects?.metode === "pm") {
          // Show only "Profile Matching" if metode is "wp"
          return item.title === "Profile Matching";
        } else if (currentProject?.projects?.metode === "wp") {
          // Show only "Weighted Product" if metode is "pm"
          return item.title === "Weighted Product";
        }
      }
      return false;
    })
    .map((item) => ({
      ...item,
      items: item.items?.map((subItem) => ({
        ...subItem,
        url: isProjectPage
          ? `/projects/${projectId}${subItem.url}`
          : subItem.url,
      })),
    }));

  useEffect(() => {
    const fetchProjects = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from("user_project")
          .select(
            `
            project_id,
            projects (
              id,
              name,
              metode
            )
          `
          )
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching projects:", error);
          return;
        }

        setProjects(data || []);
      }
    };

    fetchProjects();
  }, [userId]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <img src="/decihub.svg" alt="DeciHub" className="h-5 w-5" />
                <span className="text-base font-semibold">DeciHub</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Project</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="flex flex-col gap-2">
                <CreateProjectDialog>
                  <SidebarMenuButton asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start  dark:bg-primary dark:hover:bg-primary/80"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Create Project</span>
                    </Button>
                  </SidebarMenuButton>
                </CreateProjectDialog>

                <JoinProjectDialog>
                  <SidebarMenuButton asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start dark:bg-secondary dark:hover:bg-secondary/80"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      <span>Join Project</span>
                    </Button>
                  </SidebarMenuButton>
                </JoinProjectDialog>
              </SidebarMenuItem>
              {projects.map((project) => (
                <SidebarMenuItem key={project.project_id}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={`/projects/${project.project_id}`}
                      className="flex items-center"
                    >
                      <FileChartColumn className="h-4 w-4 mr-2" />
                      <span>{project.projects.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isProjectPage && (
          <>
            <NavMain items={navMainWithProjectId} />
            <SidebarGroup>
              <SidebarGroupLabel>Project Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <ProjectSettingsDialog>
                      <SidebarMenuButton asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          <span>Project Settings</span>
                        </Button>
                      </SidebarMenuButton>
                    </ProjectSettingsDialog>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <InvitationCodeDialog>
                      <SidebarMenuButton asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-white"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          <span>Invitation Code</span>
                        </Button>
                      </SidebarMenuButton>
                    </InvitationCodeDialog>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <ExitProjectDialog projectId={projectId!}>
                      <SidebarMenuButton asChild>
                        <Button
                          variant="destructive"
                          className="w-full justify-start "
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          <span>Exit Project</span>
                        </Button>
                      </SidebarMenuButton>
                    </ExitProjectDialog>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <ThemeToggle />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
