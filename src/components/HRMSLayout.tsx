import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Users, Activity, Shield, Wallet, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function HRMSLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { userRole, signOut } = useAuth();
  
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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-white/10 bg-black/95 backdrop-blur-3xl p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {userRole !== 'hrms_employee' && userRole !== 'hr_admin' && (
              <>
                <Link to="/">
                  <Button variant="outline" size="sm" className="bg-black/20 border-white/10 hover:bg-white/10 text-white/70 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Exit HRMS
                  </Button>
                </Link>
                <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
              </>
            )}
            <Link to="/hrms/dashboard" className="flex items-center gap-2 text-white font-black text-xl hover:text-primary transition-colors">
              <span className="text-primary tracking-widest">ONE</span> HRMS
            </Link>
          </div>

          {/* Horizontal Nav for Desktop (Hidden on Mobile) */}
          <nav className="hidden sm:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button 
                    variant={isActive ? "default" : "ghost"}
                    size="sm" 
                    className={cn(
                      "rounded-full whitespace-nowrap",
                      isActive ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]" : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            
            <div className="w-px h-6 bg-white/20 mx-2 hidden sm:block"></div>
            
            <Button 
              variant="ghost"
              size="sm" 
              onClick={signOut}
              className="rounded-full text-rose-400 hover:text-rose-500 hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-gradient-to-b from-[#0a0a0a] to-[#111] pb-20 sm:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Tab Bar for Mobile (Hidden on Desktop) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 px-2 py-2 safe-area-pb">
        <nav className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className="flex-1 flex flex-col items-center justify-center gap-1 p-2">
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive ? "bg-primary/20 text-primary scale-110" : "text-white/50 hover:text-white/80"
                )}>
                  <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-white/50"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
          
          <button onClick={signOut} className="flex-1 flex flex-col items-center justify-center gap-1 p-2 text-rose-400 hover:text-rose-500">
            <div className="p-1.5 rounded-xl transition-all duration-300">
              <LogOut className="w-6 h-6" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium transition-colors">
              Logout
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
