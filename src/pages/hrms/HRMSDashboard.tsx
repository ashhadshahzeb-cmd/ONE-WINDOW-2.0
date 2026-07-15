import React, { useState, useEffect } from 'react';
import { Users, Activity, Shield, Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Megaphone, Plus, Trash2 } from 'lucide-react';

export default function HRMSDashboard() {
  const { userRole } = useAuth();
  const isHRMSEmployee = userRole === 'hrms_employee';
  const myEmpId = localStorage.getItem('kwsb_hrms_emp_id');
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showNewNoticeForm, setShowNewNoticeForm] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  const [stats, setStats] = useState({
    employees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    payrollProcessed: 0
  });

  const [empStats, setEmpStats] = useState({
    myLeaves: 0,
    myPayslips: 0
  });

  useEffect(() => {
    if (isHRMSEmployee) {
      fetchEmployeeStats();
    } else {
      fetchAdminStats();
    }
    fetchAnnouncements();

    const channel = supabase
      .channel('hrms-announcements-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hrms_announcements' }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isHRMSEmployee]);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('hrms_announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!error && data) {
      setAnnouncements(data);
    }
  };

  const handlePostNotice = async () => {
    if (!newNoticeTitle || !newNoticeContent) return;
    
    const { error } = await supabase.from('hrms_announcements').insert([{
      title: newNoticeTitle,
      message: newNoticeContent,
      type: 'Info'
    }]);

    if (!error) {
      toast({ title: 'Success', description: 'Announcement posted!' });
      setNewNoticeTitle('');
      setNewNoticeContent('');
      setShowNewNoticeForm(false);
      fetchAnnouncements();
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    const { error } = await supabase.from('hrms_announcements').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Deleted', description: 'Announcement deleted successfully.' });
      fetchAnnouncements();
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const fetchAdminStats = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [empCount, attCount, leaveCount, payCount] = await Promise.all([
      supabase.from('hrms_employees').select('id', { count: 'exact' }),
      supabase.from('hrms_attendance').select('id', { count: 'exact' }).eq('date', today).eq('status', 'Present'),
      supabase.from('hrms_leave_requests').select('id', { count: 'exact' }).eq('status', 'Pending'),
      supabase.from('hrms_payroll').select('id', { count: 'exact' }).eq('month', currentMonth).eq('year', currentYear),
    ]);

    setStats({
      employees: empCount.count || 0,
      presentToday: attCount.count || 0,
      pendingLeaves: leaveCount.count || 0,
      payrollProcessed: payCount.count || 0
    });
  };

  const fetchEmployeeStats = async () => {
    if (!myEmpId) return;
    const [leaveCount, payCount] = await Promise.all([
      supabase.from('hrms_leave_requests').select('id', { count: 'exact' }).eq('employee_id', myEmpId),
      supabase.from('hrms_payroll').select('id', { count: 'exact' }).eq('employee_id', myEmpId),
    ]);

    setEmpStats({
      myLeaves: leaveCount.count || 0,
      myPayslips: payCount.count || 0
    });
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* 🚀 HERO BENTO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Hero Card */}
        <div className="lg:col-span-2 relative bg-gradient-to-br from-[#09090b] to-[#121217] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col justify-center min-h-[340px] group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none group-hover:bg-blue-500/30 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none group-hover:bg-purple-500/30 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold backdrop-blur-md uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              HRMS Control Center
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              Good {getTimeOfDay()}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 animate-gradient-x">
                {isHRMSEmployee ? 'Team Member' : 'HR Manager'}
              </span>
            </h1>
            
            <p className="text-white/50 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
              {isHRMSEmployee 
                ? "Here's your daily summary. Keep track of your attendance, leaves, and payroll records seamlessly."
                : "Your central hub for managing personnel, tracking attendance, and handling payroll efficiently."}
            </p>
          </div>
        </div>

        {/* Quick Stats Column */}
        <div className="flex flex-col gap-6">
          <Link to="/hrms/attendance" className="flex-1">
            <div className="bg-gradient-to-br from-emerald-500/10 to-[#09090b] hover:from-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-[2.5rem] p-8 flex flex-col justify-between h-full transition-all duration-500 group shadow-lg shadow-emerald-500/5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                  <Activity className="text-emerald-400 w-7 h-7" />
                </div>
                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all border border-white/5 group-hover:border-emerald-500/30">
                  <ArrowRight className="text-white/40 w-5 h-5 group-hover:translate-x-0.5 group-hover:text-emerald-400 transition-all" />
                </div>
              </div>
              <div className="mt-8">
                <p className="text-emerald-400/60 font-bold text-xs mb-2 uppercase tracking-widest">{isHRMSEmployee ? 'Mark Attendance' : 'Today\'s Presence'}</p>
                <h3 className="text-6xl font-black text-white tracking-tighter">{stats.presentToday}</h3>
              </div>
            </div>
          </Link>

          <Link to="/hrms/employees" className="flex-1">
            <div className="bg-gradient-to-br from-blue-500/10 to-[#09090b] hover:from-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-[2.5rem] p-8 flex flex-col justify-between h-full transition-all duration-500 group shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                  <Users className="text-blue-400 w-7 h-7" />
                </div>
                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-all border border-white/5 group-hover:border-blue-500/30">
                  <ArrowRight className="text-white/40 w-5 h-5 group-hover:translate-x-0.5 group-hover:text-blue-400 transition-all" />
                </div>
              </div>
              <div className="mt-8">
                <p className="text-blue-400/60 font-bold text-xs mb-2 uppercase tracking-widest">Total Employees</p>
                <h3 className="text-6xl font-black text-white tracking-tighter">{stats.employees}</h3>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 🚀 BOTTOM BENTO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaves & Payroll Row */}
        <div className="grid grid-cols-2 gap-6 lg:col-span-1">
          <Link to="/hrms/leaves" className="block aspect-square">
            <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between h-full transition-all duration-500 group relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all"></div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 relative z-10 group-hover:scale-110 transition-transform">
                <Shield className="text-purple-400 w-6 h-6" />
              </div>
              <div className="relative z-10 mt-4">
                <p className="text-white/40 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-1">{isHRMSEmployee ? 'My Leaves' : 'Pending Leaves'}</p>
                <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">{isHRMSEmployee ? empStats.myLeaves : stats.pendingLeaves}</h3>
              </div>
            </div>
          </Link>
          
          <Link to="/hrms/payroll" className="block aspect-square">
            <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 hover:border-orange-500/40 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between h-full transition-all duration-500 group relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all"></div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 relative z-10 group-hover:scale-110 transition-transform">
                <Wallet className="text-orange-400 w-6 h-6" />
              </div>
              <div className="relative z-10 mt-4">
                <p className="text-white/40 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-1">{isHRMSEmployee ? 'My Payslips' : 'Processed Payroll'}</p>
                <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">{isHRMSEmployee ? empStats.myPayslips : stats.payrollProcessed}</h3>
              </div>
            </div>
          </Link>
        </div>

        {/* Notice Board */}
        <div className="lg:col-span-2 bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Notice Board</h2>
                <p className="text-white/40 text-sm font-medium">Company updates & announcements</p>
              </div>
            </div>
            
            {!isHRMSEmployee && (
              <Button 
                onClick={() => setShowNewNoticeForm(!showNewNoticeForm)}
                className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-bold transition-all shadow-lg shadow-white/10"
              >
                <Plus className="w-4 h-4 mr-2" /> Post Announcement
              </Button>
            )}
          </div>

          {showNewNoticeForm && !isHRMSEmployee && (
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 mb-8 space-y-4 relative z-10 animate-in fade-in slide-in-from-top-4">
              <Input 
                placeholder="Announcement Title" 
                value={newNoticeTitle}
                onChange={(e) => setNewNoticeTitle(e.target.value)}
                className="bg-white/5 border-white/10 text-white font-medium h-12 rounded-xl"
              />
              <textarea 
                placeholder="Write the details here..." 
                value={newNoticeContent}
                onChange={(e) => setNewNoticeContent(e.target.value)}
                className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 resize-none font-medium"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowNewNoticeForm(false)} className="text-white/60 hover:text-white rounded-xl">Cancel</Button>
                <Button onClick={handlePostNotice} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold px-8">Post Now</Button>
              </div>
            </div>
          )}

          <div className="space-y-3 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 bg-white/[0.02] rounded-2xl border border-white/[0.05] border-dashed">
                <Bell className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-white/40 font-medium text-sm">No recent announcements</p>
              </div>
            ) : (
              announcements.map((notice) => (
                <div key={notice.id} className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-5 transition-all duration-300 group">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{notice.title}</h3>
                    <div className="flex items-center gap-2 self-start">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
                        {format(new Date(notice.created_at), 'MMM d, yyyy')}
                      </span>
                      {!isHRMSEmployee && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-white/40 hover:text-red-400 hover:bg-red-400/10" 
                          onClick={() => handleDeleteNotice(notice.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap font-medium">{notice.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
