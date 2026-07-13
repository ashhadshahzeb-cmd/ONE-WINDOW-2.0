import React, { useState, useEffect } from 'react';
import { Users, Activity, Shield, Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Megaphone, Plus } from 'lucide-react';

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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/5 border border-white/10 flex items-center justify-center backdrop-blur-md relative overflow-hidden shrink-0 shadow-lg shadow-blue-500/10">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse"></div>
          <Users className="w-7 h-7 text-blue-400 relative z-10" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">HRMS Dashboard</h1>
          <p className="text-white/50 mt-1 text-sm font-medium">Welcome to the Human Resource Management System.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Employees Card */}
        <Link to="/hrms/employees">
          <div className="bg-[#09090b]/50 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/[0.02] rounded-3xl p-6 transition-all duration-500 group h-full flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-blue-500/10 border border-blue-500/20 shadow-inner">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">Employees</h3>
              <p className="text-white/40 text-sm mt-1">Manage personnel</p>
            </div>
            {!isHRMSEmployee && (
              <div className="mt-6 flex items-end justify-between relative z-10">
                <span className="text-4xl font-black text-white tracking-tighter">{stats.employees}</span>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Attendance Card */}
        <Link to="/hrms/attendance">
          <div className="bg-[#09090b]/50 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/[0.02] rounded-3xl p-6 transition-all duration-500 group h-full flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">Attendance</h3>
              <p className="text-white/40 text-sm mt-1">{isHRMSEmployee ? 'Mark daily check-in' : 'Today\'s presence'}</p>
            </div>
            {!isHRMSEmployee && (
              <div className="mt-6 flex items-end justify-between relative z-10">
                <span className="text-4xl font-black text-white tracking-tighter">{stats.presentToday}</span>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Leaves Card */}
        <Link to="/hrms/leaves">
          <div className="bg-[#09090b]/50 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/[0.02] rounded-3xl p-6 transition-all duration-500 group h-full flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-purple-500/10 border border-purple-500/20 shadow-inner">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Leaves</h3>
              <p className="text-white/40 text-sm mt-1">{isHRMSEmployee ? 'My applications' : 'Pending requests'}</p>
            </div>
            <div className="mt-6 flex items-end justify-between relative z-10">
              <span className="text-4xl font-black text-white tracking-tighter">{isHRMSEmployee ? empStats.myLeaves : stats.pendingLeaves}</span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </Link>

        {/* Payroll Card */}
        <Link to="/hrms/payroll">
          <div className="bg-[#09090b]/50 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/[0.02] rounded-3xl p-6 transition-all duration-500 group h-full flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-orange-500/10 border border-orange-500/20 shadow-inner">
                <Wallet className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">Payroll</h3>
              <p className="text-white/40 text-sm mt-1">{isHRMSEmployee ? 'My payslips' : 'Processed this month'}</p>
            </div>
            <div className="mt-6 flex items-end justify-between relative z-10">
              <span className="text-4xl font-black text-white tracking-tighter">{isHRMSEmployee ? empStats.myPayslips : stats.payrollProcessed}</span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </Link>

      </div>

      {/* Notice Board Section */}
      <div className="bg-[#09090b]/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden mt-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Megaphone className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Notice Board</h2>
              <p className="text-white/40 text-sm">Latest updates and announcements</p>
            </div>
          </div>
          
          {!isHRMSEmployee && (
            <Button 
              onClick={() => setShowNewNoticeForm(!showNewNoticeForm)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              <Plus className="w-4 h-4 mr-2" /> Post Announcement
            </Button>
          )}
        </div>

        {showNewNoticeForm && !isHRMSEmployee && (
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 mb-6 space-y-4 relative z-10 animate-in fade-in slide-in-from-top-2">
            <Input 
              placeholder="Announcement Title" 
              value={newNoticeTitle}
              onChange={(e) => setNewNoticeTitle(e.target.value)}
              className="bg-black/20 border-white/10 text-white"
            />
            <textarea 
              placeholder="Write the details here..." 
              value={newNoticeContent}
              onChange={(e) => setNewNoticeContent(e.target.value)}
              className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowNewNoticeForm(false)} className="text-white/60 hover:text-white">Cancel</Button>
              <Button onClick={handlePostNotice} className="bg-primary hover:bg-primary/90 text-white">Post Now</Button>
            </div>
          </div>
        )}

        <div className="space-y-4 relative z-10">
          {announcements.length === 0 ? (
            <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5 border-dashed">
              <Bell className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No recent announcements</p>
            </div>
          ) : (
            announcements.map((notice) => (
              <div key={notice.id} className="bg-black/20 hover:bg-white/5 border border-white/5 rounded-xl p-5 transition-colors group">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{notice.title}</h3>
                  <span className="text-xs text-white/30 whitespace-nowrap bg-black/40 px-2 py-1 rounded-md">
                    {format(new Date(notice.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{notice.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
