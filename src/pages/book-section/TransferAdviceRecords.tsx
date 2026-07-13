import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Printer, Loader2, X, Trash2, Phone, Globe, Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { numberToWords } from "@/lib/numberToWords";
import { useAuth } from '@/contexts/AuthContext';
import EditTransferAdviceModal from '@/components/EditTransferAdviceModal';
import { FileEdit, CheckSquare } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TransferAdviceRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdvice, setSelectedAdvice] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  
  const { userRole, userName, isAdmin, verifyPassword } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<"waiting" | "approved" | "rejected">("waiting");

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [isBulkPrintConfigOpen, setIsBulkPrintConfigOpen] = useState(false);
  const [bulkHeaderConfig, setBulkHeaderConfig] = useState({
    advice_no: '',
    date: '',
    bank_name: '',
    subject: '',
    payment_method: 'None',
    payment_number: '',
    total_amount: 0
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (!isApprovalModalOpen || !selectedAdvice || !userRole) return;
    
    const channel = supabase
      .channel('transfer_advice_approval')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.receiver_role === userRole && newMsg.message.startsWith('[TRANSFER_ADVICE_EDIT_APPROVED]::' + selectedAdvice.id)) {
            toast.success("Admin approved edit request!");
            setApprovalStatus("approved");
            setIsApprovalModalOpen(false);
            setIsEditModalOpen(true);
          } else if (newMsg.receiver_role === userRole && newMsg.message.startsWith('[TRANSFER_ADVICE_EDIT_REJECTED]::' + selectedAdvice.id)) {
            toast.error("Admin rejected edit request.");
            setApprovalStatus("rejected");
            setIsApprovalModalOpen(false);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isApprovalModalOpen, selectedAdvice, userRole]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transfer_advices')
        .select('*, transfer_advice_items(in_respect_of)')
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Transfer Advice? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from('transfer_advices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Transfer Advice deleted successfully.");
      setRecords(records.filter(r => r.id !== id));
    } catch (err: any) {
      console.error('Error deleting record:', err);
      toast.error('Failed to delete record');
    }
  };

  const handleEditClick = async (advice: any) => {
    setSelectedAdvice(advice);
    if (isAdmin) {
      setIsEditModalOpen(true);
    } else {
      setApprovalStatus("waiting");
      setIsApprovalModalOpen(true);
      
      await supabase.from('messages').insert([{
        sender_role: userRole,
        sender_name: userName || 'User',
        receiver_role: 'admin',
        receiver_name: 'Admin',
        message: `[TRANSFER_ADVICE_EDIT_REQ]::${advice.id}`
      }]);
      toast.info("Approval request sent to Admin.");
    }
  };

  const handlePasswordOverride = () => {
    if (!verifyPassword(editPassword)) {
      toast.error("Incorrect password.");
      return;
    }
    toast.success("Password verified. Edit mode active.");
    setEditPassword("");
    setIsApprovalModalOpen(false);
    setIsEditModalOpen(true);
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

  const filteredRecords = records.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const inRespectOfValues = r.transfer_advice_items ? r.transfer_advice_items.map((i: any) => i.in_respect_of?.toLowerCase() || '') : [];
    
    const matchesSearch = r.advice_no.toLowerCase().includes(searchLower) ||
                          r.bank_name.toLowerCase().includes(searchLower) ||
                          r.date.includes(searchTerm) ||
                          inRespectOfValues.some((val: string) => val.includes(searchLower));
    const matchesStart = startDate ? r.date >= startDate : true;
    const matchesEnd = endDate ? r.date <= endDate : true;
    return matchesSearch && matchesStart && matchesEnd;
  });

  const handleSelectAll = () => {
    if (selectedRecordIds.length === filteredRecords.length) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(filteredRecords.map(r => r.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedRecordIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleOpenBulkPrintConfig = () => {
    if (selectedRecordIds.length === 0) {
      toast.error("Please select at least one record to print.");
      return;
    }
    const firstSelected = records.find(r => r.id === selectedRecordIds[0]);
    if (firstSelected) {
      setBulkHeaderConfig({
        advice_no: firstSelected.advice_no,
        date: firstSelected.date,
        bank_name: firstSelected.bank_name,
        subject: firstSelected.subject,
        payment_method: firstSelected.payment_method || 'None',
        payment_number: firstSelected.payment_number || '',
        total_amount: 0
      });
      setIsBulkPrintConfigOpen(true);
    }
  };

  const handleExecuteBulkPrint = async () => {
    setIsBulkPrintConfigOpen(false);
    setItemsLoading(true);
    setIsViewModalOpen(true);
    
    try {
      const { data, error } = await supabase
        .from('transfer_advice_items')
        .select('*')
        .in('transfer_advice_id', selectedRecordIds)
        .order('transfer_advice_id', { ascending: true })
        .order('s_no', { ascending: true });
        
      if (error) throw error;
      
      const allItems = data || [];
      const totalAmount = allItems.reduce((sum, item) => sum + (Number(item.transfer_amount) || 0), 0);
      
      setSelectedAdvice({ ...bulkHeaderConfig, total_amount: totalAmount });
      setSelectedItems(allItems);
    } catch (err: any) {
      console.error('Error fetching bulk items:', err);
      toast.error('Failed to load advice details for bulk print');
      setIsViewModalOpen(false);
    } finally {
      setItemsLoading(false);
    }
  };

  const selectedTotalAmount = filteredRecords
    .filter(r => selectedRecordIds.includes(r.id))
    .reduce((sum, record) => sum + (Number(record.total_amount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden relative border border-slate-100">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#F3F6FF] to-transparent pointer-events-none opacity-50" />
        
        <div className="p-8 sm:p-12 relative z-10">
          
          {/* HEADER: LOGO AND HELPLINE */}
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

            <div className="flex items-center space-x-4">
              <Button onClick={fetchRecords} variant="outline" className="text-[#1C3B70] border-[#1C3B70] hover:bg-[#1C3B70] hover:text-white transition-colors">
                Refresh Data
              </Button>
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
          </div>

          {/* MAIN TITLE */}
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-4xl sm:text-5xl font-black text-[#5B75C7] tracking-tight">TRANSFER ADVICE RECORDS</h2>
            <div className="w-full max-w-4xl mx-auto h-[2px] bg-slate-200 mt-6" />
          </div>

          {/* BULK PRINT BUTTON (IF ANY) */}
          {selectedRecordIds.length > 0 && (
            <div className="flex justify-end mb-4 no-print">
              <Button onClick={handleOpenBulkPrintConfig} className="bg-[#1C3B70] hover:bg-[#0F2243] text-white font-bold shadow-sm">
                <Printer className="w-4 h-4 mr-2" /> Print Selected ({selectedRecordIds.length})
              </Button>
            </div>
          )}

      <Card className="no-print bg-white border-slate-200 shadow-md">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center bg-[#F3F6FF] border-b border-slate-100 rounded-t-xl">
          <CardTitle className="text-2xl font-black text-[#1C3B70]">History</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 px-3 shadow-sm">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 border-0 bg-transparent focus-visible:ring-0 w-[130px] text-slate-700" />
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 border-0 bg-transparent focus-visible:ring-0 w-[130px] text-slate-700" />
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search Ref No, Bank, Date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white border-slate-200 text-slate-700 h-10 shadow-sm focus:ring-[#1C3B70] rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
                        <div className="p-4 sm:p-6 bg-[#F8FAFC]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <button onClick={handleSelectAll} className="flex items-center text-sm font-semibold text-slate-500 hover:text-[#1C3B70] transition-colors">
                    <CheckSquare className={`w-5 h-5 mr-2 ${selectedRecordIds.length === filteredRecords.length && filteredRecords.length > 0 ? 'text-[#466399] fill-[#1C3B70]' : 'text-slate-400'}`} />
                    Select All
                  </button>
                </div>
                {selectedRecordIds.length > 0 && (
                  <div className="text-right text-sm font-bold text-[#1C3B70] uppercase tracking-wider">
                    Total Selected: <span className="text-[#059669] text-xl ml-2">{selectedTotalAmount.toLocaleString('en-US')}</span>
                  </div>
                )}
              </div>
              
              {filteredRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium bg-white rounded-xl shadow-sm border border-slate-100">
                  No records found.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {filteredRecords.map((record) => {
                    const dateParts = record.date.split('-');
                    const dateObj = new Date(dateParts[0], parseInt(dateParts[1]) - 1, dateParts[2]);
                    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    
                    const inRespectOfList = record.transfer_advice_items 
                      ? Array.from(new Set(record.transfer_advice_items.map((i: any) => i.in_respect_of))).filter(Boolean)
                      : [];
                    const inRespectOfText = inRespectOfList.length > 0 ? inRespectOfList[0] + (inRespectOfList.length > 1 ? '...' : '') : 'N/A';
                    
                    const isSelected = selectedRecordIds.includes(record.id);
                    
                    return (
                      <div 
                        key={record.id} 
                        className={`flex items-center justify-between p-2 sm:p-4 rounded-xl border ${isSelected ? 'bg-[#EAEFFD]/30 border-[#273D81] ring-1 ring-[#273D81]' : 'bg-white border-slate-100 hover:shadow-md'} transition-all duration-200 cursor-pointer overflow-hidden`}
                        onClick={() => handleToggleSelect(record.id)}
                      >
                        {/* LEFT SECTION: Checkbox, Icon, Date */}
                        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => { e.stopPropagation(); handleToggleSelect(record.id); }}
                            className="w-4 h-4 rounded border-slate-300 text-[#273D81] focus:ring-[#273D81] cursor-pointer"
                          />
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#EAEFFD] flex items-center justify-center shrink-0 shadow-sm border border-white">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#273D81]" />
                          </div>
                          <span className="font-bold text-[#273D81] text-[10px] sm:text-xs whitespace-nowrap">{formattedDate}</span>
                        </div>

                        {/* MIDDLE SECTION: Advice No & Bank */}
                        <div className="flex flex-col border-l-2 border-[#273D81] pl-2 sm:pl-3 ml-2 sm:ml-4 flex-1 min-w-0">
                          <span className="font-bold text-[#273D81] text-[9px] sm:text-[11px] truncate" title={record.advice_no}>{record.advice_no.split('/').pop() || record.advice_no}</span>
                          <span className="text-slate-500 font-medium text-[8px] sm:text-[10px] truncate leading-tight" title={record.bank_name}>{record.bank_name.split('\n')[0]}</span>
                        </div>

                        {/* MIDDLE RIGHT: In Respect Of */}
                        <div className="flex-1 text-center px-2 shrink-0 hidden md:block min-w-0">
                          <span className="text-slate-700 font-semibold text-[9px] sm:text-[10px] truncate block w-full" title={inRespectOfText}>{inRespectOfText}</span>
                        </div>

                        {/* RIGHT SECTION: Amount & Actions */}
                        <div className="flex flex-col items-end shrink-0 space-y-1 sm:space-y-2 ml-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-[8px] sm:text-[10px] text-emerald-500 font-bold hidden sm:inline">PKR</span>
                            <span className="text-emerald-500 font-black text-[11px] sm:text-[14px]">{Number(record.total_amount).toLocaleString('en-US')}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 sm:space-x-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleView(record)} className="p-1 sm:p-1.5 bg-[#EAEFFD] text-[#273D81] hover:bg-[#273D81] hover:text-white rounded-md transition-colors" title="View">
                              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button onClick={() => handleEditClick(record)} className="p-1 sm:p-1.5 bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white rounded-md transition-colors" title="Edit">
                              <FileEdit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(record.id)} className="p-1 sm:p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-md transition-colors" title="Delete">
                              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FOOTER */}
      <div className="mt-12 text-center text-slate-600 text-sm sm:text-lg max-w-4xl mx-auto mb-12 font-medium leading-relaxed">
        The table above displays the complete history of Transfer Advice entries generated by the Karachi Water & Sewerage Corporation, reflecting all financial disbursals.
      </div>

      <div className="bg-[#273D81] rounded-full py-3 sm:py-4 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-white w-max mx-auto shadow-lg no-print">
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

      {/* --- BULK PRINT CONFIG MODAL --- */}
      <Dialog open={isBulkPrintConfigOpen} onOpenChange={setIsBulkPrintConfigOpen}>
        <DialogContent className="bg-[#0B101E] border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-sky-400 font-bold">Configure Bulk Print</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-white/70">
              You are about to print <strong>{selectedRecordIds.length}</strong> selected records as a single document. 
              Please confirm or edit the common header details that will appear at the top.
            </p>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Advice No.</Label>
                <Input value={bulkHeaderConfig.advice_no} onChange={(e) => setBulkHeaderConfig(c => ({...c, advice_no: e.target.value}))} className="bg-[#1A2333] border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={bulkHeaderConfig.date} onChange={(e) => setBulkHeaderConfig(c => ({...c, date: e.target.value}))} className="bg-[#1A2333] border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Bank Details (To)</Label>
                <Textarea value={bulkHeaderConfig.bank_name} onChange={(e) => setBulkHeaderConfig(c => ({...c, bank_name: e.target.value}))} className="bg-[#1A2333] border-white/10 h-20" />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Textarea value={bulkHeaderConfig.subject} onChange={(e) => setBulkHeaderConfig(c => ({...c, subject: e.target.value}))} className="bg-[#1A2333] border-white/10 h-20" />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={bulkHeaderConfig.payment_method} onValueChange={(val) => setBulkHeaderConfig(c => ({...c, payment_method: val}))}>
                  <SelectTrigger className="bg-[#1A2333] border-white/10">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A2333] border-white/10 text-white">
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Voucher">Voucher</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {bulkHeaderConfig.payment_method !== "None" && (
                <div className="space-y-2">
                  <Label>{bulkHeaderConfig.payment_method} Number</Label>
                  <Input value={bulkHeaderConfig.payment_number} onChange={(e) => setBulkHeaderConfig(c => ({...c, payment_number: e.target.value}))} className="bg-[#1A2333] border-white/10" />
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <Button variant="outline" onClick={() => setIsBulkPrintConfigOpen(false)} className="text-white border-white/20">Cancel</Button>
              <Button onClick={handleExecuteBulkPrint} className="bg-sky-600 hover:bg-sky-700 text-white font-bold">
                <Printer className="w-4 h-4 mr-2" /> Generate Print View
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- EDIT MODAL --- */}
      <EditTransferAdviceModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={selectedAdvice}
        onSaveSuccess={() => { fetchRecords(); }}
      />

      {/* --- APPROVAL MODAL --- */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="bg-[#0B101E] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-amber-500 font-bold">Edit Approval Required</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-sm text-center">Waiting for Admin to approve this edit request...</p>
            </div>
            
            <div className="space-y-4 border-t border-white/10 pt-4">
              <p className="text-sm text-white/70">Or enter admin password to bypass approval:</p>
              <Input 
                type="password" 
                placeholder="Enter password..." 
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="bg-[#1A2333] border-white/10"
              />
              <Button onClick={handlePasswordOverride} disabled={!editPassword} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Verify Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

                <div className="flex justify-between font-bold mb-6 text-[11pt]">
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
                      <th className="border border-black px-2 py-2 w-28">A/C. NO<br/>(DEBIT)</th>
                      <th className="border border-black px-2 py-2 w-28">A/C. NO<br/>(CREDIT)</th>
                      <th className="border border-black px-2 py-2 w-32">IN RESPECT OF</th>
                      <th className="border border-black px-2 py-2 w-24">PAYMENT<br/>METHOD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                        <td className="border border-black px-2 py-1 text-right">{Number(item.transfer_amount).toLocaleString('en-US')}</td>
                        <td className="border border-black px-2 py-1 text-[9pt] uppercase">{item.amount_in_words}</td>
                        <td className="border border-black px-2 py-1 text-center">{item.ac_no_debit}</td>
                        <td className="border border-black px-2 py-1 text-center">{item.ac_no_credit}</td>
                        <td className="border border-black px-2 py-1 text-[9pt] text-center">{item.in_respect_of}</td>
                        <td className="border border-black px-2 py-1 text-[9pt] text-center">
                          {item.payment_method && item.payment_method !== "None" 
                            ? (item.payment_method === 'Digital' ? `Transaction ID:\n${item.payment_number}` : `${item.payment_method} No:\n${item.payment_number}`) 
                            : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold border-t-2 border-black">
                      <td className="border border-black px-2 py-1 text-center"></td>
                      <td className="border border-black px-2 py-1 text-right">{Number(selectedAdvice.total_amount).toLocaleString('en-US')}</td>
                      <td className="border border-black px-2 py-1" colSpan={5}></td>
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
                <th className="w-28">A/C. NO<br/>(DEBIT)</th>
                <th className="w-28">A/C. NO<br/>(CREDIT)</th>
                <th className="w-32">IN RESPECT OF</th>
                <th className="w-24">PAYMENT<br/>METHOD</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td className="amount-col">{Number(item.transfer_amount).toLocaleString('en-US')}</td>
                  <td className="words-col text-[9pt] uppercase">{item.amount_in_words}</td>
                  <td>{item.ac_no_debit}</td>
                  <td>{item.ac_no_credit}</td>
                  <td className="words-col text-[9pt]">{item.in_respect_of}</td>
                  <td className="text-[9pt]">
                    {item.payment_method && item.payment_method !== "None" 
                      ? (item.payment_method === 'Digital' ? `Transaction ID:\n${item.payment_number}` : `${item.payment_method} No:\n${item.payment_number}`) 
                      : '-'}
                  </td>
                </tr>
              ))}
              <tr className="font-bold border-t-2 border-black">
                <td></td>
                <td className="amount-col">{Number(selectedAdvice.total_amount).toLocaleString('en-US')}</td>
                <td colSpan={5}></td>
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
