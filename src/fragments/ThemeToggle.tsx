import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useSidebar } from "@/components/ui/sidebar";

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={`relative flex items-center ${
        isCollapsed ? "justify-center w-8 h-8 p-0" : "gap-2"
      } overflow-hidden`}
    >
      <div
        className={`${
          isCollapsed ? "absolute" : ""
        } flex items-center justify-center`}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: theme === "dark" ? 45 : 0,
            opacity: theme === "light" ? 1 : 0,
            scale: theme === "light" ? 1 : 0.5,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            rotate: theme === "light" ? -45 : 0,
            opacity: theme === "dark" ? 1 : 0,
            scale: theme === "dark" ? 1 : 0.5,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex items-center justify-center absolute"
        >
          <Moon className="h-4 w-4" />
        </motion.div>
      </div>

      {!isCollapsed && (
        <motion.span
          className="text-sm"
          initial={false}
          animate={{
            opacity: 1,
          }}
          transition={{ duration: 0.3 }}
          key={theme}
        >
          {theme === "light" ? "Light" : "Dark"}
        </motion.span>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
