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
import supabase from "@/utils/supabase";
import { toast } from "sonner";

interface ExitProjectDialogProps {
  children: React.ReactNode;
  projectId: string;
}

export default function ExitProjectDialog({
  children,
  projectId,
}: ExitProjectDialogProps) {
  const handleExitProject = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("User tidak ditemukan");
        return;
      }

      const { error } = await supabase.from("user_project").delete().match({
        user_id: user.id,
        project_id: projectId,
      });

      if (error) throw error;

      toast.success("Berhasil keluar dari project");

      window.location.href = "/";
    } catch (error) {
      console.error("Error exiting project:", error);
      toast.error("Gagal keluar dari project");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keluar dari Project?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah anda yakin ingin keluar dari project ini? Anda dapat
            bergabung kembali nanti menggunakan kode invite.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleExitProject}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Keluar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
