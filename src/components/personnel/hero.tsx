"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

const apostles = [
  { src: "/executive council members/1Chairman.jpg", name: "Apostle Eric Nyamekye (Chairman)" },
  { src: "/executive council members/2GS.jpg", name: "Apostle Samuel Gyau Obuobi (General Secretary)" },
  { src: "/executive council members/3IMD.jpg", name: "Apostle Emmanuel Agyemang Bekoe (Missions Director)" },
  { src: "/executive council members/4Apostle Kumi.jpg", name: "Apostle Alexander N.Y. Kumi-Larbi" },
  { src: "/executive council members/5Raj.jpg", name: "Apostle Sundaram James Raj" },
  { src: "/executive council members/6Aps Jimmy.jpg", name: "Apostle Dr. Amos Jimmy Markin" },
  { src: "/executive council members/7Aps Denteh.jpg", name: "Apostle Vincent Anane Denteh" },
  { src: "/executive council members/Aps Swanzy.jpg", name: "Apostle Abraham Swanzy" },
  { src: "/executive council members/Aps Kwafo.jpg", name: "Apostle Emmanuel Agyei Kwafo" },
  { src: "/executive council members/Aps.Nyansah.jpg", name: "Apostle Dr. David Nyansah Hayfron" },
  { src: "/executive council members/Aps.Lare.jpg", name: "Apostle Lare Banimpo" },
  { src: "/executive council members/Nuekpe.jpg", name: "Apostle Dr. Dieudonne Nuekpe" },
  { src: "/executive council members/Aps.Philip.jpg", name: "Apostle Dr. Philip Osei Korsah" },
  { src: "/executive council members/Aps.John.jpg", name: "Apostle John Budu Kobina Tawiah" },
  { src: "/executive council members/Aps Dzemekey.jpg", name: "Apostle Peter Dzemekey" }
];

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedApostle, setSelectedApostle] = useState<{ src: string, name: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollDistance = isMobile ? 400 : 600;
  const animationProgress = Math.min(scrollY / scrollDistance, 1);
  const expandRadius = animationProgress * (isMobile ? 160 : 320);

  return (
    <>
      <div
        id="personnel"
        style={{ height: `calc(100vh + ${scrollDistance}px)` }}
        className="bg-slate-50 text-blue-950 relative z-10"
      >
        <div className="h-screen w-screen flex flex-col items-center justify-center p-4 md:p-8 pt-32 md:pt-40 sticky top-0 overflow-hidden">
          <div className="relative scale-90 md:scale-100">
            <div
              className={`w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] md:w-[650px] md:h-[650px] rounded-full flex items-center justify-center transition-all duration-500 ${scrollY > (scrollDistance * 0.5) ? "border-2 border-blue-100" : "border-2 border-transparent"
                }`}
            >
              <div
                className={`w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[550px] md:h-[550px] rounded-full flex items-center justify-center relative transition-all duration-500 ${scrollY > (scrollDistance * 0.2) ? "border-2 border-yellow-200" : "border-2 border-transparent"
                  }`}
              >
                <div className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[440px] md:h-[440px] rounded-full bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 p-[2px] md:p-[3px] flex items-center justify-center relative shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,0.05)]">
                    {apostles.map((member, index) => {
                      const angle = (2 * Math.PI) / 15 * index - Math.PI / 2; // Offset by -90deg

                      return (
                        <div
                          key={index}
                          className="absolute flex flex-col items-center justify-center transition-all duration-300 ease-out z-10"
                          style={{
                            transform: `translate(${expandRadius * Math.cos(angle)}px, ${expandRadius * Math.sin(angle)}px)`,
                          }}
                        >
                          <button
                            onClick={() => setSelectedApostle(member)}
                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 rounded-full overflow-hidden border-[2px] md:border-4 border-white shadow-lg md:shadow-xl bg-slate-100 hover:scale-110 focus:scale-110 outline-none transition-transform cursor-pointer relative group z-10"
                          >
                            <Image
                              src={member.src}
                              alt={member.name}
                              fill
                              sizes="(min-width: 768px) 80px, 48px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors" />
                          </button>
                        </div>
                      );
                    })}

                    <div
                      style={{
                        opacity: animationProgress,
                        transform: `scale(${0.95 + (animationProgress * 0.05)}) translateY(${(1 - animationProgress) * 20}px)`
                      }}
                      className="flex flex-col items-center justify-center relative z-20 px-4 md:px-8 max-w-[160px] md:max-w-[350px]"
                    >
                      <div className="relative w-10 h-10 md:w-20 md:h-20 mb-4 md:mb-8 shadow-2xl">
                        <Image
                          src="/cop.png"
                          alt="COP Logo"
                          fill
                          sizes="(min-width: 768px) 80px, 40px"
                          className="object-contain"
                        />
                      </div>
                      <h1 className="text-base md:text-4xl font-black text-blue-950 text-center mb-1 md:mb-3 leading-[1.1] tracking-tight">
                        The Executive Council Members
                      </h1>
                      <h2 className="text-[9px] md:text-lg font-bold text-yellow-500 text-center tracking-wide uppercase">
                        The Church of Pentecost
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-8 md:mt-16 transition-all duration-700 ${scrollY > (scrollDistance * 0.7) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-blue-100/50 shadow-sm">
              <p className="text-[9px] md:text-xs font-black text-blue-900/50 uppercase tracking-[0.2em] whitespace-nowrap">
                Tap an Apostle to reveal details
              </p>
            </div>
          </div>

          <div className={`absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 md:gap-2 text-blue-400 transition-opacity duration-500 ${scrollY > (scrollDistance * 0.2) ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold">Scroll Down</span>
            <div className="w-px h-6 md:h-12 bg-gradient-to-b from-yellow-400 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedApostle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedApostle(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-950/80 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-[2rem] p-3 max-w-md w-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedApostle(null)}
                className="absolute -top-4 -right-4 md:-top-5 md:-right-5 w-10 h-10 md:w-12 md:h-12 bg-white text-blue-950 hover:bg-slate-50 hover:text-red-500 rounded-full flex items-center justify-center shadow-xl border border-slate-100 transition-colors z-10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden mb-5 bg-slate-100 relative">
                <Image
                  src={selectedApostle.src}
                  alt={selectedApostle.name}
                  fill
                  sizes="(min-width: 768px) 448px, calc(100vw - 56px)"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="px-4 pb-4 text-center">
                <h3 className="text-2xl font-black text-blue-950 tracking-tight mb-1">{selectedApostle.name}</h3>
                <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Executive Council Member</p>
                <div className="mt-4 w-12 h-1 bg-yellow-400 mx-auto rounded-full" />
              </div>

              <div className="mt-2 border-t border-slate-50 pt-4 px-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Other Council Members</p>
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {apostles.map((apostle, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApostle(apostle);
                      }}
                      className={`relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all snap-center ${selectedApostle?.name === apostle.name ? 'border-yellow-400 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'
                        }`}
                    >
                      <Image
                        src={apostle.src}
                        alt={apostle.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
