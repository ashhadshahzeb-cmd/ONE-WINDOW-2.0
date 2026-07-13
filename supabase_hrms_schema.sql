-- HRMS Employees Table
CREATE TABLE IF NOT EXISTS public.hrms_employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    basic_salary NUMERIC NOT NULL DEFAULT 0,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HRMS Attendance Table
CREATE TABLE IF NOT EXISTS public.hrms_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.hrms_employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'Present', -- Present, Absent, Late, Half Day
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- HRMS Leave Requests Table
CREATE TABLE IF NOT EXISTS public.hrms_leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.hrms_employees(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL, -- Sick, Casual, Annual
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HRMS Payroll Table
CREATE TABLE IF NOT EXISTS public.hrms_payroll (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.hrms_employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- e.g., '2026-07'
    basic_salary NUMERIC NOT NULL,
    deductions NUMERIC NOT NULL DEFAULT 0,
    net_salary NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft', -- Draft, Paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month)
);

-- Enable RLS
ALTER TABLE public.hrms_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_payroll ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and write (for simplicity in this internal app)
CREATE POLICY "Allow authenticated read hrms_employees" ON public.hrms_employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert hrms_employees" ON public.hrms_employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update hrms_employees" ON public.hrms_employees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete hrms_employees" ON public.hrms_employees FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read hrms_attendance" ON public.hrms_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert hrms_attendance" ON public.hrms_attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update hrms_attendance" ON public.hrms_attendance FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read hrms_leave_requests" ON public.hrms_leave_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert hrms_leave_requests" ON public.hrms_leave_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update hrms_leave_requests" ON public.hrms_leave_requests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read hrms_payroll" ON public.hrms_payroll FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert hrms_payroll" ON public.hrms_payroll FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update hrms_payroll" ON public.hrms_payroll FOR UPDATE TO authenticated USING (true);
