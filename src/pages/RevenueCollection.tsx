import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Phone, Globe, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

export default function RevenueCollection({ embedded = false }: { embedded?: boolean }) {
  const [dataLeft, setDataLeft] = useState<any[]>([]);
  const [dataRight, setDataRight] = useState<any[]>([]);
  const [totals, setTotals] = useState({ current: 0, prev: 0, diff: 0, var: 0 });
  const [loading, setLoading] = useState(true);
  const [fyLabels, setFyLabels] = useState({ current: 'FY 2025-26', prev: 'FY 2024-25' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('transfer_advices').select('date, total_amount');
      if (error) throw error;

      // Grouping structure
      const monthlyData = {
        Jul: { prev: 0, current: 0 }, Aug: { prev: 0, current: 0 }, Sep: { prev: 0, current: 0 },
        Oct: { prev: 0, current: 0 }, Nov: { prev: 0, current: 0 }, Dec: { prev: 0, current: 0 },
        Jan: { prev: 0, current: 0 }, Feb: { prev: 0, current: 0 }, Mar: { prev: 0, current: 0 },
        Apr: { prev: 0, current: 0 }, May: { prev: 0, current: 0 }, June: { prev: 0, current: 0 },
      };

      // Helper to get FY from date string YYYY-MM-DD
      const getFY = (year: number, month: number) => {
        // month is 0-indexed (0=Jan, 6=Jul)
        if (month >= 6) return year;
        return year - 1;
      };

      // 1. Find the latest Fiscal Year in the dataset
      let maxFYYear = 2025; // fallback
      data?.forEach((record) => {
        if (!record.date) return;
        const dateObj = new Date(record.date);
        const fy = getFY(dateObj.getFullYear(), dateObj.getMonth());
        if (fy > maxFYYear) maxFYYear = fy;
      });

      const currentFYLabel = `FY ${maxFYYear}-${(maxFYYear + 1).toString().slice(-2)}`;
      const prevFYLabel = `FY ${maxFYYear - 1}-${maxFYYear.toString().slice(-2)}`;
      setFyLabels({ current: currentFYLabel, prev: prevFYLabel });

      let grandPrev = 0;
      let grandCurrent = 0;

      data?.forEach((record) => {
        if (!record.date || !record.total_amount) return;
        
        const dateObj = new Date(record.date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[month];
        
        const amountInMillions = Number(record.total_amount) / 1000000;
        const fy = getFY(year, month);

        if (fy === maxFYYear) {
          grandCurrent += amountInMillions;
          if (monthlyData[monthName as keyof typeof monthlyData]) {
            monthlyData[monthName as keyof typeof monthlyData].current += amountInMillions;
          }
        } else if (fy === maxFYYear - 1) {
          grandPrev += amountInMillions;
          if (monthlyData[monthName as keyof typeof monthlyData]) {
            monthlyData[monthName as keyof typeof monthlyData].prev += amountInMillions;
          }
        }
      });

      const processData = (months: string[]) => {
        return months.map(m => {
          const d = monthlyData[m as keyof typeof monthlyData];
          const diff = d.current - d.prev;
          let variance = 0;
          if (d.prev > 0) {
            variance = (diff / d.prev) * 100;
          } else if (d.current > 0) {
            variance = 100;
          }

          return {
            month: m,
            fyCurrent: d.current.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            fyPrev: d.prev.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            diff: diff.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            var: variance > 0 ? `+${variance.toFixed(1)}%` : `${variance.toFixed(1)}%`,
            isPositive: variance >= 0
          };
        });
      };

      setDataLeft(processData(['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']));
      setDataRight(processData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June']));

      const totalDiff = grandCurrent - grandPrev;
      let totalVar = 0;
      if (grandPrev > 0) {
        totalVar = (totalDiff / grandPrev) * 100;
      } else if (grandCurrent > 0) {
        totalVar = 100;
      }

      setTotals({
        current: grandCurrent,
        prev: grandPrev,
        diff: totalDiff,
        var: totalVar
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const TableHeader = () => (
    <div className="flex items-center text-[10px] sm:text-xs font-bold text-slate-800 border-b border-slate-200 pb-2 mb-2 w-full">
      <div className="w-[45%] flex items-center space-x-2">
        <div className="flex flex-col border-l-[3px] border-[#273D81] pl-2 leading-tight">
          <span className="text-[#273D81]">{fyLabels.current}</span>
          <span className="text-slate-500">{fyLabels.prev}</span>
        </div>
        <span className="text-[9px] text-slate-400 leading-none mt-2">(PKR. Million)</span>
      </div>
      <div className="w-[25%] text-center">Difference</div>
      <div className="w-[30%] text-right pr-2">%Variance</div>
    </div>
  );

  const TableRow = ({ row }: { row: any }) => (
    <div className="flex items-center py-3 sm:py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors w-full">
      <div className="flex items-center w-[20%]">
        <div className="bg-[#EAEFFD] p-2 rounded-lg flex-shrink-0">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A64B2]" />
        </div>
        <span className="ml-2 sm:ml-3 font-bold text-slate-800 text-sm sm:text-base">{row.month}</span>
      </div>

      <div className="w-[25%] flex flex-col justify-center">
        <span className="font-semibold text-slate-700 text-sm sm:text-base leading-tight">{row.fyCurrent}</span>
        <span className="text-slate-400 text-xs sm:text-sm leading-tight">{row.fyPrev}</span>
      </div>

      <div className="w-[25%] text-center font-medium text-slate-600 text-sm sm:text-base">
        {row.diff}
      </div>

      <div className="w-[30%] flex justify-end items-center pr-2">
        <span className={`${row.isPositive ? 'text-emerald-500' : 'text-rose-500'} font-bold text-sm sm:text-base flex items-center`}>
          <span className="text-[10px] mr-1">{row.isPositive ? '▲' : '▼'}</span> {row.var}
        </span>
      </div>
    </div>
  );

  const containerClasses = embedded 
    ? "w-full font-sans mb-8" 
    : "min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans";

  return (
    <div className={containerClasses}>
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden relative border border-slate-100">
        
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#F3F6FF] to-transparent pointer-events-none opacity-50" />

        <div className="p-8 sm:p-12 relative z-10">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-16 h-16 rounded-full bg-[#273D81] flex items-center justify-center text-white border-4 border-[#EAEFFD] shadow-sm">
                <span className="font-black text-xl">KWSC</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 leading-tight">Karachi Water &</span>
                <span className="text-xl font-bold text-slate-900 leading-tight">Sewerage Corporation</span>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-[#273D81] rounded-full p-2 mr-3 text-white">
                <Phone className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#273D81] uppercase tracking-wider leading-none">Helpline</span>
                <span className="text-2xl font-black text-[#273D81] leading-none">NUMBER 1334</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-10 space-y-2">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#5B75C7] tracking-tight">REVENUE COLLECTION</h2>
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-black text-black tracking-tighter leading-none">
              RISES {totals.var > 0 ? totals.var.toFixed(1) : 0}%
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 tracking-wide mt-4">IN {fyLabels.current} COMPARED TO {fyLabels.prev}</p>
            <div className="w-full max-w-4xl mx-auto h-[2px] bg-slate-200 mt-6" />
          </div>

          <div className="text-center max-w-4xl mx-auto mb-12">
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-medium">
              KWSC generated Rs{totals.current.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1})} million in revenue during {fyLabels.current}, compared to Rs{totals.prev.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1})} million in {fyLabels.prev}, an increase of Rs{totals.diff.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1})} million, reflecting a {totals.var > 0 ? totals.var.toFixed(1) : 0}% year-on-year growth in revenue collection.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-12 h-12 text-[#273D81] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Card className="shadow-none border border-slate-100 bg-white">
                <CardContent className="p-4 sm:p-6">
                  <TableHeader />
                  <div className="flex flex-col">
                    {dataLeft.map((row, i) => <TableRow key={i} row={row} />)}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border border-slate-100 bg-white">
                <CardContent className="p-4 sm:p-6">
                  <TableHeader />
                  <div className="flex flex-col">
                    {dataRight.map((row, i) => <TableRow key={i} row={row} />)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="bg-[#EAEFFD] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between border border-[#D5E0FA] mb-12">
            
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="bg-[#273D81] p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Revenue Collection</h3>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-8">
              <div className="flex flex-col items-end pr-4 sm:pr-8 border-r border-slate-300">
                <div className="flex items-center justify-between w-full min-w-[150px] sm:min-w-[200px]">
                  <span className="text-slate-600 font-semibold mr-4 text-sm sm:text-base">{fyLabels.current}</span>
                  <span className="text-[#273D81] font-bold text-lg sm:text-xl">{totals.current.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex items-center justify-between w-full min-w-[150px] sm:min-w-[200px] mt-1">
                  <span className="text-slate-500 font-medium mr-4 text-sm sm:text-base">{fyLabels.prev}</span>
                  <span className="text-slate-500 font-medium text-base sm:text-lg">{totals.prev.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>

              <div className="flex items-center">
                <span className={`${totals.var >= 0 ? 'text-emerald-500' : 'text-rose-500'} font-black text-xl sm:text-2xl flex items-center`}>
                  <span className="text-base sm:text-lg mr-2">{totals.var >= 0 ? '▲' : '▼'}</span> {totals.var > 0 ? `+${totals.var.toFixed(1)}` : totals.var.toFixed(1)}%
                </span>
              </div>
            </div>

          </div>

          <p className="text-center text-slate-600 text-sm sm:text-lg max-w-4xl mx-auto mb-12 font-medium leading-relaxed">
            The increase of Rs{totals.diff.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1})} million demonstrates sustained improvement in revenue collection during {fyLabels.current}, reinforcing KWSC's commitment to financial sustainability and enhanced service delivery.
          </p>

          <div className="bg-[#273D81] rounded-full py-3 sm:py-4 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-white w-max mx-auto shadow-lg">
            <div className="flex items-center font-semibold text-sm sm:text-lg tracking-wide border-b sm:border-b-0 sm:border-r border-white/30 pb-2 sm:pb-0 sm:pr-4">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              www.kwsc.gos.pk
            </div>
            <div className="flex items-center space-x-2 pl-2">
              <span className="font-bold text-sm sm:text-lg tracking-wide">KWSCOfficial</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
