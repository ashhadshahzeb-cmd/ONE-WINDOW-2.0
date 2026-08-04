import React from 'react';
import { Search, Bell, Home, FileText, Settings, Droplets, MapPin, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileAppMockup() {
  const EXPO_OUT = [0.16, 1, 0.3, 1] as any;

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
        <div className="absolute inset-0 bg-slate-900 rounded-[3rem] sm:rounded-[3.5rem] border-[6px] sm:border-[8px] border-slate-800 flex flex-col overflow-hidden" style={{ transform: 'translateZ(0px)' }}>
          
          {/* Dynamic Island / Camera Notch */}
          <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-6 sm:h-7 bg-black rounded-full z-50 flex items-center justify-between px-2">
             <div className="w-2 h-2 rounded-full bg-slate-800/80"></div>
             <div className="w-2 h-2 rounded-full bg-blue-900"></div>
          </div>

          {/* Screen Content - Changed background to pure white */}
          <div className="flex-1 bg-white flex flex-col w-full h-full relative overflow-hidden">
            
            {/* Status Bar */}
            <div className="h-12 w-full px-6 flex justify-between items-end pb-2 text-[10px] sm:text-xs font-bold text-slate-900 bg-white z-40">
              <span>9:41</span>
              <div className="flex gap-1.5">
                <span className="tracking-tighter">5G</span>
                <span className="text-emerald-500">🔋</span>
              </div>
            </div>

            {/* App Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white relative z-10">
              
              {/* Top Header - Removed borders and shadows */}
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: EXPO_OUT }}
                className="bg-transparent px-5 py-3 flex justify-between items-center z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-[1.25rem] flex items-center justify-center shadow-sm">
                    <img src="/kwsc-logo.png" alt="KWSC Logo" className="w-7 h-7 object-contain" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h2 className="text-[13px] font-black text-slate-800 leading-tight">KW&SC</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Citizen Portal</p>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center text-slate-600 relative cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                </motion.div>
              </motion.div>

              {/* Scrollable Area */}
              <div className="flex-1 p-5 space-y-7 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* Search / Track - Pill shaped with shadow */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: EXPO_OUT }}
                  className="relative px-1"
                >
                  <div className="relative shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-full bg-white border border-slate-50">
                    <input type="text" placeholder="Track Diary No..." className="w-full h-12 sm:h-14 bg-transparent rounded-full pl-12 pr-14 text-xs font-bold text-slate-600 focus:outline-none placeholder-slate-400" />
                    <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Quick Actions Grid */}
                <div>
                  <motion.h3 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: EXPO_OUT }}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1"
                  >
                    Quick Actions
                  </motion.h3>
                  <div className="grid grid-cols-4 gap-3 px-1">
                    {[
                      { icon: FileText, label: "Track File", color: "text-blue-600", bg: "bg-blue-50/70" },
                      { icon: MapPin, label: "Offices", color: "text-emerald-600", bg: "bg-emerald-50/70" },
                      { icon: Droplets, label: "Pay Bill", color: "text-cyan-600", bg: "bg-cyan-50/70" },
                      { icon: QrCode, label: "Verify", color: "text-purple-600", bg: "bg-purple-50/70" }
                    ].map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 + (i * 0.1), ease: EXPO_OUT }}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <motion.div 
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] ${item.bg} ${item.color} flex items-center justify-center transition-shadow`}
                        >
                          <item.icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                        </motion.div>
                        <span className="text-[10px] font-extrabold text-slate-700 text-center leading-tight group-hover:text-blue-600 transition-colors">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity Card */}
                <div>
                  <motion.h3 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: EXPO_OUT }}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1"
                  >
                    Recent Activity
                  </motion.h3>
                  <div className="bg-white p-5 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 space-y-5 mx-1">
                    
                    <motion.div 
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.6, ease: EXPO_OUT }}
                      className="flex gap-4 group cursor-pointer"
                    >
                      <motion.div 
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="w-10 h-10 rounded-full bg-blue-50/80 flex items-center justify-center text-blue-600 shrink-0 transition-colors"
                      >
                        <FileText className="w-5 h-5" />
                      </motion.div>
                      <div className="flex-1 border-b border-slate-100 pb-4">
                        <h4 className="text-[13px] font-black text-slate-800">NOC Application</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">KWSC-2026-8891</p>
                        <div className="mt-2.5 text-[9px] font-black tracking-wider text-emerald-500 bg-emerald-50 inline-block px-3 py-1.5 rounded-full uppercase">In-Process</div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.7, ease: EXPO_OUT }}
                      className="flex gap-4 group cursor-pointer"
                    >
                      <motion.div 
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 transition-colors"
                      >
                        <FileText className="w-5 h-5" />
                      </motion.div>
                      <div className="flex-1 pb-1">
                        <h4 className="text-[13px] font-black text-slate-800">Water Connection</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">KWSC-2025-1123</p>
                        <div className="mt-2.5 text-[9px] font-black tracking-wider text-slate-500 bg-slate-100 inline-block px-3 py-1.5 rounded-full uppercase">Completed</div>
                      </div>
                    </motion.div>

                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Tab Bar */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: EXPO_OUT }}
              className="h-20 sm:h-24 bg-white border-t border-slate-100 flex justify-around items-center px-4 pb-4 sm:pb-6 z-20 rounded-b-[3rem] sm:rounded-b-[3.5rem]"
            >
              {[
                { icon: Home, label: "Home", color: "text-blue-600" },
                { icon: FileText, label: "Records", color: "text-slate-400" }
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center gap-1.5 ${item.color} cursor-pointer`}>
                  <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${i === 0 ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-[10px] font-extrabold">{item.label}</span>
                </motion.div>
              ))}
              
              {/* Center Floating Button */}
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_12px_24px_rgba(37,99,235,0.4)] -mt-10 sm:-mt-12 cursor-pointer relative z-30"
              >
                <QrCode className="w-6 h-6 sm:w-7 sm:h-7" />
              </motion.div>

              {[
                { icon: Bell, label: "Alerts", color: "text-slate-400" },
                { icon: Settings, label: "Profile", color: "text-slate-400" }
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center gap-1.5 ${item.color} cursor-pointer`}>
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-[10px] font-extrabold">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-300 rounded-full z-50"></div>
          </div>
          
          {/* Screen Glare Overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-[3rem] sm:rounded-[3.5rem] overflow-hidden z-50">
            <div className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-gradient-to-br from-white/30 via-transparent to-transparent transform rotate-[30deg] animate-glare mix-blend-overlay"></div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
