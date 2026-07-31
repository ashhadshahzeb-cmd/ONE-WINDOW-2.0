"use client";

import { motion } from "framer-motion";
import { FolderKanban, Users, ShieldCheck, Wallet, Database, Smartphone } from "lucide-react";

const features = [
  {
    id: "01",
    title: "One Window Facility",
    description: "Centralized file tracking system with complete SAP integration. Experience a seamless, paperless workflow across all departments.",
    icon: <FolderKanban size={48} />,
    theme: "dark",
  },
  {
    id: "02",
    title: "HRMS & Face Authentication",
    description: "Advanced employee management, smart attendance with Face ID, automated leave processing, and transparent payroll.",
    icon: <Users size={48} />,
    theme: "light",
  },
  {
    id: "03",
    title: "Book Section & Tracking",
    description: "Internal tracking highlighting bill dispatch, cheque records, transfer advice, and security deposits securely.",
    icon: <ShieldCheck size={48} />,
    theme: "dark",
  },
  {
    id: "04",
    title: "Finance & Accounting",
    description: "Complete general ledger management, bank accounts reconciliation, strict budget control, and real-time revenue collection.",
    icon: <Wallet size={48} />,
    theme: "light",
  },
  {
    id: "05",
    title: "Employee Funds & Claims",
    description: "Dedicated modules for CP funds, salary advances, and comprehensive post-retirement benefits (Pension, Gratuity, LPR).",
    icon: <Database size={48} />,
    theme: "dark",
  },
  {
    id: "06",
    title: "Public Tracking & Mobile App",
    description: "Empowering citizens with a robust tracking portal and dedicated mobile upload features for extreme transparency.",
    icon: <Smartphone size={48} />,
    theme: "light",
  },
];

export default function FeaturesSection() {
  return (
    <div className="w-full">
      {features.map((feature, index) => {
        const isDark = feature.theme === "dark";
        
        return (
          <section
            key={feature.id}
            className={`w-full min-h-screen flex items-center justify-center py-20 px-6 ${
              isDark ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <div className={`max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
              index % 2 !== 0 ? "lg:flex-row-reverse" : ""
            }`}>
              
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`order-2 ${index % 2 !== 0 ? "lg:order-1" : "lg:order-1"}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className={`text-6xl font-bold opacity-20 ${isDark ? "text-gray-400" : "text-gray-900"}`}>
                    {feature.id}
                  </span>
                  <div className={`p-4 rounded-2xl ${isDark ? "bg-white/10" : "bg-black/5"}`}>
                    {feature.icon}
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {feature.title}
                </h2>
                
                <p className={`text-lg md:text-xl font-light leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {feature.description}
                </p>
                
                <button className={`mt-10 px-8 py-3 font-semibold rounded-full border transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? "border-white hover:bg-white hover:text-black" 
                    : "border-black hover:bg-black hover:text-white"
                }`}>
                  Learn More
                </button>
              </motion.div>

              {/* Visual/Mockup Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: index % 2 === 0 ? 15 : -15 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`order-1 ${index % 2 !== 0 ? "lg:order-2" : "lg:order-2"} w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden relative shadow-2xl ${
                  isDark ? "bg-zinc-900 border border-zinc-800" : "bg-gray-100 border border-gray-200"
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {/* Abstract placeholder for UI mockups */}
                  <div className={`w-full h-full rounded-2xl shadow-xl flex flex-col p-6 ${
                    isDark ? "bg-black/50 border border-white/10" : "bg-white/50 border border-black/10"
                  }`}>
                    <div className="flex gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 rounded-xl bg-gradient-to-br from-current/5 to-transparent" />
                  </div>
                </div>
              </motion.div>

            </div>
          </section>
        );
      })}
    </div>
  );
}
