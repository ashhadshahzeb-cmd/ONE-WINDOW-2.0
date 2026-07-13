import {
  TrendingUp,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  List
} from "lucide-react";
import { bankAccounts, transactions, monthlyData, formatCurrency } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const totalBalance = bankAccounts.reduce((s, b) => s + (b.currency === 'PKR' ? b.balance : b.balance * 280), 0);

const generateMockBreakdown = (amount: number, type: 'Income' | 'Expense', month: string) => {
  const pieces = type === 'Income' ? [0.4, 0.35, 0.25] : [0.5, 0.3, 0.2];
  const descriptions = type === 'Income' 
    ? ['Govt Grant / Subvention', 'Water Tax Collection', 'Misc. Receipts']
    : ['Contractor Payments', 'POL Bills', 'Employee Salaries'];
  
  return pieces.map((p, i) => ({
    id: i,
    date: `1${i + 2}-${month}-2024`,
    ref: `KWSC/${type === 'Income' ? 'INC' : 'EXP'}/${1000 + i}`,
    description: descriptions[i],
    amount: amount * p
  }));
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [selectedBarData, setSelectedBarData] = useState<{ month: string, type: 'Income' | 'Expense', amount: number, items: any[] } | null>(null);

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen w-full pb-20">
      <div className={cn("relative z-10 space-y-6 transition-all duration-1000", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f1115]/80 p-6 rounded-[28px] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="space-y-1">
            <h1 className="text-2xl font-black flex items-center gap-3 text-white tracking-tighter">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-sky-400" />
              </div>
              Financial Overview
            </h1>
            <p className="text-xs text-white/40 ml-14">
              Real-time metrics and dynamic tracking.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center">
              <span className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Total Balance</span>
              <span className="text-xl font-black text-white">Rs {formatCurrency(totalBalance)}</span>
            </div>
          </div>
        </div>

        {/* 2 COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* MAIN CHART - INCOME VS EXPENSES */}
          <Card className="border-white/10 bg-[#09090b]/50 backdrop-blur-md flex flex-col min-h-[400px]">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-sm font-black flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Cash Flow Analytics
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Income</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Expenses</span></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 w-full relative pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={8} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    cursor={{ fill: '#ffffff03' }}
                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                    formatter={(v: number) => [`Rs. ${formatCurrency(v)}`, '']}
                  />
                  <Bar 
                    dataKey="income" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={32} 
                    cursor="pointer"
                    onClick={(data) => {
                      if (data && data.month && data.income) {
                        setSelectedBarData({
                          month: data.month,
                          type: 'Income',
                          amount: data.income,
                          items: generateMockBreakdown(data.income, 'Income', data.month)
                        });
                      }
                    }}
                  />
                  <Bar 
                    dataKey="expenses" 
                    fill="#f97316" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={32} 
                    cursor="pointer"
                    onClick={(data) => {
                      if (data && data.month && data.expenses) {
                        setSelectedBarData({
                          month: data.month,
                          type: 'Expense',
                          amount: data.expenses,
                          items: generateMockBreakdown(data.expenses, 'Expense', data.month)
                        });
                      }
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ACCOUNTS (RIGHT COLUMN) */}
          <Card className="border-white/10 bg-[#09090b]/50 backdrop-blur-md flex flex-col min-h-[400px]">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-sm font-black flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  Active Bank Balances
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pt-6">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all cursor-default group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden relative">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundColor: bank.color }}></div>
                      <span className="font-bold text-xs relative z-10" style={{ color: bank.color }}>{bank.bankName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{bank.bankName}</p>
                      <p className="text-[10px] font-mono text-white/40 mt-0.5">{bank.maskedNumber}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold font-mono text-white tracking-tight">
                    {formatCurrency(bank.balance, bank.currency)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* NET FLOW (FULL WIDTH) */}
          <Card className="col-span-1 lg:col-span-2 border-white/10 bg-[#09090b]/50 backdrop-blur-md flex flex-col">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-sm font-black flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  Monthly Net Flow
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 w-full min-h-[300px] pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData.map(m => ({ ...m, net: m.income - m.expenses }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNetBento" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                    itemStyle={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}
                    formatter={(v: number) => [`Rs. ${formatCurrency(v)}`, 'Net']} 
                  />
                  <Area type="monotone" dataKey="net" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorNetBento)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* TRANSACTIONS TABLE (FULL WIDTH) */}
          <Card className="col-span-1 lg:col-span-2 border-white/10 bg-[#09090b]/50 backdrop-blur-md flex flex-col">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-sm font-black flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-rose-400" />
                  Recent Activity
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left pb-4 font-medium text-[10px] uppercase tracking-widest text-white/30">Date</th>
                    <th className="text-left pb-4 font-medium text-[10px] uppercase tracking-widest text-white/30">Transaction</th>
                    <th className="text-right pb-4 font-medium text-[10px] uppercase tracking-widest text-white/30">Amount</th>
                    <th className="text-center pb-4 font-medium text-[10px] uppercase tracking-widest text-white/30">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {transactions.slice(0, 5).map((t) => (
                    <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pr-4 font-mono text-xs text-white/50 whitespace-nowrap">{t.date}</td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border", 
                            t.type === 'credit' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20")}>
                            {t.type === 'credit' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-white/90 text-xs">{t.description}</p>
                            <p className="text-[10px] text-white/40 mt-0.5">{t.bankName}</p>
                          </div>
                        </div>
                      </td>
                      <td className={cn("py-4 pr-4 text-right font-mono font-bold tracking-tight", t.type === 'credit' ? "text-emerald-400" : "text-rose-400")}>
                        {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="py-4 text-center">
                        <span className={cn(
                          "text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border",
                          t.status === 'reconciled' && "bg-sky-500/10 text-sky-400 border-sky-500/20",
                          t.status === 'approved' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                          t.status === 'pending' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                        )}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>
      </div>

      <Dialog open={!!selectedBarData} onOpenChange={() => setSelectedBarData(null)}>
        <DialogContent className="max-w-2xl bg-[#09090b] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              {selectedBarData?.month} {selectedBarData?.type} Breakdown
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
              <span className="text-sm text-white/60 uppercase tracking-widest">Total {selectedBarData?.type}</span>
              <span className={cn("text-2xl font-bold", selectedBarData?.type === 'Income' ? 'text-blue-400' : 'text-orange-400')}>
                Rs. {selectedBarData?.amount ? formatCurrency(selectedBarData.amount) : '0'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-white/5 text-white/50 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                    <th className="px-4 py-3">Reference No</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBarData?.items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white/70">{item.date}</td>
                      <td className="px-4 py-3 font-mono text-white/50 text-xs">{item.ref}</td>
                      <td className="px-4 py-3 text-white/90">{item.description}</td>
                      <td className="px-4 py-3 text-right font-medium">Rs. {formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
