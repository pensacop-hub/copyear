"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Users, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
      if (window.scrollY > 300) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Personnel", icon: Users, href: "/personnel" },
  ];

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isScrolled) {
      setIsExpanded(!isExpanded);
    }
  };

  const showVertical = !isScrolled || isExpanded;

  return (
    <header className="fixed top-0 left-0 w-full z-[150] transition-all duration-700 pt-3 md:pt-10 px-3 md:px-4 pointer-events-none">
      <motion.div
        layout
        className="mx-auto max-w-fit pointer-events-auto"
      >
        <motion.div
          layout
          onClick={toggleExpand}
          className={`relative transition-all duration-700 rounded-[2rem] md:rounded-[3rem] border border-white/30 flex shadow-2xl overflow-hidden cursor-pointer ${showVertical
            ? "flex-col items-center bg-white/40 backdrop-blur-xl py-4 md:py-6 px-6 md:px-16"
            : "flex-row items-center bg-white/80 backdrop-blur-2xl py-2 px-4 md:px-6 gap-4 md:gap-8"
            }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-yellow-50/20 pointer-events-none" />

          <motion.div
            layout
            className={`flex items-center relative z-10 group transition-all duration-500 ${showVertical ? "gap-3 md:gap-4 mb-3 md:mb-6" : "gap-2 md:gap-3"
              }`}
          >
            <motion.div
              layout
              className={`relative rounded-xl overflow-hidden shadow-md transition-all duration-500 ${showVertical ? "w-8 h-8 md:w-10 md:h-10" : "w-6 h-6 md:w-8 md:h-8"
                }`}
            >
              <Image
                src="/cop.png"
                alt="COP Logo"
                fill
                sizes={showVertical ? "40px" : "32px"}
                className="object-contain"
              />
            </motion.div>
            <motion.span
              layout
              className={`text-[#0F172A] font-black tracking-tighter leading-none whitespace-nowrap transition-all duration-500 ${showVertical ? "text-sm md:text-lg" : "text-[10px] md:text-sm"
                }`}
            >
              The Church of Pentecost
            </motion.span>

            {isScrolled && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity"
              >
                <ChevronDown className="w-3 h-3" />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            layout
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 p-1 bg-slate-950/5 rounded-full relative z-10"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative font-black flex items-center gap-2 outline-none cursor-pointer ${showVertical ? "px-6 md:px-10 py-2 md:py-2.5" : "p-2 md:p-2.5"
                  } ${pathname === link.href ? "opacity-100" : "opacity-60"}`}
              >
                <link.icon className={`text-[#0F172A] ${showVertical ? "w-3 h-3 md:w-4 md:h-4" : "w-4 h-4 md:w-5 md:h-5"
                  }`} />

                {showVertical && (
                  <span className="text-[10px] md:text-xs text-[#0F172A] uppercase tracking-[0.2em] whitespace-nowrap">
                    {link.name}
                  </span>
                )}
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </header>
  );
}
