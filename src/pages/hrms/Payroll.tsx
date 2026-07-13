import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Calculator, Check, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function Payroll() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isHRMSEmployee = userRole === 'hrms_employee';
  const myEmpId = localStorage.getItem('kwsb_hrms_emp_id');

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);

  // Admin Payroll Generation State
  const [month, setMonth] = useState(format(new Date(), 'MM'));
  const [year, setYear] = useState(format(new Date(), 'yyyy'));
  const [deductions, setDeductions] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isHRMSEmployee) {
      fetchMyPayslips();
    } else {
      fetchEmployeesAndPayroll();
    }
  }, [month, year, isHRMSEmployee]);

  const fetchMyPayslips = async () => {
    setLoading(true);
    if (!myEmpId) return;
    const { data, error } = await supabase
      .from('hrms_payroll')
      .select('*, hrms_employees(name, designation)')
      .eq('employee_id', myEmpId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (data) setPayrolls(data);
    setLoading(false);
  };

  const fetchEmployeesAndPayroll = async () => {
    setLoading(true);
    // Fetch active employees
    const { data: emps } = await supabase.from('hrms_employees').select('*');
    
    // Fetch existing payrolls for selected month/year
    const { data: existingPayrolls } = await supabase
      .from('hrms_payroll')
      .select('*')
      .eq('month', parseInt(month))
      .eq('year', parseInt(year));

    if (emps) setEmployees(emps);
    if (existingPayrolls) setPayrolls(existingPayrolls);
    setLoading(false);
  };

  const handleGeneratePayroll = async (empId: string, basicSalary: number) => {
    const deductionAmount = deductions[empId] || 0;
    const netSalary = basicSalary - deductionAmount;

    const { error } = await supabase.from('hrms_payroll').insert([
      {
        employee_id: empId,
        month: parseInt(month),
        year: parseInt(year),
        basic_salary: basicSalary,
        deductions: deductionAmount,
        net_salary: netSalary,
        status: 'Processed'
      }
    ]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Payroll generated successfully!' });
      fetchEmployeesAndPayroll(); // Refresh
    }
  };

  const handleDeductionChange = (empId: string, val: string) => {
    const num = parseInt(val) || 0;
    setDeductions(prev => ({ ...prev, [empId]: num }));
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
          <Wallet className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white">Payroll System</h1>
          <p className="text-white/50 mt-1">
            {isHRMSEmployee ? 'View and download your monthly payslips.' : 'Generate and manage employee salaries.'}
          </p>
        </div>
      </div>
      
      {isHRMSEmployee ? (
        // Employee View
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8 backdrop-blur-md shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" /> My Payslips
          </h2>
          
          {loading ? (
             <div className="text-center py-10 text-white/50">Loading...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-20 text-white/30 border border-white/5 border-dashed rounded-2xl">
              No payslips found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payrolls.map((p) => (
                <div key={p.id} className="bg-black/40 border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-white">{new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                      <p className="text-emerald-400 text-sm font-bold mt-1">Status: {p.status}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl">
                      <Download className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Basic Salary</span>
                      <span className="text-white font-medium">Rs. {p.basic_salary?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Deductions</span>
                      <span className="text-red-400 font-medium">- Rs. {p.deductions?.toLocaleString()}</span>
                    </div>
                    <div className="h-px w-full bg-white/10 my-2"></div>
                    <div className="flex justify-between">
                      <span className="text-white font-bold">Net Salary</span>
                      <span className="text-orange-400 font-black text-lg">Rs. {p.net_salary?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Admin View
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-500" />
              Generate Payroll
            </h2>
            
            <div className="flex items-center gap-4 bg-black/40 p-2 border border-white/10 rounded-xl">
              <select 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent border-none text-white outline-none cursor-pointer px-2"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1} className="bg-slate-900">{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
              <div className="h-6 w-px bg-white/20"></div>
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="bg-transparent border-none text-white outline-none cursor-pointer px-2"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="bg-slate-900">{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {employees.map((emp) => {
              const existing = payrolls.find(p => p.employee_id === emp.id);
              const isProcessed = !!existing;
              
              const deduc = isProcessed ? existing.deductions : (deductions[emp.id] || 0);
              const net = isProcessed ? existing.net_salary : (emp.basic_salary - deduc);

              return (
                <div key={emp.id} className={`border border-white/5 rounded-2xl p-5 hover:border-orange-500/30 transition-all flex flex-col gap-4 ${isProcessed ? 'bg-emerald-500/5' : 'bg-black/20 hover:bg-white/5'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex shrink-0 items-center justify-center border border-orange-500/30">
                        <span className="text-lg font-black text-orange-400">{emp.name?.charAt(0) || 'U'}</span>
                      </div>
                      <div>
                        <div className="font-bold text-white leading-tight">{emp.name}</div>
                        <div className="text-xs text-white/50">{emp.designation}</div>
                      </div>
                    </div>
                    {isProcessed ? (
                      <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5" /> Processed
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-white/40 text-xs font-bold bg-black/40 px-3 py-1 rounded-full border border-white/10">
                        Pending
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 bg-black/40 rounded-xl p-3">
                     <div className="col-span-1">
                        <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Basic</div>
                        <div className="text-white/80 font-medium text-sm">Rs. {emp.basic_salary?.toLocaleString()}</div>
                     </div>
                     <div className="col-span-1 border-l border-white/5 pl-2">
                        <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Deductions</div>
                        {isProcessed ? (
                           <div className="text-red-400 font-medium text-sm">Rs. {existing.deductions?.toLocaleString()}</div>
                        ) : (
                           <Input 
                             type="number" 
                             min="0"
                             value={deductions[emp.id] || ''} 
                             onChange={(e) => handleDeductionChange(emp.id, e.target.value)}
                             placeholder="Amount..."
                             className="h-7 w-full bg-black/40 border-white/10 text-red-400 font-medium text-sm px-2 py-0"
                           />
                        )}
                     </div>
                     <div className="col-span-1 border-l border-white/5 pl-2 text-right">
                        <div className="text-[10px] text-orange-500/70 uppercase font-bold tracking-wider mb-1">Net Salary</div>
                        <div className="text-orange-400 font-bold text-sm">Rs. {net?.toLocaleString()}</div>
                     </div>
                  </div>

                  {!isProcessed && (
                    <Button 
                      onClick={() => handleGeneratePayroll(emp.id, emp.basic_salary)}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold rounded-xl h-12 shadow-[0_0_15px_rgba(234,88,12,0.3)] transition-all hover:scale-[1.02]"
                    >
                      <Wallet className="w-5 h-5 mr-2" /> Generate Payroll
                    </Button>
                  )}
                </div>
              )
            })}
            {employees.length === 0 && !loading && (
              <div className="col-span-full text-center py-16 bg-black/20 rounded-xl border border-white/5 border-dashed">
                 <p className="text-white/50">No active employees found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}