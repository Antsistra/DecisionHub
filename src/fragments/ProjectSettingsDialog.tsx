import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { useParams } from "react-router-dom";

import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Project schema validation using Zod
const projectSchema = z
  .object({
    projectName: z.string().min(1, "Project name is required"),
    projectDescription: z.string().min(1, "Project description is required"),
    bobotCF: z
      .string()
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100,
        {
          message: "Bobot CF harus berupa angka antara 1-100",
        }
      ),
    bobotSF: z
      .string()
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100,
        {
          message: "Bobot SF harus berupa angka antara 1-100",
        }
      ),
  })
  .refine((data) => Number(data.bobotCF) + Number(data.bobotSF) === 100, {
    message: "Bobot CF dan SF harus berjumlah 100%",
    path: ["bobotSF"],
  });

interface ProjectSettingsDialogProps {
  children: React.ReactNode;
}

export default function ProjectSettingsDialog({
  children,
}: ProjectSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [method, setMethod] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [bobotCF, setBobotCF] = useState("");
  const [bobotSF, setBobotSF] = useState("");
  const [errors, setErrors] = useState({
    projectName: "",
    projectDescription: "",
    bobotCF: "",
    bobotSF: "",
  });
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (error) {
          console.error("Error fetching project:", error);
          return;
        }

        if (data) {
          setProjectName(data.name || "");
          setProjectDescription(data.description || "");
          setBobotCF(data.bobot_CF ? (data.bobot_CF * 100).toString() : "");
          setBobotSF(data.bobot_SF ? (data.bobot_SF * 100).toString() : "");
          setMethod(data.metode || "");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleUpdateProject = async () => {
    if (!projectId) return;

    try {
      // Validate the form data
      const validatedData = projectSchema.parse({
        projectName,
        projectDescription,
        bobotCF,
        bobotSF,
      });

      setErrors({
        projectName: "",
        projectDescription: "",
        bobotCF: "",
        bobotSF: "",
      });

      setIsLoading(true);

      const { error } = await supabase
        .from("projects")
        .update({
          name: validatedData.projectName,
          description: validatedData.projectDescription,
          bobot_CF: Number(validatedData.bobotCF) / 100,
          bobot_SF: Number(validatedData.bobotSF) / 100,
        })
        .eq("id", projectId);

      if (error) {
        console.error("Error updating project:", error);
        return;
      }

      window.location.reload();
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const fieldErrors = validationError.flatten().fieldErrors;
        setErrors({
          projectName: fieldErrors.projectName?.[0] || "",
          projectDescription: fieldErrors.projectDescription?.[0] || "",
          bobotCF: fieldErrors.bobotCF?.[0] || "",
          bobotSF: fieldErrors.bobotSF?.[0] || "",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        console.error("Error deleting project:", error);
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription className="text-neutral-500">
            Update your project settings here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4 mb-2">
            <Label htmlFor="name" className="text-right">
              Project Name
            </Label>
            <Input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              id="projectName"
              placeholder="Project Name"
              className="col-span-3"
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm">{errors.projectName}</p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <Label htmlFor="username" className="text-right">
              Project Description
            </Label>
            <Textarea
              id="description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Project Description"
            ></Textarea>
            {errors.projectDescription && (
              <p className="text-red-500 text-sm">
                {errors.projectDescription}
              </p>
            )}
          </div>
          {method === "pm" && (
            <>
              <div className="flex flex-col gap-4">
                <Label htmlFor="bobot_CF" className="text-right">
                  Bobot Core Factor (%)
                </Label>
                <Input
                  type="text"
                  id="bobot_CF"
                  value={bobotCF}
                  onChange={(e) => setBobotCF(e.target.value)}
                  placeholder="Masukkan bobot CF (contoh: 60)"
                  className="col-span-3"
                />
                {errors.bobotCF && (
                  <p className="text-red-500 text-sm">{errors.bobotCF}</p>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <Label htmlFor="bobot_SF" className="text-right">
                  Bobot Secondary Factor (%)
                </Label>
                <Input
                  type="text"
                  id="bobot_SF"
                  value={bobotSF}
                  onChange={(e) => setBobotSF(e.target.value)}
                  placeholder="Masukkan bobot SF (contoh: 40)"
                  className="col-span-3"
                />
                {errors.bobotSF && (
                  <p className="text-red-500 text-sm">{errors.bobotSF}</p>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Project</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  project and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Project"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            type="submit"
            onClick={handleUpdateProject}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
