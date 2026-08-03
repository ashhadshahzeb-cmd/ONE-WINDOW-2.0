import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, FileText, QrCode, Droplets, Smartphone, ArrowRight, Twitter, Facebook, Globe, ArrowUp } from 'lucide-react';

export default function MobileAppMockup() {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll animations constants
  const EXPO_OUT = [0.16, 1, 0.3, 1] as any;
  const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as any;

  return (
    <div className="w-full relative animate-float-slow flex justify-center" style={{ perspective: '2000px' }}>
      
      {/* Mobile Device Container */}
      <div 
        className="relative w-[280px] h-[580px] sm:w-[320px] sm:h-[650px] mx-auto"
        style={{
          transform: 'rotateX(15deg) rotateY(-15deg) rotateZ(5deg)', 
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Phone Body (Depth/Shadows) */}
        <div className="absolute inset-0 bg-slate-800 rounded-[3rem] sm:rounded-[3.5rem] shadow-2xl" style={{ transform: 'translateZ(-10px)' }}></div>
        <div className="absolute inset-0 bg-slate-700 rounded-[3rem] sm:rounded-[3.5rem]" style={{ transform: 'translateZ(-5px)' }}></div>
        <div className="absolute inset-0 bg-slate-400 rounded-[3rem] sm:rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)]" style={{ transform: 'translateZ(-15px)' }}></div>

        {/* Outer Bezel */}
        <div className="absolute inset-0 bg-[#1a1a1a] rounded-[3rem] sm:rounded-[3.5rem] border-[6px] sm:border-[8px] border-[#2a2a2a] flex flex-col overflow-hidden" style={{ transform: 'translateZ(0px)' }}>
          
          {/* Dynamic Island / Camera Notch */}
          <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-6 sm:h-7 bg-black rounded-full z-[200] flex items-center justify-between px-2 shadow-inner">
             <div className="w-2 h-2 rounded-full bg-slate-800/80"></div>
             <div className="w-2 h-2 rounded-full bg-blue-900/50"></div>
          </div>

          {/* Screen Content - SCROLLABLE CONTAINER */}
          <div 
            id="mobile-mockup-scroll-container"
            className="flex-1 bg-slate-950 flex flex-col w-full h-full relative overflow-y-auto scrollbar-hide container" 
            style={{ containerType: 'size' as any }}
          >
            
            {/* --- SECTION 1: HERO --- */}
            <section className="relative min-h-[100cqh] w-full flex flex-col bg-slate-950 overflow-hidden">
              {/* Video Background */}
              <div className="absolute inset-0 z-0">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover opacity-60 mix-blend-screen"
                  onCanPlay={() => setIsVideoReady(true)}
                >
                  <source src="https://cdn.pixabay.com/video/2021/08/11/84687-586940801_large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-slate-950/40"></div>
              </div>

              {/* Navbar */}
              <div className="absolute top-0 w-full z-[150] flex justify-between items-center px-5 pt-12 pb-4">
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: EXPO_OUT }}
                  className="font-black text-lg tracking-tight"
                >
                  <span className="text-white">KW&SC</span> <span className="text-cyan-500">PORTAL</span>
                </motion.div>
                
                <motion.button 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: EXPO_OUT }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white relative z-[250]"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.button>
              </div>

              {/* Mobile Menu Overlay */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 bg-sky-950 z-[140] flex flex-col items-center justify-center gap-8"
                  >
                    {["Track File", "Pay Bill", "Verify QR"].map((item, i) => (
                      <motion.div
                        key={item}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 + 0.1 }}
                        className="text-white text-2xl font-bold cursor-pointer hover:text-cyan-300"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hero Content */}
              <AnimatePresence>
                {isVideoReady && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-auto relative z-10 px-5 pb-10 flex flex-col gap-6"
                  >
                    <div className="flex flex-col font-black text-4xl sm:text-5xl leading-[0.85] tracking-tight">
                      <motion.span 
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.85, ease: EXPO_OUT, delay: 0 }}
                        className="text-white"
                      >
                        ONE WINDOW
                      </motion.span>
                      <motion.span 
                        initial={{ x: 200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.85, ease: EXPO_OUT, delay: 0.13 }}
                        className="text-cyan-400 text-right pr-4"
                      >
                        FACILITATION
                      </motion.span>
                      <motion.span 
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.85, ease: EXPO_OUT, delay: 0.26 }}
                        className="text-white"
                      >
                        AT YOUR FINGERTIPS
                      </motion.span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-cyan-500 rounded-full h-12 w-48 flex items-center justify-between pl-5 pr-1 font-bold text-white shadow-lg overflow-hidden group"
                    >
                      <span className="text-sm">Access Portal</span>
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white group-hover:-rotate-45 transition-transform duration-300" />
                      </div>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* --- SECTION 2: INFO CARD --- */}
            <section className="relative w-full bg-gradient-to-b from-slate-900 via-blue-900 to-sky-700 px-5 py-16 flex flex-col gap-10 overflow-hidden">
              
              <div className="flex flex-col">
                <motion.h2 
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                  transition={{ duration: 0.8, ease: EASE_OUT }}
                  className="font-black text-white text-3xl tracking-tight"
                >
                  PUBLIC SERVICE
                </motion.h2>
                <motion.p 
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                  transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 }}
                  className="text-sky-200 text-sm leading-tight mt-1"
                >
                  shaped by transparency<br/>powered by technology
                </motion.p>
              </div>

              {/* Graphic Area */}
              <div className="relative w-full aspect-square mt-4">
                {/* SVG Routes */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible z-0">
                  <motion.path 
                    d="M10,80 Q40,20 90,30" 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  <motion.path 
                    d="M20,20 Q60,90 95,70" 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  />
                  
                  {/* Stop Nodes */}
                  <circle cx="10" cy="80" r="3" fill="#06b6d4" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="90" cy="30" r="3" fill="#06b6d4" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="20" cy="20" r="3" fill="#06b6d4" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="95" cy="70" r="3" fill="#06b6d4" stroke="#0f172a" strokeWidth="1" />
                </svg>

                {/* Floating Icons */}
                <motion.div 
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  animate={{ y: [0, -10, 0] }} transition={{ scale: {duration: 0.5}, y: {repeat: Infinity, duration: 3, ease: "easeInOut"} }}
                  className="absolute top-[10%] left-[10%] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl shadow-cyan-900/30 z-10"
                >
                  <FileText className="w-5 h-5 text-cyan-600" />
                </motion.div>

                <motion.div 
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  animate={{ y: [0, 15, 0] }} transition={{ scale: {duration: 0.5, delay: 0.1}, y: {repeat: Infinity, duration: 2.5, ease: "easeInOut"} }}
                  className="absolute top-[20%] right-[5%] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl shadow-cyan-900/30 z-10"
                >
                  <QrCode className="w-5 h-5 text-cyan-600" />
                </motion.div>

                <motion.div 
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  animate={{ y: [0, -12, 0] }} transition={{ scale: {duration: 0.5, delay: 0.2}, y: {repeat: Infinity, duration: 3.2, ease: "easeInOut"} }}
                  className="absolute bottom-[10%] left-[40%] w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl shadow-cyan-900/30 z-10"
                >
                  <Droplets className="w-6 h-6 text-cyan-600" />
                </motion.div>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-6 pt-4">
                <motion.div 
                  initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-4xl font-black text-cyan-400">10K+</span>
                  <span className="text-white text-xs leading-tight">files tracked<br/>securely & instantly</span>
                </motion.div>
                <motion.div 
                  initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center justify-end gap-3 pr-4"
                >
                  <span className="text-white text-xs leading-tight text-right">transparent<br/>digital operations</span>
                  <span className="text-4xl font-black text-cyan-400">100%</span>
                </motion.div>
              </div>

            </section>

            {/* --- SECTION 3: CONTACT & DOWNLOAD --- */}
            <section className="relative w-full bg-slate-950 px-5 pt-12 pb-24 flex flex-col gap-8">
              <div className="flex flex-col">
                <motion.h2 
                  initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                  className="font-black text-3xl tracking-tight"
                >
                  <span className="text-white">DOWNLOAD</span> <span className="text-cyan-500">APP</span>
                </motion.h2>
                <motion.p 
                  initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-slate-400 text-xs mt-2"
                >
                  Get real-time alerts and track your files on the go.
                </motion.p>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button 
                  initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.12)" }}
                  className="w-full h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center gap-2 text-white font-semibold text-sm"
                >
                  <Smartphone className="w-4 h-4" /> Download for Android
                </motion.button>
                <motion.button 
                  initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full h-12 rounded-full bg-white flex items-center justify-center gap-2 text-slate-900 font-bold text-sm"
                >
                  <Smartphone className="w-4 h-4" /> Download for iOS
                </motion.button>
              </div>

              <div className="mt-4 flex justify-between items-end border-t border-slate-800 pt-6">
                <div className="flex flex-col gap-2 text-slate-400 text-xs">
                  <span className="hover:text-white transition-colors cursor-pointer">support@kwsc.gos.pk</span>
                  <span className="hover:text-white transition-colors cursor-pointer">+92 21 99205688</span>
                  <div className="flex gap-3 mt-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all cursor-pointer">
                      <Twitter className="w-4 h-4 text-slate-900" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all cursor-pointer">
                      <Facebook className="w-4 h-4 text-slate-900" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all cursor-pointer">
                      <Globe className="w-4 h-4 text-slate-900" />
                    </div>
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.1, y: -2 }}
                  onClick={() => {
                    const scrollContainer = document.getElementById('mobile-mockup-scroll-container');
                    scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white"
                >
                  <ArrowUp className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="text-slate-600 text-[10px] text-center mt-2">
                © 2026 Karachi Water & Sewerage Corporation.
              </div>
            </section>
            
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/30 rounded-full z-[100] pointer-events-none"></div>

          {/* Screen Glare Overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-[3rem] sm:rounded-[3.5rem] overflow-hidden z-[90]">
            <div className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-gradient-to-br from-white/10 via-transparent to-transparent transform rotate-[30deg] mix-blend-overlay"></div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
