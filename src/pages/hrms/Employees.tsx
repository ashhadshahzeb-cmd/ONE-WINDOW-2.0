import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Users, Briefcase, Building, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function Employees() {
  const { userRole } = useAuth();
  const isHRMSEmployee = userRole === 'hrms_employee';
  const { toast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [joinDate, setJoinDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [shifts, setShifts] = useState<any[]>([]);

  useEffect(() => {
    fetchShifts();
    if (userRole !== undefined) {
      fetchEmployees();
    }
  }, [userRole]);

  const fetchShifts = async () => {
    const { data, error } = await supabase.from('hrms_shifts').select('*');
    if (!error && data) {
      setShifts(data);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    let query = supabase
      .from('hrms_employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (userRole === 'hrms_employee') {
      const empId = localStorage.getItem('kwsb_hrms_emp_id');
      query = query.eq('id', empId);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department || !designation || !basicSalary || !joinDate || !email || !password) {
      toast({ title: 'Validation Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('hrms_employees').insert([
      {
        name,
        email,
        password,
        department,
        designation,
        basic_salary: Number(basicSalary),
        join_date: joinDate,
        shift_id: selectedShift || null,
      }
    ]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Employee added successfully!' });
      // Reset form
      setName('');
      setDepartment('');
      setDesignation('');
      setBasicSalary('');
      setJoinDate(format(new Date(), 'yyyy-MM-dd'));
      setEmail('');
      setPassword('');
      setSelectedShift('');
      fetchEmployees();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            HRMS Employees
          </h1>
          <p className="text-white/50 mt-2">Manage your core HR staff roster independently.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Employee Form (Admin Only) */}
        {!isHRMSEmployee && (
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-fit shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600"></div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Add New Employee
          </h2>
          
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">Full Name</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. John Doe" 
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-2"><Building className="w-4 h-4"/> Department</Label>
              <Input 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
                placeholder="e.g. Finance, IT" 
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Designation</Label>
              <Input 
                value={designation} 
                onChange={(e) => setDesignation(e.target.value)} 
                placeholder="e.g. Senior Accountant" 
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Email Address (Login ID)</Label>
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="employee@kwsb.gov.pk" 
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Password</Label>
                <Input 
                  type="text"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Secret password" 
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Basic Salary</Label>
                <Input 
                  type="number"
                  value={basicSalary} 
                  onChange={(e) => setBasicSalary(e.target.value)} 
                  placeholder="0.00" 
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 flex items-center gap-2">Shift</Label>
                <select 
                  value={selectedShift} 
                  onChange={(e) => setSelectedShift(e.target.value)} 
                  className="w-full bg-black/20 border border-white/10 text-white rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="" className="bg-slate-900 text-white/50">No Shift</option>
                  {shifts.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 flex items-center gap-2"><Calendar className="w-4 h-4"/> Join Date</Label>
                <Input 
                  type="date"
                  value={joinDate} 
                  onChange={(e) => setJoinDate(e.target.value)} 
                  className="bg-black/20 border-white/10 text-white [color-scheme:dark]"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4 font-bold">
              <UserPlus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </form>
        </div>
        )}

        {/* Employees List */}
        <div className={isHRMSEmployee ? "lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl" : "lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl"}>
          <h2 className="text-xl font-bold text-white mb-6">Employee Roster</h2>
          
          {loading ? (
            <div className="text-center py-10 text-white/50 animate-pulse">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-20 bg-black/20 rounded-xl border border-white/5 border-dashed">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No employees found in HRMS.</p>
              <p className="text-white/30 text-sm mt-1">Use the form to add your first employee.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map(emp => (
                <div key={emp.id} className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-black/20 hover:bg-white/5 border border-white/5 hover:border-primary/50 rounded-xl transition-all duration-300 gap-4 sm:gap-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex shrink-0 items-center justify-center border border-primary/30">
                      <span className="text-lg font-black text-primary">{emp.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{emp.name}</h3>
                      <div className="text-xs text-white/40 mb-1 truncate max-w-[200px] sm:max-w-none">{emp.email || 'No email set'}</div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-white/50 mt-1">
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3"/> {emp.designation}</span>
                        <span className="flex items-center gap-1"><Building className="w-3 h-3"/> {emp.department}</span>
                        {emp.shift_id && (
                          <span className="flex items-center gap-1 text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {shifts.find(s => s.id === emp.shift_id)?.name || 'Shift Assigned'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                    <div className="font-mono text-primary font-bold text-lg sm:text-base">Rs. {Number(emp.basic_salary).toLocaleString()}</div>
                    <div className="text-xs text-white/40 mt-1">Joined: {format(new Date(emp.join_date), 'MMM d, yyyy')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
