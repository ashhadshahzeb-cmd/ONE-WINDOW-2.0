import React from 'react';
import { DollarSign, FileText, ArrowRightLeft, Briefcase, TrendingUp } from 'lucide-react';

export default function FinanceMockup() {
  const transactions = [
    { id: 'TRX-1092', desc: 'Vendor Payment (Pipes)', amount: '-$12,450', date: 'Oct 12' },
    { id: 'TRX-1093', desc: 'Revenue Collection Z-1', amount: '+$45,200', date: 'Oct 13' },
    { id: 'TRX-1094', desc: 'Salary Disbursement', amount: '-$89,000', date: 'Oct 15' },
    { id: 'TRX-1095', desc: 'Security Deposit', amount: '+$5,000', date: 'Oct 16' },
  ];

  return (
    <div className="w-full relative animate-float-slow [zoom:0.45] sm:[zoom:0.65] lg:[zoom:1]" style={{ perspective: '1500px' }}>
      <div 
        className="relative w-full max-w-[700px] aspect-[16/10] mx-auto"
        style={{
          transform: 'rotateX(5deg) rotateY(-15deg)', 
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Depth Slabs */}
        <div className="absolute inset-0 bg-[#312e81] rounded-xl" style={{ transform: 'translateZ(-2px)' }}></div>
        <div className="absolute inset-0 bg-[#1e1b4b] rounded-xl" style={{ transform: 'translateZ(-4px)' }}></div>
        <div className="absolute inset-0 bg-[#0f172a] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.6)]" style={{ transform: 'translateZ(-6px)' }}></div>

        {/* Main Frame */}
        <div className="absolute inset-0 bg-[#0f172a] rounded-xl border border-[#312e81] overflow-hidden flex flex-col" style={{ transform: 'translateZ(0px)' }}>
          {/* Chrome */}
          <div className="h-8 bg-gradient-to-b from-[#1e293b] to-[#0f172a] flex items-center px-4 border-b border-[#000]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="mx-auto bg-black/50 text-[#818cf8] text-[10px] font-mono px-12 py-0.5 rounded border border-[#312e81] shadow-inner">
              www.kwsc1window.com
            </div>
          </div>

          {/* App Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-[50px] bg-[#1e1b4b] border-r border-[#312e81] flex flex-col items-center py-4 gap-4 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center"><Briefcase size={16} /></div>
              <div className="w-8 h-8 rounded-lg text-indigo-300 hover:text-white flex items-center justify-center"><ArrowRightLeft size={16} /></div>
              <div className="w-8 h-8 rounded-lg text-indigo-300 hover:text-white flex items-center justify-center"><FileText size={16} /></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-5 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-sm font-bold text-white">Financial Hub</h2>
                  <div className="text-[10px] text-indigo-300">Fiscal Year 2023-2024</div>
                </div>
                <button className="bg-indigo-600 text-white text-[10px] px-3 py-1.5 rounded-md font-bold">Transfer Advice</button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#1e1b4b] border border-[#312e81] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-indigo-300 mb-2">
                    <DollarSign size={12} /> <span className="text-[10px] font-bold uppercase">Total Budget</span>
                  </div>
                  <div className="text-lg font-black text-white">Rs 450.5M</div>
                  <div className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1"><TrendingUp size={10}/> +2.4% vs last Q</div>
                </div>
                <div className="bg-[#1e1b4b] border border-[#312e81] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-indigo-300 mb-2">
                    <ArrowRightLeft size={12} /> <span className="text-[10px] font-bold uppercase">Expenses</span>
                  </div>
                  <div className="text-lg font-black text-white">Rs 120.2M</div>
                  <div className="text-[9px] text-slate-400 mt-1">26% of Total Budget</div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="flex-1 bg-[#1e1b4b] border border-[#312e81] rounded-lg flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b border-[#312e81] flex justify-between items-center bg-[#282563]">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase">Recent Transactions</span>
                </div>
                <div className="flex-1 flex flex-col">
                  {transactions.map((trx, i) => (
                    <div key={i} className="flex justify-between items-center p-2 px-3 border-b border-[#312e81] last:border-0 hover:bg-[#282563]">
                      <div>
                        <div className="text-[11px] text-white font-medium">{trx.desc}</div>
                        <div className="text-[9px] text-indigo-300">{trx.id} • {trx.date}</div>
                      </div>
                      <div className={`text-[11px] font-bold ${trx.amount.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          
          {/* Glare */}
          <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
            <div className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -rotate-45 animate-glare mix-blend-overlay"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
