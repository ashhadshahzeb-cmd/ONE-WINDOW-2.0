import React from 'react';
import { Heart, Activity, CheckCircle, Clock, ShieldCheck, FileCheck } from 'lucide-react';

export default function WelfareMockup() {
  const funds = [
    { name: 'CP Fund', status: 'Active', balance: 'Rs 1.2M' },
    { name: 'Pension & Gratuity', status: 'Pending Approval', balance: 'Rs 4.5M' },
    { name: 'Medical Allowances', status: 'Disbursed', balance: 'Rs 50K' },
  ];

  return (
    <div className="w-full relative animate-float-slow" style={{ perspective: '1500px' }}>
      <div 
        className="relative w-full max-w-[700px] aspect-[16/10] mx-auto"
        style={{
          transform: 'rotateX(5deg) rotateY(-15deg)', 
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Depth Slabs */}
        <div className="absolute inset-0 bg-[#d1fae5] rounded-xl" style={{ transform: 'translateZ(-2px)' }}></div>
        <div className="absolute inset-0 bg-[#a7f3d0] rounded-xl" style={{ transform: 'translateZ(-4px)' }}></div>
        <div className="absolute inset-0 bg-[#059669] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.3)]" style={{ transform: 'translateZ(-6px)' }}></div>

        {/* Main Frame */}
        <div className="absolute inset-0 bg-[#f8fafc] rounded-xl border border-[#a7f3d0] overflow-hidden flex flex-col" style={{ transform: 'translateZ(0px)' }}>
          {/* Chrome */}
          <div className="h-8 bg-gradient-to-b from-white to-slate-50 flex items-center px-4 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="mx-auto bg-slate-100 text-slate-500 text-[10px] font-mono px-12 py-0.5 rounded border border-slate-200 shadow-inner">
              www.kwsc1window.com
            </div>
          </div>

          {/* App Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-[150px] bg-emerald-50/50 border-r border-emerald-100 flex flex-col py-4 px-3 gap-2 shrink-0">
              <div className="flex items-center gap-2 mb-4 text-emerald-800">
                <Heart size={16} className="text-emerald-500" />
                <span className="text-xs font-black">Welfare Dept</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-emerald-500 text-white rounded-md text-[10px] font-bold shadow-sm">
                <Activity size={12} /> Fund Requests
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 text-[10px]">
                <ShieldCheck size={12} /> Disbursals
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 text-[10px]">
                <FileCheck size={12} /> Audit Logs
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-5 flex flex-col bg-white">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Pension & Fund Management</h2>
                  <div className="text-[10px] text-slate-500">Employee Welfare Dashboard</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[9px]">JD</div>
                </div>
              </div>

              {/* Workflow Process */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4">
                <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-3">Live Disbursement Workflow</h3>
                <div className="flex items-center justify-between px-2 relative">
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                  
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><CheckCircle size={10} /></div>
                    <div className="text-[8px] font-bold text-slate-700">Verification</div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center"><CheckCircle size={10} /></div>
                    <div className="text-[8px] font-bold text-slate-700">Calculation</div>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center"><Clock size={10} /></div>
                    <div className="text-[8px] font-bold text-amber-700">Treasury Auth</div>
                  </div>
                </div>
              </div>

              {/* Funds Table */}
              <div className="flex-1 border border-slate-100 rounded-lg flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Recent Fund Requests</span>
                </div>
                <div className="flex-1 flex flex-col bg-white">
                  {funds.map((fund, i) => (
                    <div key={i} className="flex justify-between items-center p-2 px-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-500">
                          <ShieldCheck size={10} />
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-800 font-bold">{fund.name}</div>
                          <div className={`text-[8px] font-bold mt-0.5 ${
                            fund.status === 'Active' ? 'text-blue-500' :
                            fund.status === 'Pending Approval' ? 'text-amber-500' :
                            'text-emerald-500'
                          }`}>{fund.status}</div>
                        </div>
                      </div>
                      <div className="text-[11px] font-black text-slate-700">{fund.balance}</div>
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
