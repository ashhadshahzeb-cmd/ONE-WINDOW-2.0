import React from 'react';
import { Search, MapPin, CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';

export default function PublicTrackingMockup() {
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
        <div className="absolute inset-0 bg-[#fed7aa] rounded-xl" style={{ transform: 'translateZ(-2px)' }}></div>
        <div className="absolute inset-0 bg-[#ffedd5] rounded-xl" style={{ transform: 'translateZ(-4px)' }}></div>
        <div className="absolute inset-0 bg-[#f97316] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.3)]" style={{ transform: 'translateZ(-6px)' }}></div>

        {/* Main Frame */}
        <div className="absolute inset-0 bg-[#fffbeb] rounded-xl border border-[#fed7aa] overflow-hidden flex flex-col" style={{ transform: 'translateZ(0px)' }}>
          {/* Chrome */}
          <div className="h-8 bg-gradient-to-b from-white to-orange-50 flex items-center px-4 border-b border-orange-200">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="mx-auto bg-white/70 text-orange-800 text-[10px] font-mono px-12 py-0.5 rounded border border-orange-200 shadow-inner">
              www.kwsc1window.com/track
            </div>
          </div>

          {/* App Layout */}
          <div className="flex-1 flex flex-col items-center justify-start p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-[40px] -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-[40px] -z-10 transform -translate-x-1/2 translate-y-1/2"></div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-black text-slate-800 mb-1 tracking-tight">Public Tracking Portal</h1>
              <p className="text-xs text-slate-500">Track your application status in real-time</p>
            </div>

            {/* Search Box */}
            <div className="w-full max-w-sm relative mb-8">
              <input 
                type="text" 
                defaultValue="KWSC-2023-8891"
                className="w-full h-12 pl-4 pr-12 rounded-xl border-2 border-orange-200 bg-white text-sm font-bold text-slate-700 shadow-sm focus:outline-none"
              />
              <div className="absolute right-2 top-2 bottom-2 w-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <Search size={14} />
              </div>
            </div>

            {/* Tracking Result Card */}
            <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 shadow-lg shadow-orange-900/5 flex flex-col relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">NOC For Water Connection</div>
                  <div className="text-sm font-black text-slate-800">KWSC-2023-8891</div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                  In Progress
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-4 space-y-4 before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-orange-300 before:to-slate-200">
                
                {/* Step 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-emerald-500 text-slate-500 shadow shrink-0 absolute left-0 z-10"></div>
                  <div className="ml-8 text-[11px]">
                    <h4 className="font-bold text-slate-800">Application Submitted</h4>
                    <span className="text-[9px] text-slate-500">Oct 12, 10:00 AM • One Window Counter</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-emerald-500 text-slate-500 shadow shrink-0 absolute left-0 z-10"></div>
                  <div className="ml-8 text-[11px]">
                    <h4 className="font-bold text-slate-800">Initial Review</h4>
                    <span className="text-[9px] text-slate-500">Oct 13, 02:30 PM • Front Desk Officer</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-orange-400 shadow shrink-0 absolute left-0 z-10">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                  </div>
                  <div className="ml-8 text-[11px] bg-orange-50 p-2 rounded border border-orange-100">
                    <h4 className="font-bold text-orange-700">Zone East Verification</h4>
                    <span className="text-[9px] text-orange-600/70">Currently with Site Engineer</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-slate-200 shadow shrink-0 absolute left-0 z-10"></div>
                  <div className="ml-8 text-[11px] opacity-50">
                    <h4 className="font-bold text-slate-600">Final Approval</h4>
                    <span className="text-[9px] text-slate-400">Pending</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
          
          {/* Glare */}
          <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden z-50">
            <div className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-gradient-to-tr from-transparent via-white/40 to-transparent transform -rotate-45 animate-glare mix-blend-overlay"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
