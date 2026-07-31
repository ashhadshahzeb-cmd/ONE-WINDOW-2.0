import React from 'react';
import { Search, Bell, Home, FileText, Settings, Droplets, MapPin, QrCode } from 'lucide-react';

export default function MobileAppMockup() {
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

          {/* Screen Content */}
          <div className="flex-1 bg-slate-50 flex flex-col w-full h-full relative overflow-hidden">
            
            {/* Status Bar */}
            <div className="h-12 w-full px-6 flex justify-between items-end pb-2 text-[10px] sm:text-xs font-bold text-slate-900 bg-white z-40">
              <span>9:41</span>
              <div className="flex gap-1.5">
                <span className="tracking-tighter">5G</span>
                <span>🔋</span>
              </div>
            </div>

            {/* App Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
              
              {/* Top Header */}
              <div className="bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center rounded-b-3xl shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                    <img src="/kwsc-logo.png" alt="KWSC Logo" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">KW&SC</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Citizen Portal</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                </div>
              </div>

              {/* Scrollable Area */}
              <div className="flex-1 p-5 space-y-6">
                
                {/* Search / Track */}
                <div className="relative">
                  <input type="text" placeholder="Track Diary No..." className="w-full h-12 bg-white rounded-2xl pl-10 pr-4 text-xs font-bold shadow-sm border border-slate-100 focus:outline-none" />
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <div className="absolute right-2 top-2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <QrCode className="w-4 h-4" />
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { icon: FileText, label: "Track File", color: "text-blue-600", bg: "bg-blue-50" },
                      { icon: MapPin, label: "Offices", color: "text-emerald-600", bg: "bg-emerald-50" },
                      { icon: Droplets, label: "Pay Bill", color: "text-cyan-600", bg: "bg-cyan-50" },
                      { icon: QrCode, label: "Verify", color: "text-purple-600", bg: "bg-purple-50" }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}>
                          <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity Card */}
                <div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Activity</h3>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 border-b border-slate-50 pb-3">
                        <h4 className="text-xs font-bold text-slate-800">NOC Application</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">KWSC-2026-8891</p>
                        <div className="mt-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md uppercase">In-Process</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-800">Water Connection</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">KWSC-2025-1123</p>
                        <div className="mt-2 text-[9px] font-bold text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded-md uppercase">Completed</div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Tab Bar */}
            <div className="h-16 sm:h-20 bg-white border-t border-slate-100 flex justify-around items-center px-4 pb-2 z-20">
              <div className="flex flex-col items-center gap-1 text-blue-600">
                <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[9px] font-bold">Home</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[9px] font-bold">Records</span>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg -mt-6 sm:-mt-8 shadow-blue-600/30">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[9px] font-bold">Alerts</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[9px] font-bold">Profile</span>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-200 rounded-full z-50"></div>
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
