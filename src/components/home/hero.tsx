"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

const apostles = [
  { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop", name: "Aps. Eric Nyamekye" },
  { src: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=800&auto=format&fit=crop", name: "Aps. Samuel Gakpetor" },
  { src: "https://images.unsplash.com/photo-1619365734050-cb5e64a42d43?w=800&auto=format&fit=crop", name: "Aps. A.N.Y. Kumi-Larbi" },
  { src: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800&auto=format&fit=crop", name: "Aps. E.A. Bekoe" },
  { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop", name: "Aps. L. Otu-Nyarko" },
  { src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop", name: "Aps. Amos Jimmy Markin" },
  { src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop", name: "Aps. Ousmane Zabre" },
  { src: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&auto=format&fit=crop", name: "Aps. Yaw Adjei-Kwarteng" },
  { src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop", name: "Aps. S. Osei Asante" },
  { src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop", name: "Aps. I.N.K. Djani" },
  { src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop", name: "Aps. Sylvester Arhin" },
  { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop", name: "Aps. Dr. D.O. Walker" },
  { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop", name: "Aps. Christian Tsekpoe" },
  { src: "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=800&auto=format&fit=crop", name: "Aps. Lare Bako" },
  { src: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop", name: "Aps. Dr. D.K. Nuekpe" }
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
        <div className="h-screen w-screen flex flex-col items-center justify-center p-4 md:p-8 pt-40 md:pt-48 sticky top-0 overflow-hidden">
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
                            <img
                              src={member.src}
                              alt={member.name}
                              className="w-full h-full object-cover"
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
                <img
                  src={selectedApostle.src}
                  alt={selectedApostle.name}
                  className="w-full h-full object-cover"
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
                      className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all snap-center ${selectedApostle?.name === apostle.name ? 'border-yellow-400 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'
                        }`}
                    >
                      <img src={apostle.src} alt={apostle.name} className="w-full h-full object-cover" />
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
