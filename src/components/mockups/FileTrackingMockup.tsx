import React from 'react';
import { Search, FileText, CheckCircle, Clock, MoreVertical, LayoutDashboard } from 'lucide-react';

export default function FileTrackingMockup() {
  const data = [
    { id: 'FT-2023-891', subject: 'NOC for Water Connection', from: 'Zone East', status: 'In Progress', time: '2 hrs ago' },
    { id: 'FT-2023-890', subject: 'Budget Approval Q3', from: 'Finance Dept', status: 'Approved', time: '5 hrs ago' },
    { id: 'FT-2023-889', subject: 'Contractor Payment Bill', from: 'Engineering', status: 'Pending Review', time: '1 day ago' },
    { id: 'FT-2023-888', subject: 'HR Leave Application', from: 'HR Dept', status: 'Approved', time: '1 day ago' },
    { id: 'FT-2023-887', subject: 'Audit Report 2022', from: 'Internal Audit', status: 'In Progress', time: '2 days ago' },
  ];

  return (
    <div className="w-full relative animate-float-slow [zoom:0.45] sm:[zoom:0.65] lg:[zoom:1]" style={{ perspective: '1500px' }}>
      <div 
        className="relative w-full max-w-[700px] aspect-[16/10] mx-auto"
        style={{
          transform: 'rotateX(5deg) rotateY(15deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Depth Slabs */}
        <div className="absolute inset-0 bg-[#cbd5e1] rounded-xl" style={{ transform: 'translateZ(-2px)' }}></div>
        <div className="absolute inset-0 bg-[#94a3b8] rounded-xl" style={{ transform: 'translateZ(-4px)' }}></div>
        <div className="absolute inset-0 bg-[#64748b] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.4)]" style={{ transform: 'translateZ(-6px)' }}></div>

        {/* Main Frame */}
        <div className="absolute inset-0 bg-[#f8fafc] rounded-xl border border-[#cbd5e1] overflow-hidden flex flex-col" style={{ transform: 'translateZ(0px)' }}>
          {/* Chrome */}
          <div className="h-8 bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1] flex items-center px-4 border-b border-[#94a3b8]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="mx-auto bg-white/50 text-[#64748b] text-[10px] font-mono px-12 py-0.5 rounded shadow-inner">
              www.kwsc1window.com
            </div>
          </div>

          {/* App Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-[48px] bg-[#0f172a] flex flex-col items-center py-4 gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white"><LayoutDashboard size={16} /></div>
              <div className="w-8 h-8 rounded-lg text-slate-400 hover:text-white flex items-center justify-center"><FileText size={16} /></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 flex flex-col bg-[#f1f5f9]">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-bold text-slate-800">File Tracking System</h1>
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search Diary No..." className="pl-6 pr-3 py-1 rounded bg-white border border-slate-200 text-xs w-40 outline-none" />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200 rounded-lg flex-1 flex flex-col shadow-sm overflow-hidden">
                <div className="flex bg-slate-50 p-2 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <div className="w-20">Diary No</div>
                  <div className="flex-[2]">Subject</div>
                  <div className="flex-1">Origin</div>
                  <div className="flex-1">Status</div>
                  <div className="w-16">Time</div>
                </div>
                <div className="flex-1 flex flex-col">
                  {data.map((row, i) => (
                    <div key={i} className="flex p-2 text-[11px] items-center border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <div className="w-20 text-blue-600 font-semibold">{row.id}</div>
                      <div className="flex-[2] text-slate-700 truncate pr-2">{row.subject}</div>
                      <div className="flex-1 text-slate-500">{row.from}</div>
                      <div className="flex-1 flex items-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          row.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          row.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {row.status}
                        </span>
                      </div>
                      <div className="w-16 text-slate-400 text-[10px]">{row.time}</div>
                    </div>
                  ))}
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
