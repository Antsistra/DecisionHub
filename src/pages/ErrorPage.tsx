import { useState, useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Server, Frown, ArrowLeft } from "lucide-react";

const characterVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      repeat: 0,
      repeatType: "reverse",
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  }),
  hover: {
    y: -10,
    scale: 1.1,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const particleVariants: Variants = {
  initial: ({ x, y }) => ({
    opacity: 0,
    x,
    y,
    scale: 0,
  }),
  animate: ({ x, y, delay }) => ({
    opacity: [0, 1, 0],
    x: [x, x + Math.random() * 100 - 50, x + Math.random() * 200 - 100],
    y: [y, y - 100, y - 200],
    scale: [0, Math.random() * 1.5, 0],
    transition: {
      duration: Math.random() * 3 + 2,
      delay: delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 2,
    },
  }),
};

const Particle = ({}: { index: number }) => {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  const delay = Math.random() * 5;
  const size = Math.random() * 10 + 5;
  const color = [
    "bg-primary/20",
    "bg-accent/30",
    "bg-secondary/20",
    "bg-blue-400/20",
    "bg-indigo-400/20",
    "bg-purple-400/20",
  ];
  const selectedColor = color[Math.floor(Math.random() * color.length)];

  return (
    <motion.div
      className={`absolute rounded-full ${selectedColor}`}
      style={{ width: size, height: size }}
      custom={{ x, y, delay }}
      variants={particleVariants}
      initial="initial"
      animate="animate"
    />
  );
};

export default function ErrorPage() {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();
  const [particles, setParticles] = useState<number[]>([]);
  const controls = useAnimation();

  useEffect(() => {
    // Generar partículas
    setParticles(Array.from({ length: 30 }, (_, i) => i));

    // Animaciones iniciales
    controls.start("visible");

    // Countdown para redirigir
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [controls, navigate]);

  // Array de caracteres para el 404 animado
  const errorCharacters = "404".split("");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Particles background */}
      {particles.map((index) => (
        <Particle key={index} index={index} />
      ))}

      <motion.div
        className="relative z-10 mx-auto max-w-md text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* 404 animated */}
        <div className="mb-8 flex items-center justify-center">
          {errorCharacters.map((char, i) => (
            <motion.div
              key={`char-${i}`}
              custom={i}
              variants={characterVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="mx-1 inline-block rounded-lg bg-primary/10 px-4 py-2 text-7xl font-bold text-primary"
            >
              {char}
            </motion.div>
          ))}
        </div>

        <Card className="border-accent/50 shadow-lg">
          <CardHeader>
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.3,
                }}
              >
                <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-accent/30 text-accent-foreground">
                  <Frown className="h-10 w-10" />
                </div>
              </motion.div>
            </div>
            <CardTitle className="text-2xl">Halaman tidak ditemukan</CardTitle>
            <CardDescription>
              Halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau
              tidak pernah ada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="mb-4">
                Anda akan diarahkan ke halaman beranda dalam{" "}
                <span className="font-bold text-primary">{countdown}</span>{" "}
                detik.
              </p>
              <div className="relative mt-6">
                <div className="relative flex items-center gap-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 text-sm text-muted-foreground">
                    <p className="font-medium">Status: 404 Not Found</p>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: "100%",
                        transition: {
                          duration: 10,
                          ease: "linear",
                        },
                      }}
                      className="mt-1 h-1 rounded-full bg-accent"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="flex-col gap-2 sm:flex-row">
            <Button
              asChild
              variant="secondary"
              className="justify-center w-full"
            >
              <Link to={-1 as any}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
