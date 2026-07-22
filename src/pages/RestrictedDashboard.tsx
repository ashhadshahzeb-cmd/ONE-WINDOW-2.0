import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, TrendingUp, DollarSign, Printer, Loader2, List, BarChart3, CheckCircle2, PieChart as PieChartIcon, Activity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const RestrictedDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dedicated Print Styles matching exactly the image layout
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .kwsc-table { width: 100%; border-collapse: collapse; border: 2px solid black; font-family: Arial, sans-serif; background: white; color: black; }
      .kwsc-table th, .kwsc-table td { border: 1px solid black; padding: 6px 4px; font-size: 10px; color: black; text-align: right; vertical-align: middle; }
      .kwsc-table th { background: white; font-weight: bold; text-align: center; }
      .kwsc-table thead tr:first-child th { font-size: 11px; }
      .kwsc-table .col-numbers th { font-size: 9px; background: #eaeaea; padding: 3px; text-align: center; }
      .crosshatch { background: url('data:image/svg+xml;utf8,<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 L10,10 M10,0 L0,10" stroke="black" stroke-width="0.5"/></svg>'); border-left: 2px solid black; border-right: 2px solid black; width: 12px; padding: 0; }
      
      @media print {
        @page { size: landscape; margin: 10mm; }
        body * { visibility: hidden !important; background: white !important; color: black !important; }
        #printable-section, #printable-section * { visibility: visible !important; }
        #printable-section {
          position: absolute !important; left: 0 !important; top: 0 !important;
          width: 100% !important; display: block !important;
          background: white !important; color: black !important;
          padding: 5mm !important;
        }
        .kwsc-table th, .kwsc-table td { font-size: 7.5pt !important; padding: 3px !important; }
        .kwsc-table thead tr:first-child th { font-size: 9pt !important; }
        .kwsc-table .col-numbers th { font-size: 7pt !important; }
        .hide-on-print { display: none !important; }
      }

    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchRecords();
  }, [isAuthenticated]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('daily_collections').select('*').order('entry_date', { ascending: false });
      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "kwsc@786") {
      setIsAuthenticated(true);
      toast.success("Welcome back, Cloud Data Ready");
    } else {
      toast.error("Invalid Access Key");
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2 }).format(val);

  const getMonthlyData = () => {
    const monthlyMap = new Map();
    records.forEach(rec => {
      const month = rec.month || 'Unknown';
      if (!monthlyMap.has(month)) monthlyMap.set(month, { month, wsc: 0, wscc: 0, iacc: 0, wtr: 0, isbc: 0, ccc: 0, asug: 0, cssw: 0 });
      const m = monthlyMap.get(month);
      m.wsc += (rec.wsc || 0); m.wscc += (rec.wscc || 0); m.iacc += (rec.iacc || 0);
      m.wtr += (rec.wtr || 0); m.isbc += (rec.isbc || 0); m.ccc += (rec.ccc || 0);
      m.asug += (rec.asug || 0); m.cssw += (rec.cssw || 0);
    });
    return Array.from(monthlyMap.values());
  };

  const totals = records.reduce((acc, curr) => ({
    wsc: acc.wsc + (curr.wsc || 0), wscc: acc.wscc + (curr.wscc || 0), iacc: acc.iacc + (curr.iacc || 0),
    total_rrg: acc.total_rrg + ((curr.wsc || 0) + (curr.iacc || 0)),
    wtr: acc.wtr + (curr.wtr || 0), isbc: acc.isbc + (curr.isbc || 0), ccc: acc.ccc + (curr.ccc || 0),
    asug: acc.asug + (curr.asug || 0), cssw: acc.cssw + (curr.cssw || 0),
    total_others: acc.total_others + ((curr.wtr || 0) + (curr.isbc || 0) + (curr.ccc || 0) + (curr.asug || 0) + (curr.cssw || 0)),
    grand_total: acc.grand_total + ((curr.wsc || 0) + (curr.iacc || 0) + (curr.wtr || 0) + (curr.isbc || 0) + (curr.ccc || 0) + (curr.asug || 0) + (curr.cssw || 0) + (curr.wscc || 0))
  }), { wsc: 0, wscc: 0, iacc: 0, total_rrg: 0, wtr: 0, isbc: 0, ccc: 0, asug: 0, cssw: 0, total_others: 0, grand_total: 0 });

  if (!isAuthenticated) {
    return (
      <div className="h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/10 bg-[#09090b]/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-500" />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-sky-500/10 flex items-center justify-center mb-6 border border-sky-500/20 shadow-inner">
              <Lock className="w-10 h-10 text-sky-500" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white uppercase">Finance Restricted</CardTitle>
            <p className="text-muted-foreground text-sm mt-2 font-medium tracking-wide">Enter secure key for cloud synchronization.</p>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border-white/10 h-12 text-center text-xl tracking-[0.5em] focus:border-sky-500/50 transition-all" />
              <Button type="submit" className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-white font-black text-lg shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                AUTHENTICATE
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-widest">Live Cloud Data</div>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Sync Secure</span>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Restricted Dashboard</h1>
          <p className="text-muted-foreground text-sm font-medium italic mt-1">KW&SC Finance Department - Official Daily Statement</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 h-11" onClick={fetchRecords} disabled={isLoading}>
            <Loader2 className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button className="bg-white text-black hover:bg-white/90 h-11 font-bold px-6 shadow-xl" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      {/* ANALYTICS CHARTS (Replacing Stats Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-[#09090b]/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-white/5 bg-white/[0.02] p-4">
            <CardTitle className="text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2 text-indigo-400">
              <BarChart3 className="w-4 h-4" /> Monthly Collection Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMonthlyData()} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', borderRadius: '8px' }}
                  formatter={(value: number) => [`Rs. ${formatCurrency(value)}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="wsc" name="W&S" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="iacc" name="Arrears" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wtr" name="Tanker" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#09090b]/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-white/5 bg-white/[0.02] p-4">
            <CardTitle className="text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2 text-emerald-400">
              <Activity className="w-4 h-4" /> Daily Trend (W&S Collection)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...records].reverse()} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWsc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="entry_date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', borderRadius: '8px' }}
                  labelStyle={{ color: '#888' }}
                  formatter={(value: number) => [`Rs. ${formatCurrency(value)}`, 'W&S Collection']}
                />
                <Area type="monotone" dataKey="wsc" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorWsc)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT AREA - SECOND IMAGE DESIGN */}
      <div id="printable-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center hide-on-print">
           <h2 className="text-sky-500 text-sm font-black tracking-[0.2em] uppercase mb-2">Recorded Collection Statement</h2>
        </div>

        {/* MONTHLY SUMMARY CARD */}
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl p-4 sm:p-6 overflow-x-auto">
          <div style={{textAlign: 'center', textDecoration: 'underline', marginBottom: '15px', fontSize: '13pt', fontWeight: 'bold', color: 'black'}}>
            DAILY COLLECTION STATEMENT W.E.F. {records.length > 0 ? records[records.length-1].entry_date : ''} TO {records.length > 0 ? records[0].entry_date : ''}
          </div>
          
          <table className="kwsc-table min-w-[1000px]">
            <thead>
              <tr>
                <th rowSpan={2} style={{width: '6%'}}>MONTH &<br/>YEAR</th>
                <th colSpan={4}>COLLECTION UNDER RRG</th>
                <th rowSpan={3} className="crosshatch"></th>
                <th colSpan={6}>KW&SC OTHER COLLECTIONS</th>
                <th rowSpan={2} style={{width: '8%'}}>Total KW&SC<br/>Collection<br/>( 05+11 )</th>
              </tr>
              <tr>
                <th>WATER &<br/>SEWERAGE<br/>COLLECTION</th>
                <th style={{fontSize: '8px'}}>WATER &<br/>SEWERAGE<br/>CONNECTION<br/>CHARGES<br/><span style={{fontSize: '7px'}}>(ABL CIVIC CENTRE BR.)</span></th>
                <th>INDUSTRIES<br/>ARREAR<br/>COLLECTION<br/>CHARGES</th>
                <th>TOTAL<br/>( 02+04 )</th>
                <th style={{fontSize: '8px'}}>WATER TANKER<br/>RECEIPTS</th>
                <th style={{fontSize: '8px'}}>INFRA STRUCTURE<br/>BETTERMENT<br/>CHARGES ( SINDH<br/>BANK )</th>
                <th style={{fontSize: '8px'}}>COLLECTION OF<br/>COMMERCIALIZATIO<br/>N CHARGES<br/><span style={{fontSize: '7px'}}>(ABL CIVIC CENTRE BR.)</span></th>
                <th style={{fontSize: '8px'}}>AUCTION OF SCRAP<br/>UNSERVICEABLE<br/>GOODS <span style={{fontSize: '7px'}}>(NBP<br/>GULSHAN-E-IQBAL BR.)</span></th>
                <th>COLLECTION<br/>OF SUB SOIL<br/>WATER</th>
                <th>TOTAL OTHERS<br/>( 06 TO 10 )</th>
              </tr>
              <tr className="col-numbers">
                <th>01</th>
                <th>02</th>
                <th>03</th>
                <th>04</th>
                <th>05</th>
                <th>06</th>
                <th>07</th>
                <th>08</th>
                <th>09</th>
                <th>10</th>
                <th>11</th>
                <th>12</th>
              </tr>
            </thead>
            <tbody>
              {getMonthlyData().map((row: any, i: number) => (
                <tr key={i}>
                  <td style={{textAlign: 'center', fontWeight: 'bold'}}>{row.month.toUpperCase()}</td>
                  <td>{formatCurrency(row.wsc)}</td>
                  <td>{formatCurrency(row.wscc)}</td>
                  <td>{formatCurrency(row.iacc)}</td>
                  <td style={{fontWeight: 'bold'}}>{formatCurrency((row.wsc||0)+(row.wscc||0)+(row.iacc||0))}</td>
                  <td>{formatCurrency(row.wtr)}</td>
                  <td>{formatCurrency(row.isbc)}</td>
                  <td>{formatCurrency(row.ccc)}</td>
                  <td>{formatCurrency(row.asug)}</td>
                  <td>{formatCurrency(row.cssw)}</td>
                  <td style={{fontWeight: 'bold'}}>{formatCurrency((row.wtr||0)+(row.isbc||0)+(row.ccc||0)+(row.asug||0)+(row.cssw||0))}</td>
                  <td style={{fontWeight: 'bold'}}>{formatCurrency((row.wsc||0)+(row.wscc||0)+(row.iacc||0)+(row.wtr||0)+(row.isbc||0)+(row.ccc||0)+(row.asug||0)+(row.cssw||0))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{fontWeight: 'bold'}}>
                <td style={{textAlign: 'center'}}>TOTAL</td>
                <td>{formatCurrency(totals.wsc)}</td>
                <td>{formatCurrency(totals.wscc)}</td>
                <td>{formatCurrency(totals.iacc)}</td>
                <td>{formatCurrency(totals.total_rrg + totals.wscc)}</td>
                <td>{formatCurrency(totals.wtr)}</td>
                <td>{formatCurrency(totals.isbc)}</td>
                <td>{formatCurrency(totals.ccc)}</td>
                <td>{formatCurrency(totals.asug)}</td>
                <td>{formatCurrency(totals.cssw)}</td>
                <td>{formatCurrency(totals.total_others)}</td>
                <td>{formatCurrency(totals.grand_total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* DAILY SUMMARY CARD */}
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl p-4 sm:p-6 overflow-x-auto">
          <div style={{textAlign: 'center', textDecoration: 'underline', marginBottom: '15px', fontSize: '13pt', fontWeight: 'bold', color: 'black'}}>
            COLLECTION AS ON &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {records.length > 0 ? records[0].entry_date : ''}
          </div>
          
          <table className="kwsc-table min-w-[1000px]">
            <thead>
              <tr>
                <th rowSpan={2} style={{width: '6%'}}>DATE</th>
                <th colSpan={4}>COLLECTION UNDER RRG</th>
                <th rowSpan={3} className="crosshatch"></th>
                <th colSpan={6}>KW&SC OTHER COLLECTIONS</th>
                <th rowSpan={2} style={{width: '8%'}}>Total KW&SC<br/>Collection<br/>( 05+11 )</th>
              </tr>
              <tr>
                <th>WATER &<br/>SEWERAGE<br/>COLLECTION</th>
                <th style={{fontSize: '8px'}}>WATER &<br/>SEWERAGE<br/>CONNECTION<br/>CHARGES<br/><span style={{fontSize: '7px'}}>(ABL CIVIC CENTRE BR.)</span></th>
                <th>INDUSTRIES<br/>ARREAR<br/>COLLECTION<br/>CHARGES</th>
                <th>TOTAL<br/>( 02+04 )</th>
                <th style={{fontSize: '8px'}}>WATER TANKER<br/>RECEIPTS</th>
                <th style={{fontSize: '8px'}}>INFRA STRUCTURE<br/>BETTERMENT<br/>CHARGES ( SINDH<br/>BANK )</th>
                <th style={{fontSize: '8px'}}>COLLECTION OF<br/>COMMERCIALIZATIO<br/>N CHARGES<br/><span style={{fontSize: '7px'}}>(ABL CIVIC CENTRE BR.)</span></th>
                <th style={{fontSize: '8px'}}>AUCTION OF SCRAP<br/>UNSERVICEABLE<br/>GOODS <span style={{fontSize: '7px'}}>(NBP<br/>GULSHAN-E-IQBAL BR.)</span></th>
                <th>COLLECTION<br/>OF SUB SOIL<br/>WATER</th>
                <th>TOTAL OTHERS<br/>( 06 TO 10 )</th>
              </tr>
              <tr className="col-numbers">
                <th>01</th>
                <th>02</th>
                <th>03</th>
                <th>04</th>
                <th>05</th>
                <th>06</th>
                <th>07</th>
                <th>08</th>
                <th>09</th>
                <th>10</th>
                <th>11</th>
                <th>12</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec: any, idx: number) => (
                <tr key={idx}>
                  <td style={{textAlign: 'center', fontWeight: 'bold'}}>{rec.entry_date}</td>
                  <td>{formatCurrency(rec.wsc)}</td>
                  <td>{formatCurrency(rec.wscc)}</td>
                  <td>{formatCurrency(rec.iacc)}</td>
                  <td style={{fontWeight: 'bold'}}>{formatCurrency((rec.wsc||0)+(rec.wscc||0)+(rec.iacc||0))}</td>
                  <td>{formatCurrency(rec.wtr)}</td>
                  <td>{formatCurrency(rec.isbc)}</td>
                  <td>{formatCurrency(rec.ccc)}</td>
                  <td>{formatCurrency(rec.asug)}</td>
                  <td>{formatCurrency(rec.cssw)}</td>
                  <td style={{fontWeight: 'bold'}}>{formatCurrency((rec.wtr||0)+(rec.isbc||0)+(rec.ccc||0)+(rec.asug||0)+(rec.cssw||0))}</td>
                  <td style={{fontWeight: 'bold'}}>{formatCurrency((rec.wsc||0)+(rec.wscc||0)+(rec.iacc||0)+(rec.wtr||0)+(rec.isbc||0)+(rec.ccc||0)+(rec.asug||0)+(rec.cssw||0))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{fontWeight: 'bold'}}>
                <td style={{textAlign: 'center'}}>TOTAL</td>
                <td>{formatCurrency(totals.wsc)}</td>
                <td>{formatCurrency(totals.wscc)}</td>
                <td>{formatCurrency(totals.iacc)}</td>
                <td>{formatCurrency(totals.total_rrg + totals.wscc)}</td>
                <td>{formatCurrency(totals.wtr)}</td>
                <td>{formatCurrency(totals.isbc)}</td>
                <td>{formatCurrency(totals.ccc)}</td>
                <td>{formatCurrency(totals.asug)}</td>
                <td>{formatCurrency(totals.cssw)}</td>
                <td>{formatCurrency(totals.total_others)}</td>
                <td>{formatCurrency(totals.grand_total)}</td>
              </tr>
            </tfoot>
          </table>
          <div style={{fontSize: '9pt', marginTop: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'black'}}>
            <span style={{fontSize: '12pt', marginRight: '5px'}}>☆</span> <span><span style={{textDecoration: 'underline'}}>Note:</span> Report prepared on the basis of Telephonic Bank balances.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestrictedDashboard;
