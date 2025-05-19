import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { useParams } from "react-router-dom";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  code: string;
}

interface InvitationCodeDialogProps {
  children: React.ReactNode;
}

export default function InvitationCodeDialog({
  children,
}: InvitationCodeDialogProps) {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      setProject(data);
      if (error) {
        console.error("Error fetching project:", error);
        return;
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project?.code || "");
    toast.success("Project code copied to clipboard!");
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project?.name}</DialogTitle>
          <div className="flex flex-col gap-4">
            <h1 className="flex justify-center mt-4  text-lg font-bold">
              Invitation Code
            </h1>
            <div className="flex flex-col justify-center items-center ">
              <InputOTP
                maxLength={6}
                className="pointer-events-none select-none"
                value={project?.code}
                disabled={true}
              >
                <InputOTPGroup className="font-bold pointer-events-none select-none">
                  <InputOTPSlot
                    index={0}
                    className="text-black dark:text-white pointer-events-none select-none"
                  />
                  <InputOTPSlot
                    index={1}
                    className="text-black dark:text-white  pointer-events-none select-none"
                  />
                  <InputOTPSlot
                    index={2}
                    className="text-black dark:text-white  pointer-events-none select-none"
                  />
                  <InputOTPSlot
                    index={3}
                    className="text-black dark:text-white pointer-events-none select-none"
                  />
                  <InputOTPSlot
                    index={4}
                    className="text-black dark:text-white ointer-events-none select-none"
                  />
                  <InputOTPSlot
                    index={5}
                    className="text-black dark:text-white pointer-events-none select-none"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={() => handleCopyCode()}>Copy Code</Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
