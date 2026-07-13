import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Check, X, Clock, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function LeaveManagement() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isHRMSEmployee = userRole === 'hrms_employee';
  const myEmpId = localStorage.getItem('kwsb_hrms_emp_id');

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    let query = supabase.from('hrms_leave_requests').select('*, hrms_employees(name, designation)').order('created_at', { ascending: false });
    
    if (isHRMSEmployee && myEmpId) {
      query = query.eq('employee_id', myEmpId);
    }

    const { data, error } = await query;
    if (!error && data) setLeaves(data);
    setLoading(false);
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myEmpId) {
      toast({ title: 'Error', description: 'Employee ID not found. Please re-login.', variant: 'destructive' });
      return;
    }
    if (!leaveType || !startDate || !endDate || !reason) {
      toast({ title: 'Validation', description: 'All fields are required.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('hrms_leave_requests').insert([
      { employee_id: myEmpId, leave_type: leaveType, start_date: startDate, end_date: endDate, reason, status: 'Pending' }
    ]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Leave request submitted successfully.' });
      setLeaveType(''); setStartDate(''); setEndDate(''); setReason('');
      fetchLeaves();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('hrms_leave_requests').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Leave request ${newStatus.toLowerCase()}.` });
      fetchLeaves();
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
          <Shield className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white">Leave Management</h1>
          <p className="text-white/50 mt-1">{isHRMSEmployee ? 'Apply for leaves and check status.' : 'Review and manage employee leave requests.'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {isHRMSEmployee && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-500" /> Apply for Leave
              </h2>
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/70 ml-1">Leave Type</label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger className="w-full bg-black/40 border-white/10 text-white h-12 rounded-xl">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                      <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70 ml-1">Start Date</label>
                    <Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70 ml-1">End Date</label>
                    <Input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/70 ml-1">Reason</label>
                  <Input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Why do you need this leave?" className="bg-black/40 border-white/10 text-white h-12 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl mt-4">
                  Submit Request
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className={isHRMSEmployee ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl h-full min-h-[400px]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              {isHRMSEmployee ? 'My Leave History' : 'All Leave Requests'}
            </h2>

            {loading ? (
               <div className="text-center py-10 text-white/50">Loading...</div>
            ) : leaves.length === 0 ? (
               <div className="text-center py-20 text-white/30 border border-white/5 border-dashed rounded-2xl">
                 No leave requests found.
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {leaves.map((l) => (
                    <div key={l.id} className="bg-black/20 border border-white/5 rounded-2xl p-5 hover:bg-white/5 hover:border-purple-500/30 transition-all flex flex-col gap-4">
                      {/* Top: Employee Info or Leave Type */}
                      <div className="flex justify-between items-start">
                        {!isHRMSEmployee ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex shrink-0 items-center justify-center border border-purple-500/30">
                              <span className="text-sm font-black text-purple-400">{l.hrms_employees?.name?.charAt(0) || 'U'}</span>
                            </div>
                            <div>
                              <div className="font-bold text-white leading-tight">{l.hrms_employees?.name}</div>
                              <div className="text-xs text-white/50">{l.hrms_employees?.designation}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <Clock className="w-4 h-4 text-purple-400" />
                             </div>
                             <span className="font-bold text-white text-lg">My Request</span>
                          </div>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          l.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                          l.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                          'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}>
                          {l.status}
                        </span>
                      </div>

                      {/* Middle: Details */}
                      <div className="bg-black/40 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                           <div>
                              <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Leave Type</div>
                              <div className="text-purple-400 font-bold">{l.leave_type}</div>
                           </div>
                           <div className="text-right">
                              <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Duration</div>
                              <div className="text-white/80 font-medium text-sm">
                                {format(new Date(l.start_date), 'MMM dd')} - {format(new Date(l.end_date), 'MMM dd, yyyy')}
                              </div>
                           </div>
                        </div>
                        <div>
                           <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Reason</div>
                           <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">{l.reason}</p>
                        </div>
                      </div>

                      {/* Bottom: Actions */}
                      {!isHRMSEmployee && l.status === 'Pending' && (
                        <div className="flex gap-3 mt-1">
                          <Button 
                            onClick={() => handleUpdateStatus(l.id, 'Approved')} 
                            className="flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 h-12 rounded-xl transition-all font-bold"
                          >
                            <Check className="w-5 h-5 mr-2" /> Approve
                          </Button>
                          <Button 
                            onClick={() => handleUpdateStatus(l.id, 'Rejected')} 
                            className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 h-12 rounded-xl transition-all font-bold"
                          >
                            <X className="w-5 h-5 mr-2" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
