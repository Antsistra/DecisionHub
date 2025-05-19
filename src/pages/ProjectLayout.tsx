import { useParams, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { motion } from "framer-motion";

export default function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      if (error) {
        console.error("Error fetching project:", error);
        return null;
      }

      console.log("Project data:", data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-4 w-4 rounded-full bg-primary"
                animate={{
                  y: [-10, 0, -10],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-1 flex-col gap-4 p-4 pt-0"
    >
      <div className="flex flex-col gap-y-4"></div>
      <Outlet />
    </motion.div>
  );
}
