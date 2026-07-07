import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Printer, Save } from "lucide-react";
import { numberToWords } from "@/lib/numberToWords";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getLocalDateString = (dateStr?: string | Date | null): string => {
  if (!dateStr) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  }
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

interface AdviceItem {
  id: string;
  amount: number;
  ac_debit: string;
  ac_credit: string;
  in_respect_of: string;
  payment_method?: string;
  payment_number?: string;
}

export default function TransferAdvice() {
  const { user, userRole, userName } = useAuth();
  const [adviceNo, setAdviceNo] = useState(`KW&SC/DIR-ACC/F.D/A/${new Date().getFullYear()}/`);
  const [adviceDate, setAdviceDate] = useState(getLocalDateString());
  const [bankDetails, setBankDetails] = useState("The Chief Manager,\nHabib Bank Limited,\nSindh Secretariat Branch,\nKarachi.");
  const [subject, setSubject] = useState("TRANSFER ADVICE.");
  const [isSaving, setIsSaving] = useState(false);
  
  const [items, setItems] = useState<AdviceItem[]>([
    { id: crypto.randomUUID(), amount: 100000000, ac_debit: "09167900975803", ac_credit: "09167900975903", in_respect_of: "REGULAR SALARY", payment_method: "None", payment_number: "" }
  ]);

  const addItem = () => {
    setItems([...items, { 
      id: crypto.randomUUID(), 
      amount: 0, 
      ac_debit: "09167900975803",
      ac_credit: "09167900975903", 
      in_respect_of: "REGULAR SALARY",
      payment_method: "None",
      payment_number: ""
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof AdviceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!user && !userRole) {
      toast.error("You must be logged in to save.");
      return;
    }
    
    setIsSaving(true);
    try {
      const adviceId = crypto.randomUUID();
      
      // Save header
      const { error: headerErr } = await supabase.from('transfer_advices').insert({
        id: adviceId,
        advice_no: adviceNo,
        date: adviceDate,
        bank_name: bankDetails,
        subject: subject,
        total_amount: totalAmount,
        created_by: user?.email || userName || userRole || 'unknown',
        created_at: new Date().toISOString()
      });

      if (headerErr) throw headerErr;

      // Save items
      const itemsToSave = items.map((item, index) => ({
        id: crypto.randomUUID(),
        transfer_advice_id: adviceId,
        s_no: index + 1,
        transfer_amount: item.amount,
        amount_in_words: numberToWords(item.amount),
        ac_no_debit: item.ac_debit,
        ac_no_credit: item.ac_credit,
        in_respect_of: item.in_respect_of,
        payment_method: item.payment_method !== "None" ? item.payment_method : null,
        payment_number: item.payment_method !== "None" ? item.payment_number : null,
        created_at: new Date().toISOString()
      }));

      const { error: itemsErr } = await supabase.from('transfer_advice_items').insert(itemsToSave);
      
      if (itemsErr) throw itemsErr;

      toast.success("Transfer Advice saved successfully to Supabase!");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save to database. Ensure the tables exist.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      
      {/* --- FORM SECTION (Hidden on Print) --- */}
      <div className="no-print space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Transfer Advice Generator</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleSave} className="text-white border-white/20">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white font-bold">
              <Printer className="w-4 h-4 mr-2" /> Print Advice
            </Button>
          </div>
        </div>

        <Card className="bg-[#0B101E] border-white/10 text-white shadow-xl">
          <CardHeader>
            <CardTitle>Header Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Advice No.</Label>
              <Input value={adviceNo} onChange={(e) => setAdviceNo(e.target.value)} className="bg-[#1A2333] border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={adviceDate} onChange={(e) => setAdviceDate(e.target.value)} className="bg-[#1A2333] border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Bank Details (To)</Label>
              <Textarea rows={4} value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} className="bg-[#1A2333] border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-[#1A2333] border-white/10" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0B101E] border-white/10 text-white shadow-xl">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Transfer Items</CardTitle>
            <Button onClick={addItem} size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-1" /> Add Row
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-[#1A2333]">
                  <tr>
                    <th className="px-4 py-3">Transfer Amount</th>
                    <th className="px-4 py-3">A/C No (Debit)</th>
                    <th className="px-4 py-3">A/C No (Credit)</th>
                    <th className="px-4 py-3">In Respect Of</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Number</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-white/10">
                      <td className="px-4 py-2">
                        <Input 
                          type="number" 
                          value={item.amount || ''} 
                          onChange={(e) => updateItem(item.id, 'amount', Number(e.target.value))}
                          className="bg-[#1A2333] border-white/10 w-32" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          value={item.ac_debit} 
                          onChange={(e) => updateItem(item.id, 'ac_debit', e.target.value)}
                          className="bg-[#1A2333] border-white/10 w-36" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          value={item.ac_credit} 
                          onChange={(e) => updateItem(item.id, 'ac_credit', e.target.value)}
                          className="bg-[#1A2333] border-white/10 w-36" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          value={item.in_respect_of} 
                          onChange={(e) => updateItem(item.id, 'in_respect_of', e.target.value)}
                          className="bg-[#1A2333] border-white/10 w-40" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Select value={item.payment_method || "None"} onValueChange={(val) => updateItem(item.id, 'payment_method', val)}>
                          <SelectTrigger className="bg-[#1A2333] border-white/10 w-32">
                            <SelectValue placeholder="Method" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A2333] border-white/10 text-white">
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="Voucher">Voucher</SelectItem>
                            <SelectItem value="Digital">Digital</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2">
                        {item.payment_method !== "None" && (
                          <Input 
                            value={item.payment_number || ''} 
                            onChange={(e) => updateItem(item.id, 'payment_number', e.target.value)}
                            placeholder="Number..."
                            className="bg-[#1A2333] border-white/10 w-32" 
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="space-x-2">
                <Button variant="outline" onClick={handleSave} disabled={isSaving} className="text-white border-white/20">
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Advice"}
                </Button>
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white font-bold">
                  <Printer className="w-4 h-4 mr-2" /> Print Advice
                </Button>
              </div>
              <p className="text-xl font-bold text-green-400">Total Amount: {totalAmount.toLocaleString('en-US')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- PRINT SECTION (Visible ONLY on Print) --- */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #ta-print-section, #ta-print-section * { visibility: visible; }
          #ta-print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            font-family: 'Times New Roman', Times, serif;
            padding: 20px;
          }
          .no-print { display: none !important; }
          
          /* Table styling matching exactly the physical print */
          .ta-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 11pt;
          }
          .ta-table th, .ta-table td {
            border: 1px solid black;
            padding: 8px 5px;
            text-align: center;
          }
          .ta-table th {
            font-weight: bold;
            font-size: 10pt;
          }
          .ta-table .amount-col { text-align: right; }
          .ta-table .words-col { text-align: left; }
        }
      `}</style>

      <div id="ta-print-section" className="hidden print:block w-full bg-white text-black min-h-screen">
        {/* Header matching screenshot */}
        <div className="text-center mb-8 relative">
          <div className="absolute left-0 top-0 w-20 h-20 border-2 border-black rounded-full flex items-center justify-center font-bold text-xs text-center p-2">
            KW&SC<br/>LOGO
            {/* You can replace this with actual logo image later */}
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wide">Karachi Water & Sewerage Corporation</h1>
          <h2 className="text-lg font-bold uppercase">Finance Department</h2>
          <h3 className="text-md font-bold uppercase">Office of the Director Accounts</h3>
          <p className="text-xs mt-1">1st Floor, Old KBCA Building Behind Civic Center Karachi. Phone: 021-99230320 Webs: www.kwsc.gos.pk</p>
        </div>

        <div className="flex justify-between font-bold mb-6 text-[11pt]">
          <div>NO: {adviceNo}</div>
          <div>DT: {adviceDate.split('-').reverse().join('.')}</div>
        </div>

        <div className="mb-6 text-[11pt] whitespace-pre-wrap leading-tight">
          To,<br/>
          {bankDetails}
        </div>

        <div className="flex gap-4 mb-6 text-[11pt]">
          <div className="font-bold w-24">SUBJECT:</div>
          <div className="font-bold underline uppercase">{subject}</div>
        </div>

        <div className="text-[11pt] mb-4 text-justify leading-relaxed">
          In accordance with the directives of the competent authorities, you are requested to transfer the amount from KW&SC's account to other KW&SC accounts as per the details mentioned below.
        </div>
        <div className="text-[11pt] mb-6 text-justify leading-relaxed">
          Kindly follow the instruction regarding below mentioned accounts of HBL Sindh Secretariat, Branch at present under intimation to the undersigned.
        </div>

        {/* The Table */}
        <table className="ta-table">
          <thead>
            <tr>
              <th className="w-10">S.NO</th>
              <th className="w-28">TRANSFER<br/>AMOUNT</th>
              <th>AMOUNT IN WORDS</th>
              <th className="w-28">A/C. NO<br/>(DEBIT)</th>
              <th className="w-28">A/C. NO<br/>(CREDIT)</th>
              <th className="w-32">IN RESPECT OF</th>
              <th className="w-24">PAYMENT<br/>METHOD</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td className="amount-col">{Number(item.amount).toLocaleString('en-US')}</td>
                <td className="words-col text-[9pt] uppercase">{numberToWords(item.amount)}</td>
                <td>{item.ac_debit}</td>
                <td>{item.ac_credit}</td>
                <td className="words-col text-[9pt]">{item.in_respect_of}</td>
                <td className="text-[9pt]">{item.payment_method && item.payment_method !== "None" ? `${item.payment_method}\n${item.payment_number}` : '-'}</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="font-bold border-t-2 border-black">
              <td></td>
              <td className="amount-col">{totalAmount.toLocaleString('en-US')}</td>
              <td colSpan={5}></td>
            </tr>
          </tbody>
        </table>

        {/* Footer Signatures */}
        <div className="mt-20 flex justify-end pr-10 text-center font-bold text-[11pt]">
          <div>
            DIRECTOR ACCOUNTS<br/>
            KW&SC
          </div>
        </div>
        <div className="mt-12 flex justify-center text-center font-bold text-[11pt]">
          <div>
            CHIEF FINANCIAL OFFICER<br/>
            KW&SC
          </div>
        </div>

      </div>
    </div>
  );
}
