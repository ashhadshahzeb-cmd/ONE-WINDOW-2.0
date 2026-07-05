import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Printer, Loader2, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { numberToWords } from "@/lib/numberToWords";

export default function TransferAdviceRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdvice, setSelectedAdvice] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transfer_advices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err: any) {
      console.error('Error fetching records:', err);
      toast.error('Failed to load Transfer Advices');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (advice: any) => {
    setSelectedAdvice(advice);
    setIsViewModalOpen(true);
    setItemsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('transfer_advice_items')
        .select('*')
        .eq('transfer_advice_id', advice.id)
        .order('s_no', { ascending: true });
        
      if (error) throw error;
      setSelectedItems(data || []);
    } catch (err: any) {
      console.error('Error fetching items:', err);
      toast.error('Failed to load advice details');
    } finally {
      setItemsLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.advice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.date.includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold text-white">Transfer Advice Records</h1>
        <Button onClick={fetchRecords} variant="outline" className="text-white border-white/20">
          Refresh Data
        </Button>
      </div>

      <Card className="bg-[#0B101E] border-white/10 text-white shadow-xl no-print">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>History</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Ref No, Bank, Date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-[#1A2333] border-white/10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-[#1A2333]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Advice No</th>
                    <th className="px-4 py-3">Bank Details</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3">Created By</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">{record.date.split('-').reverse().join('-')}</td>
                        <td className="px-4 py-3 font-medium">{record.advice_no}</td>
                        <td className="px-4 py-3 max-w-xs truncate" title={record.bank_name}>{record.bank_name.split('\n')[0]}...</td>
                        <td className="px-4 py-3 text-right font-bold text-green-400">
                          {Number(record.total_amount).toLocaleString('en-US')}
                        </td>
                        <td className="px-4 py-3">{record.created_by}</td>
                        <td className="px-4 py-3 text-center">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleView(record)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <FileText className="w-4 h-4 mr-2" /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- VIEW / PRINT MODAL --- */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl bg-[#0B101E] text-white border-white/10 h-[90vh] overflow-hidden flex flex-col no-print">
          <DialogHeader className="flex flex-row justify-between items-center border-b border-white/10 pb-4">
            <DialogTitle>View Transfer Advice</DialogTitle>
            <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90 text-white font-bold">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-900 rounded-md">
            {itemsLoading ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : selectedAdvice && (
              <div className="bg-white text-black p-8 shadow-lg max-w-[800px] mx-auto min-h-[1056px] relative text-[11pt] font-serif">
                {/* Visual Preview mimicking the Print output */}
                <div className="text-center mb-8 relative">
                  <div className="absolute left-0 top-0 w-20 h-20 border-2 border-black rounded-full flex items-center justify-center font-bold text-xs text-center p-2">
                    KW&SC<br/>LOGO
                  </div>
                  <h1 className="text-xl font-bold uppercase tracking-wide">Karachi Water & Sewerage Corporation</h1>
                  <h2 className="text-lg font-bold uppercase">Finance Department</h2>
                  <h3 className="text-md font-bold uppercase">Office of the Director Accounts</h3>
                  <p className="text-xs mt-1">1st Floor, Old KBCA Building Behind Civic Center Karachi. Phone: 021-99230320 Webs: www.kwsc.gos.pk</p>
                </div>

                <div className="flex justify-between font-bold mb-6">
                  <div>NO: {selectedAdvice.advice_no}</div>
                  <div>DT: {selectedAdvice.date.split('-').reverse().join('.')}</div>
                </div>

                <div className="mb-6 whitespace-pre-wrap leading-tight">
                  To,<br/>
                  {selectedAdvice.bank_name}
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="font-bold w-24">SUBJECT:</div>
                  <div className="font-bold underline uppercase">{selectedAdvice.subject}</div>
                </div>

                <div className="mb-4 text-justify leading-relaxed">
                  In accordance with the directives of the competent authorities, you are requested to transfer the amount from KW&SC's account to other KW&SC accounts as per the details mentioned below.
                </div>
                <div className="mb-6 text-justify leading-relaxed">
                  Kindly follow the instruction regarding below mentioned accounts of HBL Sindh Secretariat, Branch at present under intimation to the undersigned.
                </div>

                <table className="w-full border-collapse border border-black mt-4 text-[10pt]">
                  <thead>
                    <tr>
                      <th className="border border-black px-2 py-2 w-10">S.NO</th>
                      <th className="border border-black px-2 py-2 w-28">TRANSFER<br/>AMOUNT</th>
                      <th className="border border-black px-2 py-2">AMOUNT IN WORDS</th>
                      <th className="border border-black px-2 py-2 w-32">A/C. NO<br/>(DEBIT)</th>
                      <th className="border border-black px-2 py-2 w-32">A/C. NO<br/>(CREDIT)</th>
                      <th className="border border-black px-2 py-2 w-32">IN RESPECT OF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
                        <td className="border border-black px-2 py-2 text-right">{Number(item.transfer_amount).toLocaleString('en-US')}</td>
                        <td className="border border-black px-2 py-2">{item.amount_in_words}</td>
                        <td className="border border-black px-2 py-2 text-center">{item.ac_no_debit}</td>
                        <td className="border border-black px-2 py-2 text-center">{item.ac_no_credit}</td>
                        <td className="border border-black px-2 py-2 text-center">{item.in_respect_of}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-100">
                      <td className="border border-black px-2 py-2"></td>
                      <td className="border border-black px-2 py-2 text-right">{Number(selectedAdvice.total_amount).toLocaleString('en-US')}</td>
                      <td colSpan={4} className="border border-black px-2 py-2"></td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-20 flex justify-end pr-10 text-center font-bold">
                  <div>
                    DIRECTOR ACCOUNTS<br/>
                    KW&SC
                  </div>
                </div>
                <div className="mt-12 flex justify-center text-center font-bold">
                  <div>
                    CHIEF FINANCIAL OFFICER<br/>
                    KW&SC
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- HIDDEN PRINT SECTION --- */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #dashboard-print-section, #dashboard-print-section * { visibility: visible; }
          #dashboard-print-section {
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
          .ta-table th { font-weight: bold; font-size: 10pt; }
          .ta-table .amount-col { text-align: right; }
          .ta-table .words-col { text-align: left; }
        }
      `}</style>

      {selectedAdvice && (
        <div id="dashboard-print-section" className="hidden print:block w-full bg-white text-black min-h-screen">
          <div className="text-center mb-8 relative">
            <div className="absolute left-0 top-0 w-20 h-20 border-2 border-black rounded-full flex items-center justify-center font-bold text-xs text-center p-2">
              KW&SC<br/>LOGO
            </div>
            <h1 className="text-xl font-bold uppercase tracking-wide">Karachi Water & Sewerage Corporation</h1>
            <h2 className="text-lg font-bold uppercase">Finance Department</h2>
            <h3 className="text-md font-bold uppercase">Office of the Director Accounts</h3>
            <p className="text-xs mt-1">1st Floor, Old KBCA Building Behind Civic Center Karachi. Phone: 021-99230320 Webs: www.kwsc.gos.pk</p>
          </div>

          <div className="flex justify-between font-bold mb-6 text-[11pt]">
            <div>NO: {selectedAdvice.advice_no}</div>
            <div>DT: {selectedAdvice.date.split('-').reverse().join('.')}</div>
          </div>

          <div className="mb-6 text-[11pt] whitespace-pre-wrap leading-tight">
            To,<br/>
            {selectedAdvice.bank_name}
          </div>

          <div className="flex gap-4 mb-6 text-[11pt]">
            <div className="font-bold w-24">SUBJECT:</div>
            <div className="font-bold underline uppercase">{selectedAdvice.subject}</div>
          </div>

          <div className="text-[11pt] mb-4 text-justify leading-relaxed">
            In accordance with the directives of the competent authorities, you are requested to transfer the amount from KW&SC's account to other KW&SC accounts as per the details mentioned below.
          </div>
          <div className="text-[11pt] mb-6 text-justify leading-relaxed">
            Kindly follow the instruction regarding below mentioned accounts of HBL Sindh Secretariat, Branch at present under intimation to the undersigned.
          </div>

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
              {selectedItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td className="amount-col">{Number(item.transfer_amount).toLocaleString('en-US')}</td>
                  <td className="words-col">{item.amount_in_words}</td>
                  <td>{item.ac_no_debit}</td>
                  <td>{item.ac_no_credit}</td>
                  <td>{item.in_respect_of}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-100">
                <td></td>
                <td className="amount-col">{Number(selectedAdvice.total_amount).toLocaleString('en-US')}</td>
                <td colSpan={4}></td>
              </tr>
            </tbody>
          </table>

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
      )}
    </div>
  );
}
