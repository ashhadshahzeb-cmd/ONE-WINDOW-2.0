import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Lock, 
  Plus, 
  Trash2, 
  Calculator,
  Calendar,
  RefreshCw,
  Loader2,
  CalendarDays
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CollectionRecord {
  id: string;
  month: string;
  entry_date: string;
  wsc: number;
  wscc: number;
  iacc: number;
  wtr: number;
  isbc: number;
  ccc: number;
  asug: number;
  cssw: number;
}

const CollectionEntry = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    month: "",
    entry_date: new Date().toISOString().split('T')[0],
    wsc: "",
    wscc: "",
    iacc: "",
    wtr: "",
    isbc: "",
    ccc: "",
    asug: "",
    cssw: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
  }, [isAuthenticated]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_collections')
        .select('*')
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      console.error("Error fetching from Supabase:", error.message);
      const saved = localStorage.getItem('collection_records');
      if (saved) setRecords(JSON.parse(saved));
      toast.error("Using local data. Database sync failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "kwsc@786") {
      setIsAuthenticated(true);
      toast.success("Access Granted");
    } else {
      toast.error("Incorrect Password");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addRecord = async () => {
    if (!formData.month || !formData.entry_date) {
      toast.error("Please enter Month and Date");
      return;
    }

    setIsSaving(true);
    const newEntry = {
      month: formData.month,
      entry_date: formData.entry_date,
      wsc: parseFloat(formData.wsc) || 0,
      wscc: parseFloat(formData.wscc) || 0,
      iacc: parseFloat(formData.iacc) || 0,
      wtr: parseFloat(formData.wtr) || 0,
      isbc: parseFloat(formData.isbc) || 0,
      ccc: parseFloat(formData.ccc) || 0,
      asug: parseFloat(formData.asug) || 0,
      cssw: parseFloat(formData.cssw) || 0,
    };

    try {
      const { data, error } = await supabase
        .from('daily_collections')
        .insert([newEntry])
        .select();

      if (error) throw error;

      if (data) {
        setRecords(prev => [data[0] as CollectionRecord, ...prev]);
        toast.success(`Record for ${formData.entry_date} saved to Cloud`);
      }

      setFormData({
        ...formData, wsc: "", wscc: "", iacc: "", wtr: "", isbc: "", ccc: "", asug: "", cssw: "",
      });
    } catch (error: any) {
      console.error("Error saving:", error.message);
      toast.error("Database error. Retrying locally...");
      const localEntry = { ...newEntry, id: Date.now().toString() };
      setRecords(prev => [localEntry as CollectionRecord, ...prev]);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('daily_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.info("Entry deleted");
    } catch (error: any) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2 }).format(val);
  };

  const calculateTotals = () => {
    return records.reduce((acc, curr) => ({
      wsc: acc.wsc + curr.wsc,
      wscc: acc.wscc + curr.wscc,
      iacc: acc.iacc + curr.iacc,
      total_rrg: acc.total_rrg + (curr.wsc + curr.iacc),
      wtr: acc.wtr + curr.wtr,
      isbc: acc.isbc + curr.isbc,
      ccc: acc.ccc + curr.ccc,
      asug: acc.asug + curr.asug,
      cssw: acc.cssw + curr.cssw,
      total_others: acc.total_others + (curr.wtr + curr.isbc + curr.ccc + curr.asug + curr.cssw),
      grand_total: acc.grand_total + (curr.wsc + curr.iacc + curr.wtr + curr.isbc + curr.ccc + curr.asug + curr.cssw + curr.wscc)
    }), {
      wsc: 0, wscc: 0, iacc: 0, total_rrg: 0, wtr: 0, isbc: 0, ccc: 0, asug: 0, cssw: 0, total_others: 0, grand_total: 0
    });
  };

  const totals = calculateTotals();

  if (!isAuthenticated) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md border-[#0ea5e9]/20 bg-[#09090b]/50 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-[#0ea5e9]" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Financial Access</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Enter admin password to manage entries.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/10" />
              <Button type="submit" className="w-full bg-[#0ea5e9] text-white font-bold">Unlock</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-emerald-500" />
            </div>
            Entry Management
          </h1>
          <p className="text-muted-foreground mt-1 italic font-medium">Daily Statement Recording System</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5" onClick={fetchRecords} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-[#09090b]/40 backdrop-blur-md">
        <CardHeader className="bg-white/[0.02] border-b border-white/5 py-3">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-[#0ea5e9]">
            <CalendarDays className="w-4 h-4" />
            New Entry Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">01 - Month & Year</label>
              <Input name="month" value={formData.month} onChange={handleInputChange} placeholder="JUL 2025" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">01 - Entry Date</label>
              <Input type="date" name="entry_date" value={formData.entry_date} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">02 - Water & Sewerage</label>
              <Input type="number" name="wsc" value={formData.wsc} onChange={handleInputChange} placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">03 - Connection Charges</label>
              <Input type="number" name="wscc" value={formData.wscc} onChange={handleInputChange} placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">04 - Industries Arrear</label>
              <Input type="number" name="iacc" value={formData.iacc} onChange={handleInputChange} placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">06 - Water Tanker Receipts</label>
              <Input type="number" name="wtr" value={formData.wtr} onChange={handleInputChange} placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">07 - Infra Betterment</label>
              <Input type="number" name="isbc" value={formData.isbc} onChange={handleInputChange} placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">08 - Commercialization</label>
              <Input type="number" name="ccc" value={formData.ccc} onChange={handleInputChange} placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">09 - Auction Scrap Goods</label>
              <Input type="number" name="asug" value={formData.asug} onChange={handleInputChange} placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">10 - Sub Soil Water</label>
              <Input type="number" name="cssw" value={formData.cssw} onChange={handleInputChange} placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="flex items-end lg:col-span-2">
              <Button onClick={addRecord} disabled={isSaving} className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-bold h-10">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Save Collection Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#09090b]/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="bg-white/[0.03] border-b border-white/10 p-4 text-center">
          <h2 className="text-xs font-black tracking-[0.2em] uppercase text-[#0ea5e9]">RECORDED COLLECTION STATEMENT</h2>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-[#0ea5e9]" />
              <p>Fetching cloud data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* TABLE 1: MONTHLY SUMMARY */}
              <div className="bg-white rounded-xl shadow p-4 overflow-x-auto relative">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-black underline decoration-2 underline-offset-4 uppercase">DAILY COLLECTION STATEMENT W.E.F. TO</h3>
                </div>
                <table className="w-full border-collapse border border-black text-black">
                  <thead>
                    <tr>
                      <th rowSpan={2} className="border border-black p-1 text-[10px] text-center align-middle font-bold w-16">MONTH &<br/>YEAR</th>
                      <th colSpan={4} className="border border-black p-1 text-[10px] text-center align-middle font-bold">COLLECTION UNDER RRG</th>
                      <th colSpan={6} className="border border-black p-1 text-[10px] text-center align-middle font-bold">KW&SC OTHER COLLECTIONS</th>
                      <th rowSpan={2} className="border border-black p-1 text-[10px] text-center align-middle font-bold w-20">Total<br/>KW&SC<br/>Collection<br/>( 05+11 )</th>
                    </tr>
                    <tr>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-16 leading-tight">WATER &<br/>SEWERAGE<br/>COLLECTION</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">WATER &<br/>SEWERAGE<br/>CONNECTION<br/>CHARGES<br/><span className="text-[6px] font-normal">(ABL CIVIC CENTRE BR.)</span></th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">INDUSTRIES<br/>ARREAR<br/>COLLECTION<br/>CHARGES</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-16 leading-tight">TOTAL<br/>( 02+04 )</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-16 leading-tight">WATER<br/>TANKER<br/>RECEIPTS</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">INFRA<br/>STRUCTURE<br/>BETTERMENT<br/>CHARGES<br/><span className="text-[6px] font-normal">( SINDH BANK )</span></th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">COLLECTION OF<br/>COMMERCIALIZATIO<br/>N CHARGES<br/><span className="text-[6px] font-normal">(ABL CIVIC CENTRE BR.)</span></th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">AUCTION OF<br/>SCRAP<br/>UNSERVICEABLE<br/>GOODS<br/><span className="text-[6px] font-normal">(NBP GULSHAN-E-IQBAL BR.)</span></th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">COLLECTION<br/>OF SUB SOIL<br/>WATER</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-16 leading-tight">TOTAL<br/>OTHERS<br/>( 06 TO 10 )</th>
                    </tr>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">01</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">02</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">03</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">04</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">05</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">06</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">07</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">08</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">09</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">10</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">11</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">12</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Live Preview for Monthly Total (if month is entered) */}
                    {formData.month && (
                      <tr className="bg-gray-100 italic opacity-80">
                        <td className="border border-black p-1 text-[10px] text-center font-bold text-black">
                          {formData.month} <br/><span className="text-[7px] font-normal text-black">(Preview)</span>
                        </td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.wsc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.wscc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.iacc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold text-black">{formatCurrency((parseFloat(formData.wsc) || 0) + (parseFloat(formData.iacc) || 0))}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.wtr) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.isbc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.ccc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.asug) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.cssw) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold text-black">
                          {formatCurrency((parseFloat(formData.wtr) || 0) + (parseFloat(formData.isbc) || 0) + (parseFloat(formData.ccc) || 0) + (parseFloat(formData.asug) || 0) + (parseFloat(formData.cssw) || 0))}
                        </td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold text-black">
                          {formatCurrency((parseFloat(formData.wsc) || 0) + (parseFloat(formData.iacc) || 0) + (parseFloat(formData.wtr) || 0) + (parseFloat(formData.isbc) || 0) + (parseFloat(formData.ccc) || 0) + (parseFloat(formData.asug) || 0) + (parseFloat(formData.cssw) || 0) + (parseFloat(formData.wscc) || 0))}
                        </td>
                      </tr>
                    )}
                    
                    {/* Monthly Aggregation */}
                    {Object.entries(
                      records.reduce((acc: any, row) => {
                        if (!acc[row.month]) acc[row.month] = { wsc: 0, wscc: 0, iacc: 0, wtr: 0, isbc: 0, ccc: 0, asug: 0, cssw: 0 };
                        acc[row.month].wsc += row.wsc || 0;
                        acc[row.month].wscc += row.wscc || 0;
                        acc[row.month].iacc += row.iacc || 0;
                        acc[row.month].wtr += row.wtr || 0;
                        acc[row.month].isbc += row.isbc || 0;
                        acc[row.month].ccc += row.ccc || 0;
                        acc[row.month].asug += row.asug || 0;
                        acc[row.month].cssw += row.cssw || 0;
                        return acc;
                      }, {})
                    ).map(([month, sums]: [string, any]) => (
                      <tr key={month}>
                        <td className="border border-black p-1 text-[10px] text-center font-bold">{month}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(sums.wsc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(sums.wscc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(sums.iacc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold">{formatCurrency(sums.wsc + sums.iacc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(sums.wtr)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(sums.isbc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(sums.ccc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(sums.asug)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(sums.cssw)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold">{formatCurrency(sums.wtr + sums.isbc + sums.ccc + sums.asug + sums.cssw)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold">{formatCurrency(sums.wsc + sums.iacc + sums.wtr + sums.isbc + sums.ccc + sums.asug + sums.cssw + sums.wscc)}</td>
                      </tr>
                    ))}
                    
                    {records.length > 0 && (
                      <tr className="font-bold bg-gray-50">
                        <td className="border border-black p-1 text-[10px] text-center">TOTAL</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.wsc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.wscc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.iacc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.total_rrg)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.wtr)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.isbc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.ccc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.asug)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.cssw)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.total_others)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(totals.grand_total)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE 2: DAILY RECORDS */}
              <div className="bg-white rounded-xl shadow p-4 overflow-x-auto relative mt-8">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-black underline decoration-2 underline-offset-4 uppercase">COLLECTION AS ON</h3>
                </div>
                <table className="w-full border-collapse border border-black text-black">
                  <thead>
                    <tr>
                      <th rowSpan={2} className="border border-black p-1 text-[10px] text-center align-middle font-bold w-8">ACT</th>
                      <th rowSpan={2} className="border border-black p-1 text-[10px] text-center align-middle font-bold w-16">DATE</th>
                      <th colSpan={4} className="border border-black p-1 text-[10px] text-center align-middle font-bold">COLLECTION UNDER RRG</th>
                      <th colSpan={6} className="border border-black p-1 text-[10px] text-center align-middle font-bold">KW&SC OTHER COLLECTIONS</th>
                      <th rowSpan={2} className="border border-black p-1 text-[10px] text-center align-middle font-bold w-20">Total<br/>KW&SC<br/>Collection<br/>( 05+11 )</th>
                    </tr>
                    <tr>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-16 leading-tight">WATER &<br/>SEWERAGE<br/>COLLECTION</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">WATER &<br/>SEWERAGE<br/>CONNECTION<br/>CHARGES<br/><span className="text-[6px] font-normal">(ABL CIVIC CENTRE BR.)</span></th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">INDUSTRIES<br/>ARREAR<br/>COLLECTION<br/>CHARGES</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-16 leading-tight">TOTAL<br/>( 02+04 )</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-16 leading-tight">WATER<br/>TANKER<br/>RECEIPTS</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">INFRA<br/>STRUCTURE<br/>BETTERMENT<br/>CHARGES<br/><span className="text-[6px] font-normal">( SINDH BANK )</span></th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">COLLECTION OF<br/>COMMERCIALIZATIO<br/>N CHARGES<br/><span className="text-[6px] font-normal">(ABL CIVIC CENTRE BR.)</span></th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">AUCTION OF<br/>SCRAP<br/>UNSERVICEABLE<br/>GOODS<br/><span className="text-[6px] font-normal">(NBP GULSHAN-E-IQBAL BR.)</span></th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-20 leading-tight">COLLECTION<br/>OF SUB SOIL<br/>WATER</th>
                      <th className="border border-black p-1 text-[8px] text-center align-middle w-16 leading-tight">TOTAL<br/>OTHERS<br/>( 06 TO 10 )</th>
                    </tr>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center"></th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">01</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">02</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">03</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">04</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">05</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">06</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">07</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">08</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">09</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">10</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">11</th>
                      <th className="border border-black p-0.5 text-[8px] font-bold text-center">12</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Live Preview for Daily Records (if any amount or date is entered) */}
                    {(formData.wsc || formData.wscc || formData.iacc || formData.wtr || formData.isbc || formData.ccc || formData.asug || formData.cssw) && (
                      <tr className="bg-gray-100 italic opacity-80 border-b-2 border-gray-300">
                        <td className="border border-black p-1 text-center align-middle">
                           <span className="text-[10px] text-black font-bold px-1">PREVIEW</span>
                        </td>
                        <td className="border border-black p-1 text-[10px] text-center font-bold text-black">
                          {formData.entry_date}
                        </td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.wsc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.wscc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.iacc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold text-black">{formatCurrency((parseFloat(formData.wsc) || 0) + (parseFloat(formData.iacc) || 0))}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.wtr) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.isbc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.ccc) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.asug) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono text-black">{formatCurrency(parseFloat(formData.cssw) || 0)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold text-black">
                          {formatCurrency((parseFloat(formData.wtr) || 0) + (parseFloat(formData.isbc) || 0) + (parseFloat(formData.ccc) || 0) + (parseFloat(formData.asug) || 0) + (parseFloat(formData.cssw) || 0))}
                        </td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold text-black">
                          {formatCurrency((parseFloat(formData.wsc) || 0) + (parseFloat(formData.iacc) || 0) + (parseFloat(formData.wtr) || 0) + (parseFloat(formData.isbc) || 0) + (parseFloat(formData.ccc) || 0) + (parseFloat(formData.asug) || 0) + (parseFloat(formData.cssw) || 0) + (parseFloat(formData.wscc) || 0))}
                        </td>
                      </tr>
                    )}

                    {records.map((row) => (
                      <tr key={row.id}>
                        <td className="border border-black p-1 text-center align-middle">
                          <Button variant="ghost" size="icon" onClick={() => deleteRecord(row.id)} className="h-5 w-5 text-red-600 hover:bg-red-100 p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                        <td className="border border-black p-1 text-[10px] text-center font-bold">
                          {row.entry_date}
                        </td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(row.wsc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(row.wscc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(row.iacc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold">{formatCurrency(row.wsc + row.iacc)}</td>
                        
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(row.wtr)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(row.isbc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(row.ccc)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(row.asug)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono">{formatCurrency(row.cssw)}</td>
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold">{formatCurrency(row.wtr + row.isbc + row.ccc + row.asug + row.cssw)}</td>
                        
                        <td className="border border-black p-1 text-[10px] text-right font-mono font-bold">{formatCurrency(row.wsc + row.iacc + row.wtr + row.isbc + row.ccc + row.asug + row.cssw + row.wscc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-xs font-bold flex items-start gap-1">
                  <span>☆</span> <span><span className="underline">Note:</span> Report prepared on the basis of Telephonic Bank balances.</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionEntry;
