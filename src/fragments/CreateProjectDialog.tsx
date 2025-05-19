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
import { useState } from "react";

import supabase from "@/utils/supabase";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const generateUniqueCode = async () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = Array.from({ length: 6 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");

    const { data } = await supabase
      .from("projects")
      .select("code")
      .eq("code", code);
    if (!data || data.length === 0) {
      isUnique = true;
    }
  }

  return code;
};

const projectSchema = z
  .object({
    projectName: z.string().min(1, "Project name is required"),
    projectDescription: z.string().min(1, "Project description is required"),
    bobotCF: z
      .string()
      .optional()
      .refine(
        (val) =>
          val === undefined ||
          (!isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100),
        {
          message: "Bobot CF harus berupa angka antara 1-100",
        }
      ),
    bobotSF: z
      .string()
      .optional()
      .refine(
        (val) =>
          val === undefined ||
          (!isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100),
        {
          message: "Bobot SF harus berupa angka antara 1-100",
        }
      ),
    method: z.enum(["pm", "wp"], {
      errorMap: () => ({ message: "Metode tidak valid" }),
    }),
  })
  .refine(
    (data) =>
      data.method === "wp" ||
      Number(data.bobotCF || 0) + Number(data.bobotSF || 0) === 100,
    {
      message: "Bobot CF dan SF harus berjumlah 100%",
      path: ["bobotSF"], // Attach error to bobotSF
    }
  );

interface CreateProjectDialogProps {
  children: React.ReactNode;
}

export default function CreateProjectDialog({
  children,
}: CreateProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [method, setMethod] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [bobotCF, setBobotCF] = useState("");
  const [bobotSF, setBobotSF] = useState("");
  const [errors, setErrors] = useState({
    projectName: "",
    projectDescription: "",
    bobotCF: "",
    bobotSF: "",
    method: "",
  });

  const handleCreateProjectPM = async () => {
    try {
      const validatedData = projectSchema.parse({
        projectName,
        projectDescription,
        bobotCF,
        bobotSF,
        method,
      });

      setErrors({
        projectName: "",
        projectDescription: "",
        bobotCF: "",
        bobotSF: "",
        method: "",
      }); // Clear errors
      setIsLoading(true);
      const code = await generateUniqueCode();

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: validatedData.projectName,
          description: validatedData.projectDescription,
          code,
          bobot_CF: Number(validatedData.bobotCF) / 100,
          bobot_SF: Number(validatedData.bobotSF) / 100,
          metode: "pm",
        })
        .select("id");
      const { data: userData, error: userError } = await supabase
        .from("user_project")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          project_id: data && data[0]?.id,
        });

      if (userData == null) {
        window.location.reload();
      }
      if (userError) {
        console.error("Error inserting user project:", userError);
        setIsLoading(false);
        return;
      }
      if (error) {
        console.error("Error creating project:", error);
        setIsLoading(false);
        return;
      }

      setProjectName("");
      setProjectDescription("");
      setBobotCF("");
      setBobotSF("");
      setIsLoading(false);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const fieldErrors = validationError.flatten().fieldErrors;
        setErrors({
          projectName: fieldErrors.projectName?.[0] || "",
          projectDescription: fieldErrors.projectDescription?.[0] || "",
          bobotCF: fieldErrors.bobotCF?.[0] || "",
          bobotSF: fieldErrors.bobotSF?.[0] || "",
          method: fieldErrors.method?.[0] || "",
        });
      }
    }
  };

  const handleCreateProjectWP = async () => {
    try {
      const validatedData = projectSchema.parse({
        projectName,
        projectDescription,
        method,
      });

      setErrors({
        projectName: "",
        projectDescription: "",
        bobotCF: "",
        bobotSF: "",
        method: "",
      });
      setIsLoading(true);
      const code = await generateUniqueCode();

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: validatedData.projectName,
          description: validatedData.projectDescription,
          code,
          metode: "wp",
        })
        .select("id");
      const { data: userData, error: userError } = await supabase
        .from("user_project")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          project_id: data && data[0]?.id,
        });

      if (userData == null) {
        window.location.reload();
      }
      if (userError) {
        console.error("Error inserting user project:", userError);
        setIsLoading(false);
        return;
      }
      if (error) {
        console.error("Error creating project:", error);
        setIsLoading(false);
        return;
      }

      setProjectName("");
      setProjectDescription("");
      setMethod(""); // Reset method
      setIsLoading(false);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const fieldErrors = validationError.flatten().fieldErrors;
        setErrors({
          projectName: fieldErrors.projectName?.[0] || "",
          projectDescription: fieldErrors.projectDescription?.[0] || "",
          bobotCF: "", // Tetap sertakan properti bobotCF
          bobotSF: "", // Tetap sertakan properti bobotSF
          method: fieldErrors.method?.[0] || "",
        });
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4 mb-2">
            <Label htmlFor="name" className="text-right">
              Project Name
            </Label>
            <Input
              type="text"
              onChange={(e) => setProjectName(e.target.value)}
              id="projectName"
              placeholder="Pemilihan Karyawan"
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
              onChange={(e) => setProjectDescription(e.target.value)}
            ></Textarea>
            {errors.projectDescription && (
              <p className="text-red-500 text-sm">
                {errors.projectDescription}
              </p>
            )}
            <Label>Metode</Label>
            <Select onValueChange={setMethod}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Pilih Metode Yang digunakan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="pm">
                  Profile Matching
                </SelectItem>
                <SelectItem className="cursor-pointer" value="wp">
                  Weighted Product
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-red-500 text-sm">{errors.method}</p>
            )}
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
        </div>
        <DialogFooter>
          {method === "pm" ? (
            <>
              <Button
                type="submit"
                onClick={handleCreateProjectPM}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCreateProjectWP}>Create Project</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
