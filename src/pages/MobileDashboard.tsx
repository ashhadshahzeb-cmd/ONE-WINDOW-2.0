import React from 'react';
import { Search, Bell, Home, FileText, Settings, Droplets, MapPin, QrCode, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { MobileMenu } from '@/components/MobileMenu';

export default function MobileDashboard() {
  const EXPO_OUT = [0.16, 1, 0.3, 1] as any;
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  return (
    <div className="w-full min-h-screen bg-white flex justify-center overflow-hidden">
      
      {/* Mobile Device Container - No 3D transform, max width for desktop viewing, full width on mobile */}
      <div className="relative w-full max-w-md mx-auto flex flex-col h-screen">
          
        {/* Screen Content - Changed background to pure white */}
        <div className="flex-1 bg-white flex flex-col w-full h-full relative overflow-hidden">
          
          {/* Status Bar space (if running in Capacitor, StatusBar plugin usually handles this, but we'll leave a safe top padding) */}
          <div className="h-6 w-full bg-white z-40"></div>

          {/* App Content */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white relative z-10">
            
            {/* Top Header */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: EXPO_OUT }}
              className="bg-transparent px-5 py-3 flex justify-between items-center z-10"
            >
              <div className="flex items-center gap-3">
                {user ? (
                  <MobileMenu />
                ) : (
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-[1.25rem] flex items-center justify-center shadow-sm">
                    <img src="/kwsc-logo.png" alt="KWSC Logo" className="w-7 h-7 object-contain" />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <h2 className="text-[13px] font-black text-slate-800 leading-tight">KW&SC</h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Citizen Portal</p>
                </div>
              </div>
              <div className="relative">
                {user ? (
                  <div className="bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center text-slate-600 [&_button]:w-10 [&_button]:h-10 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:bg-transparent [&_button]:border-none [&_button]:shadow-none [&_svg]:w-5 [&_svg]:h-5">
                    <NotificationDropdown />
                  </div>
                ) : (
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="w-10 h-10 bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center text-slate-600 relative cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
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
                  <input type="text" placeholder="Track Diary No..." className="w-full h-14 bg-transparent rounded-full pl-12 pr-14 text-sm font-bold text-slate-600 focus:outline-none placeholder-slate-400" />
                  <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/track')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <QrCode className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Quick Actions Grid */}
              <div>
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: EXPO_OUT }}
                  className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-1"
                >
                  Quick Actions
                </motion.h3>
                <div className="grid grid-cols-4 gap-3 px-1">
                  {[
                    { icon: FileText, label: "Track File", color: "text-blue-600", bg: "bg-blue-50/70", route: "/track" },
                    { icon: MapPin, label: "Offices", color: "text-emerald-600", bg: "bg-emerald-50/70", route: "#" },
                    { icon: Droplets, label: "Pay Bill", color: "text-cyan-600", bg: "bg-cyan-50/70", route: "#" },
                    { icon: user ? LayoutDashboard : QrCode, label: user ? "Dashboard" : "Verify", color: "text-purple-600", bg: "bg-purple-50/70", route: user ? "/dashboard" : "/login" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      onClick={() => item.route !== "#" && navigate(item.route)}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 + (i * 0.1), ease: EXPO_OUT }}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <motion.div 
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-16 h-16 rounded-[1.25rem] ${item.bg} ${item.color} flex items-center justify-center transition-shadow`}
                      >
                        <item.icon className="w-7 h-7 stroke-[2.5]" />
                      </motion.div>
                      <span className="text-[11px] font-extrabold text-slate-700 text-center leading-tight group-hover:text-blue-600 transition-colors">{item.label}</span>
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
                  className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-1"
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
                      className="w-12 h-12 rounded-full bg-blue-50/80 flex items-center justify-center text-blue-600 shrink-0 transition-colors"
                    >
                      <FileText className="w-6 h-6" />
                    </motion.div>
                    <div className="flex-1 border-b border-slate-100 pb-4">
                      <h4 className="text-[14px] font-black text-slate-800">NOC Application</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">KWSC-2026-8891</p>
                      <div className="mt-2.5 text-[10px] font-black tracking-wider text-emerald-500 bg-emerald-50 inline-block px-3 py-1.5 rounded-full uppercase">In-Process</div>
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
                      className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 transition-colors"
                    >
                      <FileText className="w-6 h-6" />
                    </motion.div>
                    <div className="flex-1 pb-1">
                      <h4 className="text-[14px] font-black text-slate-800">Water Connection</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">KWSC-2025-1123</p>
                      <div className="mt-2.5 text-[10px] font-black tracking-wider text-slate-500 bg-slate-100 inline-block px-3 py-1.5 rounded-full uppercase">Completed</div>
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
            className="h-24 bg-white border-t border-slate-100 flex justify-around items-center px-4 pb-6 z-20"
          >
            {[
              { icon: Home, label: "Home", color: "text-blue-600", route: "/mobile-app" },
              { icon: FileText, label: "Records", color: "text-slate-400", route: "/track" }
            ].map((item, i) => (
              <motion.div key={i} onClick={() => navigate(item.route)} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center gap-1.5 ${item.color} cursor-pointer`}>
                <item.icon className={`w-6 h-6 ${i === 0 ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[11px] font-extrabold">{item.label}</span>
              </motion.div>
            ))}
            
            {/* Center Floating Button */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/track')}
              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_12px_24px_rgba(37,99,235,0.4)] -mt-12 cursor-pointer relative z-30"
            >
              <QrCode className="w-7 h-7" />
            </motion.div>

            {[
              { icon: Bell, label: "Alerts", color: "text-slate-400", route: "#" },
              { icon: Settings, label: "Profile", color: "text-slate-400", route: user ? "/profile" : "/login" }
            ].map((item, i) => (
              <motion.div key={i} onClick={() => item.route !== "#" && navigate(item.route)} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center gap-1.5 ${item.color} cursor-pointer`}>
                <item.icon className="w-6 h-6" />
                <span className="text-[11px] font-extrabold">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
        
      </div>
    </div>
  );
}
