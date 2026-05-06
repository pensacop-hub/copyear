"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  HTMLMotionProps,
  MotionValue,
  Variants,
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";

// --- IMAGES ---
const ALL_MEMBERS = [
  "/executive council members/1Chairman.jpg",
  "/executive council members/2GS.jpg",
  "/executive council members/3IMD.jpg",
  "/executive council members/4Apostle Kumi.jpg",
  "/executive council members/5Raj.jpg",
  "/executive council members/6Aps Jimmy.jpg",
  "/executive council members/7Aps Denteh.jpg",
  "/executive council members/Aps Swanzy.jpg",
  "/executive council members/Aps Kwafo.jpg",
  "/executive council members/Aps.Nyansah.jpg",
  "/executive council members/Aps.Lare.jpg",
  "/executive council members/Nuekpe.jpg",
  "/executive council members/Aps.Philip.jpg",
  "/executive council members/Aps.John.jpg",
  "/executive council members/Aps Dzemekey.jpg"
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

const SwitchingImage = ({ images, interval = 4000, startIndex = 0 }: { images: string[]; interval?: number; startIndex?: number }) => {
  const [index, setIndex] = useState(startIndex % images.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval + Math.random() * 2000);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="popLayout">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt="COP Member"
          initial={{ opacity: 0, filter: "blur(5px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(5px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
        />
      </AnimatePresence>
    </div>
  );
};

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>
}

const SPRING_CONFIG = {
  type: "spring", stiffness: 100, damping: 16, mass: 0.75, restDelta: 0.005, duration: 0.3
} as any;

const blurVariants: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  visible: { filter: "blur(0px)", opacity: 1 },
}

const ContainerScrollContext = React.createContext<ContainerScrollContextValue | undefined>(undefined);

function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (!context) throw new Error("useContainerScrollContext must be used within a ContainerScroll Component");
  return context;
}

const ContainerScroll = ({ children, className, style, ...props }: React.HtmlHTMLAttributes<HTMLDivElement>) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div ref={scrollRef} className={cn("relative h-full", className)} style={{ perspective: "1000px", perspectiveOrigin: "center top", transformStyle: "preserve-3d", ...style }} {...props}>
        {children}
      </div>
    </ContainerScrollContext.Provider>
  )
}

const ContainerSticky = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("sticky left-0 top-0 min-h-[30rem] w-full overflow-hidden", className)} style={{ perspective: "1000px", perspectiveOrigin: "center top", transformStyle: "preserve-3d", transformOrigin: "50% 50%", ...style }} {...props} />
  )
}

const GalleryContainer = ({ children, className, style, ...props }: React.HTMLAttributes<HTMLDivElement> & HTMLMotionProps<"div">) => {
  const isMobile = useIsMobile();
  const { scrollYProgress: rawScroll } = useContainerScrollContext()
  const scrollYProgress = useSpring(rawScroll, {
    stiffness: isMobile ? 30 : 40,
    damping: isMobile ? 30 : 25,
    restDelta: 0.001
  })

  const rotateX = useTransform(scrollYProgress, [0, 0.45], [isMobile ? 45 : 75, 0]);
  const scale = useTransform(scrollYProgress, [0.45, 0.75], [1.1, 1]);

  return (
    <motion.div
      className={cn("relative grid size-full grid-cols-3 gap-1.5 md:gap-2 rounded-2xl will-change-transform transform-gpu", className)}
      style={{ rotateX, scale, transformStyle: "preserve-3d", perspective: "1000px", ...style }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const GalleryCol = ({ className, style, yRange = ["0%", "-10%"], ...props }: HTMLMotionProps<"div"> & { yRange?: string[] }) => {
  const isMobile = useIsMobile();
  const { scrollYProgress: rawScroll } = useContainerScrollContext()
  const scrollYProgress = useSpring(rawScroll, {
    stiffness: isMobile ? 30 : 40,
    damping: isMobile ? 30 : 25,
    restDelta: 0.001
  })
  const y = useTransform(scrollYProgress, [0.25, 0.5], yRange);
  return (
    <motion.div className={cn("relative flex w-full flex-col gap-1.5 md:gap-2 will-change-transform", className)} style={{ y, ...style }} {...props} />
  )
}

const ContainerStagger = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(({ className, viewport, transition, ...props }, ref) => {
  return (
    <motion.div className={cn("relative", className)} ref={ref} initial="hidden" whileInView={"visible"} viewport={{ once: true || viewport?.once, ...viewport }} transition={{ staggerChildren: transition?.staggerChildren || 0.2, ...transition }} {...props} />
  )
})
ContainerStagger.displayName = "ContainerStagger"

const ContainerAnimated = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(({ className, transition, ...props }, ref) => {
  return (
    <motion.div ref={ref} className={cn(className)} variants={blurVariants} transition={SPRING_CONFIG || transition} {...props} />
  )
})
ContainerAnimated.displayName = "ContainerAnimated"

export const EventHero = () => {
  const scrollToCalendar = () => {
    const calendar = document.getElementById("calendar");
    if (calendar) calendar.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative bg-slate-50 overflow-hidden mb-[-15vh] md:mb-[-25vh]">
      <ContainerStagger className="relative z-[50] flex flex-col items-center pt-32 md:pt-64 pb-2 px-6 text-center">
        <ContainerAnimated>
          <h1 className="text-4xl md:text-8xl font-black text-[#0F172A] tracking-tighter leading-[1.1] md:leading-[0.9] mb-4">
            {new Date().getFullYear()} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-800 to-blue-900">Global Activities</span>
          </h1>
        </ContainerAnimated>
        <ContainerAnimated className="max-w-2xl my-4 md:my-6">
          <p className="text-slate-500 text-base md:text-xl font-medium leading-relaxed">
            Witness the move of God through our various events and spiritual
            activities as we navigate this year of divine impact together.
          </p>
        </ContainerAnimated>
        <ContainerAnimated className="flex items-center justify-center">
          <Button onClick={scrollToCalendar} className="h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm md:text-base shadow-xl shadow-blue-900/20 flex items-center gap-2 group transition-all">
            View Yearly Calendar <CalendarIcon className="size-4 md:size-5 group-hover:scale-110 transition-transform" />
          </Button>
        </ContainerAnimated>
      </ContainerStagger>

      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-10 h-[50vh] md:h-[70vh] w-full max-w-7xl opacity-30" style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)", filter: "blur(100px)" }} />

      <ContainerScroll className="relative h-[120vh] md:h-[105vh] -mt-32 md:-mt-24">
        <ContainerSticky className="h-svh">
          <GalleryContainer className="px-1.5 md:px-0">
            <GalleryCol yRange={["-10%", "2%"]} className="mt-0 md:-mt-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] md:aspect-video block h-auto max-h-full w-full rounded-md overflow-hidden shadow-lg border border-white/20">
                  <SwitchingImage images={ALL_MEMBERS} startIndex={i} interval={5000 + i * 1000} />
                </div>
              ))}
            </GalleryCol>

            <GalleryCol className="mt-[-20%] md:mt-[-50%]" yRange={["15%", "5%"]}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] md:aspect-video block h-auto max-h-full w-full rounded-md overflow-hidden shadow-lg border border-white/20">
                  <SwitchingImage images={ALL_MEMBERS} startIndex={i + 4} interval={4500 + i * 1200} />
                </div>
              ))}
            </GalleryCol>

            <GalleryCol yRange={["-10%", "2%"]} className="mt-0 md:-mt-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] md:aspect-video block h-auto max-h-full w-full rounded-md overflow-hidden shadow-lg border border-white/20">
                  <SwitchingImage images={ALL_MEMBERS} startIndex={i + 9} interval={5500 + i * 800} />
                </div>
              ))}
            </GalleryCol>
          </GalleryContainer>
        </ContainerSticky>
      </ContainerScroll>
    </div>
  );
};
