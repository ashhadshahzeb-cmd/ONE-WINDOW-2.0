import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Printer, Save } from "lucide-react";
import { numberToWords } from "@/lib/numberToWords";
import { toast } from "sonner";
import { getLocalDateString } from '@/lib/utils';
// import { supabase } from '@/lib/supabase'; // Will be used when saving

interface AdviceItem {
  id: string;
  amount: number;
  ac_debit: string;
  ac_credit: string;
  in_respect_of: string;
}

export default function TransferAdvice() {
  const [adviceNo, setAdviceNo] = useState(`KW&SC/DIR-ACC/F.D/A/${new Date().getFullYear()}/`);
  const [adviceDate, setAdviceDate] = useState(getLocalDateString());
  const [bankDetails, setBankDetails] = useState("The Chief Manager,\nHabib Bank Limited,\nSindh Secretariat Branch,\nKarachi.");
  const [subject, setSubject] = useState("TRANSFER ADVICE.");
  
  const [items, setItems] = useState<AdviceItem[]>([
    { id: crypto.randomUUID(), amount: 100000000, ac_debit: "09167900975803", ac_credit: "09167900975903", in_respect_of: "REGULAR SALARY" }
  ]);

  const addItem = () => {
    setItems([...items, { 
      id: crypto.randomUUID(), 
      amount: 0, 
      ac_debit: "09167900975803", // Default from screenshot
      ac_credit: "09167900975903", 
      in_respect_of: "REGULAR SALARY" 
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

  const handleSave = () => {
    // Save logic to Supabase would go here
    toast.success("Feature ready for database integration.");
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
                          className="bg-[#1A2333] border-white/10" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          value={item.ac_credit} 
                          onChange={(e) => updateItem(item.id, 'ac_credit', e.target.value)}
                          className="bg-[#1A2333] border-white/10" 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          value={item.in_respect_of} 
                          onChange={(e) => updateItem(item.id, 'in_respect_of', e.target.value)}
                          className="bg-[#1A2333] border-white/10" 
                        />
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
            <div className="mt-4 text-right">
              <p className="text-lg font-bold">Total Amount: {totalAmount.toLocaleString('en-US')}</p>
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
              <th className="w-32">A/C. NO<br/>(DEBIT)</th>
              <th className="w-32">A/C. NO<br/>(CREDIT)</th>
              <th className="w-32">IN RESPECT OF</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td className="amount-col">{item.amount.toLocaleString('en-US')}</td>
                <td className="words-col">{numberToWords(item.amount)}</td>
                <td>{item.ac_debit}</td>
                <td>{item.ac_credit}</td>
                <td>{item.in_respect_of}</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="font-bold bg-gray-100">
              <td></td>
              <td className="amount-col">{totalAmount.toLocaleString('en-US')}</td>
              <td colSpan={4}></td>
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
