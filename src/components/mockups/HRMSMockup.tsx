import React from 'react';
import { User, Calendar, Clock, BarChart3, Settings } from 'lucide-react';

export default function HRMSMockup() {
  return (
    <div className="w-full relative animate-float-slow [zoom:0.45] sm:[zoom:0.65] lg:[zoom:1]" style={{ perspective: '1500px' }}>
      <div 
        className="relative w-full max-w-[700px] aspect-[16/10] mx-auto"
        style={{
          transform: 'rotateX(5deg) rotateY(15deg)', // rotate the other way for variety
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Depth Slabs */}
        <div className="absolute inset-0 bg-[#e2e8f0] rounded-xl" style={{ transform: 'translateZ(-2px)' }}></div>
        <div className="absolute inset-0 bg-[#cbd5e1] rounded-xl" style={{ transform: 'translateZ(-4px)' }}></div>
        <div className="absolute inset-0 bg-[#94a3b8] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.4)]" style={{ transform: 'translateZ(-6px)' }}></div>

        {/* Main Frame */}
        <div className="absolute inset-0 bg-white rounded-xl border border-[#cbd5e1] overflow-hidden flex flex-col" style={{ transform: 'translateZ(0px)' }}>
          {/* Chrome */}
          <div className="h-8 bg-gradient-to-b from-slate-100 to-slate-200 flex items-center px-4 border-b border-slate-300">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="mx-auto bg-white/50 text-slate-500 text-[10px] font-mono px-12 py-0.5 rounded shadow-inner">
              www.kwsc1window.com
            </div>
          </div>

          {/* App Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-[140px] bg-slate-50 border-r border-slate-200 flex flex-col py-4 px-2 gap-1 shrink-0">
              <div className="flex items-center gap-2 px-2 mb-4">
                <img src="/kwsc-logo.png" alt="KWSC Logo" className="w-6 h-6 object-contain" />
                <span className="text-xs font-bold text-slate-700">KW&SC HRMS</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold"><User size={12} /> Dashboard</div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 text-[10px]"><Calendar size={12} /> Attendance</div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 text-[10px]"><Clock size={12} /> Leaves</div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 text-[10px]"><BarChart3 size={12} /> Payroll</div>
              <div className="mt-auto flex items-center gap-2 px-2 py-1.5 text-slate-500 text-[10px]"><Settings size={12} /> Settings</div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-5 flex flex-col overflow-y-auto">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Employee Overview</h2>
              
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                  <User size={32} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Muhammad Ali</h3>
                  <div className="flex gap-2 text-[9px]">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">ID: 88472</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Active</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
                  <div className="text-[10px] text-slate-500 font-medium mb-1">Attendance (This Month)</div>
                  <div className="text-lg font-black text-emerald-600">96%</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
                  <div className="text-[10px] text-slate-500 font-medium mb-1">Available Leaves</div>
                  <div className="text-lg font-black text-blue-600">14</div>
                </div>
                <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
                  <div className="text-[10px] text-slate-500 font-medium mb-1">Last Salary</div>
                  <div className="text-lg font-black text-slate-800">Paid</div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="flex-1 border border-slate-200 rounded-lg p-3 flex flex-col">
                <div className="text-[10px] font-bold text-slate-700 mb-2">Weekly Attendance Trend</div>
                <div className="flex-1 flex items-end gap-2 pt-4">
                  {[40, 80, 60, 100, 90, 30].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-100 rounded-t-sm relative">
                      <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-[8px] text-slate-400">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
              </div>

            </div>
          </div>
          
          {/* Glare */}
          <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
            <div className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-gradient-to-tr from-transparent via-white/40 to-transparent transform -rotate-45 animate-glare mix-blend-overlay"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
