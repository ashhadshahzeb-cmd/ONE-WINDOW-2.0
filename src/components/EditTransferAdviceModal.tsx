import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { numberToWords } from "@/lib/numberToWords";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdviceItem {
  id: string;
  amount: number;
  ac_debit: string;
  ac_credit: string;
  in_respect_of: string;
  payment_method?: string;
  payment_number?: string;
}

interface EditTransferAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  onSaveSuccess: () => void;
}

export default function EditTransferAdviceModal({ isOpen, onClose, record, onSaveSuccess }: EditTransferAdviceModalProps) {
  const [adviceNo, setAdviceNo] = useState('');
  const [adviceDate, setAdviceDate] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [subject, setSubject] = useState('');
  const [items, setItems] = useState<AdviceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setAdviceNo(record.advice_no || '');
      setAdviceDate(record.date || '');
      setBankDetails(record.bank_name || '');
      setSubject(record.subject || '');
      fetchItems();
    }
  }, [isOpen, record]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transfer_advice_items')
        .select('*')
        .eq('transfer_advice_id', record.id)
        .order('s_no', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setItems(data.map(d => ({
          id: d.id || crypto.randomUUID(),
          amount: Number(d.transfer_amount) || 0,
          ac_debit: d.ac_no_debit || '',
          ac_credit: d.ac_no_credit || '',
          in_respect_of: d.in_respect_of || '',
          payment_method: d.payment_method || 'None',
          payment_number: d.payment_number || ''
        })));
      } else {
        setItems([]);
      }
    } catch (err: any) {
      console.error('Error fetching items:', err);
      toast.error('Failed to load items for editing');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update Header
      const { error: headerErr } = await supabase
        .from('transfer_advices')
        .update({
          advice_no: adviceNo,
          date: adviceDate,
          bank_name: bankDetails,
          subject: subject,
          total_amount: totalAmount
        })
        .eq('id', record.id);

      if (headerErr) throw headerErr;

      // 2. Delete existing items
      const { error: delErr } = await supabase
        .from('transfer_advice_items')
        .delete()
        .eq('transfer_advice_id', record.id);
        
      if (delErr) throw delErr;

      // 3. Insert new items
      if (items.length > 0) {
        const itemsToSave = items.map((item, index) => ({
          id: crypto.randomUUID(),
          transfer_advice_id: record.id,
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

        const { error: itemsErr } = await supabase
          .from('transfer_advice_items')
          .insert(itemsToSave);

        if (itemsErr) throw itemsErr;
      }

      toast.success("Transfer Advice updated successfully!");
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error(err.message || 'Failed to update record');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0B101E] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Transfer Advice</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Textarea value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} className="bg-[#1A2333] border-white/10 h-24" />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Textarea value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-[#1A2333] border-white/10 h-24" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Advice Items</h3>
                <Button onClick={addItem} size="sm" variant="outline" className="border-white/20">
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={item.id} className="p-4 bg-[#1A2333] border border-white/5 rounded-lg space-y-4 relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-white/50">Amount</Label>
                      <Input 
                        type="number" 
                        value={item.amount || ''} 
                        onChange={(e) => updateItem(item.id, 'amount', Number(e.target.value))}
                        className="bg-[#0B101E] border-white/10" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-white/50">A/C (Debit)</Label>
                      <Input 
                        value={item.ac_debit} 
                        onChange={(e) => updateItem(item.id, 'ac_debit', e.target.value)}
                        className="bg-[#0B101E] border-white/10" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-white/50">A/C (Credit)</Label>
                      <Input 
                        value={item.ac_credit} 
                        onChange={(e) => updateItem(item.id, 'ac_credit', e.target.value)}
                        className="bg-[#0B101E] border-white/10" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-white/50">In Respect Of</Label>
                      <Input 
                        value={item.in_respect_of} 
                        onChange={(e) => updateItem(item.id, 'in_respect_of', e.target.value)}
                        className="bg-[#0B101E] border-white/10" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-white/50">Payment Method</Label>
                      <Select value={item.payment_method || "None"} onValueChange={(val) => updateItem(item.id, 'payment_method', val)}>
                        <SelectTrigger className="bg-[#0B101E] border-white/10">
                          <SelectValue placeholder="Method" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A2333] border-white/10 text-white">
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Voucher">Voucher</SelectItem>
                          <SelectItem value="Digital">Digital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      {item.payment_method !== "None" && (
                        <>
                          <Label className="text-xs text-white/50">
                            {item.payment_method === 'Digital' ? 'Transaction ID' : `${item.payment_method} Number`}
                          </Label>
                          <Input 
                            value={item.payment_number || ''} 
                            onChange={(e) => updateItem(item.id, 'payment_number', e.target.value)}
                            placeholder={item.payment_method === 'Digital' ? 'Transaction ID...' : `${item.payment_method} No...`}
                            className="bg-[#0B101E] border-white/10" 
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end pt-4 border-t border-white/10">
                <div className="text-xl font-bold">
                  Total Amount: <span className="text-emerald-400">Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 border-t border-white/10 pt-4">
          <Button variant="outline" onClick={onClose} className="text-white border-white/20">Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
