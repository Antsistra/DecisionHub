import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import supabase from "@/utils/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface JoinProjectDialogProps {
  children: React.ReactNode;
}

export default function JoinProjectDialog({
  children,
}: JoinProjectDialogProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleJoinProject = async () => {
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-character code");
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to join a project");
        setIsLoading(false);
        return;
      }

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("code", code)
        .single();

      if (projectError || !projectData) {
        toast.error("Invalid project code");
        setIsLoading(false);
        return;
      }

      const { data: existingMembership } = await supabase
        .from("user_project")
        .select("id")
        .eq("user_id", user.id)
        .eq("project_id", projectData.id)
        .single();

      if (existingMembership) {
        // User is already a member, redirect to the project
        toast.success("You are already a member of this project");
        setIsOpen(false);
        navigate(`/projects/${projectData.id}`);
        setIsLoading(false);
        return;
      }

      const { error: joinError } = await supabase.from("user_project").insert({
        user_id: user.id,
        project_id: projectData.id,
      });

      if (joinError) {
        console.error("Error joining project:", joinError);
        toast.error("Failed to join project");
        setIsLoading(false);
        return;
      }

      toast.success("Successfully joined the project");
      setIsOpen(false);
      navigate(`/projects/${projectData.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <h2 className="flex justify-center items-center">
              Invitation Code
            </h2>
          </DialogTitle>
          <DialogDescription className="flex justify-center items-center mt-2">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
              className="gap-2"
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={0}
                  className="text-black dark:text-white"
                />
                <InputOTPSlot
                  index={1}
                  className="text-black dark:text-white"
                />
                <InputOTPSlot
                  index={2}
                  className="text-black dark:text-white"
                />
                <InputOTPSlot
                  index={3}
                  className="text-black dark:text-white"
                />
                <InputOTPSlot
                  index={4}
                  className="text-black dark:text-white"
                />
                <InputOTPSlot
                  index={5}
                  className="text-black dark:text-white"
                />
              </InputOTPGroup>
            </InputOTP>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleJoinProject}
            disabled={isLoading || code.length !== 6}
            className="w-full"
          >
            {isLoading ? "Joining..." : "Join Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
