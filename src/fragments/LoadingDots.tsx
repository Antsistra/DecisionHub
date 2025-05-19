import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingDotsProps {
  duration?: number;
  autoFade?: boolean;
}

export default function LoadingDots({
  duration = 2000,
  autoFade = true,
}: LoadingDotsProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (autoFade) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [duration, autoFade]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const dotVariants = {
    initial: { y: 0, opacity: 0.2 },
    animate: {
      y: [-15, 0],
      opacity: [1, 0.2],
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as "reverse",
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };
  const colors = ["#FF5733", "#33A8FF", "#33FF57"]; // Warna-warna menarik
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="flex justify-center items-center p-6"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={containerVariants}
        >
          <motion.div className="flex space-x-4 items-center">
            {colors.map((color, index) => (
              <motion.div
                key={index}
                className="h-10 w-10 rounded-full"
                style={{ backgroundColor: color }}
                variants={dotVariants}
                animate="animate"
                initial="initial"
                custom={index}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
