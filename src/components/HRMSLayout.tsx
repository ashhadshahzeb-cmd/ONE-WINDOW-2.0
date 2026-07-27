import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Users, Activity, Shield, Wallet, LogOut, User, Menu, X, Bell, ChevronRight, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationDropdown } from './NotificationDropdown';

export default function HRMSLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { userRole, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  let navItems = [
    { to: "/hrms/dashboard", icon: Home, label: "Dashboard" },
    { to: "/hrms/attendance", icon: Activity, label: "Attendance" },
    { to: "/hrms/leaves", icon: Shield, label: "Leaves" },
  ];

  if (userRole === 'hrms_employee') {
    navItems.push({ to: "/hrms/profile", icon: User, label: "Profile" });
  } else {
    navItems.splice(1, 0, { to: "/hrms/employees", icon: Users, label: "Employees" });
    navItems.push({ to: "/hrms/payroll", icon: Wallet, label: "Payroll" });
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased flex overflow-hidden">
      
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="hidden sm:flex flex-col bg-black/90 backdrop-blur-3xl border-r border-white/10 relative z-50 h-screen transition-all duration-300"
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <Link to="/hrms/dashboard" className="flex items-center gap-3">
              <img src="/kwsc-logo.png" alt="KWSC" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              <span className="text-white font-black text-xl tracking-tight">
                <span className="text-blue-500">ONE</span> HRMS
              </span>
            </Link>
          )}
          {isSidebarCollapsed && (
            <img src="/kwsc-logo.png" alt="KWSC" className="w-8 h-8 object-contain mx-auto" />
          )}
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}>
                <motion.div 
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group overflow-hidden",
                    isActive ? "bg-white/10 text-white shadow-inner" : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                  )}
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-blue-400" : "group-hover:text-white")} />
                  {!isSidebarCollapsed && <span className="font-semibold text-sm">{item.label}</span>}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          {!isSidebarCollapsed && userRole !== 'hrms_employee' && userRole !== 'hr_admin' && (
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start text-white/50 hover:text-white hover:bg-white/5 rounded-xl mb-2">
                <ArrowLeft className="w-4 h-4 mr-3" /> Back to Main
              </Button>
            </Link>
          )}
          <Button 
            variant="ghost" 
            onClick={signOut}
            className={cn(
              "w-full text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl",
              isSidebarCollapsed ? "justify-center px-0" : "justify-start"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3 font-semibold">Logout</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Desktop Top App Bar */}
        <header className="hidden sm:flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl">
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="h-6 w-px bg-white/10"></div>
            
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input 
                placeholder="Search..." 
                className="bg-white/5 border-white/10 text-white pl-9 w-64 rounded-xl focus-visible:ring-white/20 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="hidden sm:flex items-center gap-3 pl-4 ml-4 border-l border-white/10">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white/70" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="sm:hidden flex items-center justify-between px-4 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <img src="/kwsc-logo.png" alt="KWSC" className="w-8 h-8 object-contain" />
            <span className="text-white font-black text-lg tracking-tight">ONE HRMS</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#111] pb-28 sm:pb-0 relative custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] sm:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-3/4 max-w-sm bg-[#111] border-l border-white/10 z-[100] sm:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/10">
                <span className="font-bold text-white text-lg">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                 <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                       <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                       <div className="font-bold text-white">HRMS User</div>
                       <div className="text-xs text-white/50">{userRole}</div>
                    </div>
                 </div>

                 {userRole !== 'hrms_employee' && userRole !== 'hr_admin' && (
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-xl py-6">
                      <ArrowLeft className="w-5 h-5 mr-3" /> Back to Main Dashboard
                    </Button>
                  </Link>
                )}
                
                <div className="mt-auto pt-4 border-t border-white/10">
                  <Button onClick={signOut} className="w-full justify-start text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl py-6 font-bold">
                    <LogOut className="w-5 h-5 mr-3" /> Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50 safe-area-pb">
        <nav className="flex justify-around items-center bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className="flex-1 relative">
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center justify-center gap-1 py-3"
                >
                  {isActive && (
                    <motion.div 
                      layoutId="mobile-active-tab"
                      className="absolute inset-0 bg-white/10 rounded-3xl -z-10"
                      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 transition-all duration-300", isActive ? "text-blue-400 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-white/40")} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={cn(
                    "text-[10px] font-bold transition-all duration-300",
                    isActive ? "text-white" : "text-transparent"
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  );
}
