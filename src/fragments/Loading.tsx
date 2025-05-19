import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingPageProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  description?: string;
}

const LoadingPage = ({
  isLoading,
  children,
  message = "Loading Dashboard",
  description = "Menyiapkan data dan komponen aplikasi...",
}: LoadingPageProps) => {
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {}, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
        >
          <div className="flex flex-col items-center justify-center space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-64 h-40"
            >
              <svg
                viewBox="0 0 200 100"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g stroke="currentColor" strokeWidth="0.5" opacity="0.2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={i * 25}
                      x2="200"
                      y2={i * 25}
                    />
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * 50}
                      y1="0"
                      x2={i * 50}
                      y2="100"
                    />
                  ))}
                </g>

                <motion.path
                  d="M0,80 L50,60 L100,40 L150,20 L200,0"
                  stroke="#2563EB"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />

                {[0, 50, 100, 150, 200].map((x, i) => (
                  <motion.circle
                    key={i}
                    cx={x}
                    cy={[80, 60, 40, 20, 0][i]}
                    r="3"
                    fill="#2563EB"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: i * 0.2,
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </svg>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {message}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1 w-64 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-blue-500"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingPage;
