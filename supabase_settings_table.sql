-- Create the table for global department user settings
CREATE TABLE IF NOT EXISTS public.department_users_settings (
    role_id TEXT PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    password TEXT,
    avatar_url TEXT,
    allow_override_dates BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS (but we will allow all authenticated and anon users to select/update for this custom auth logic)
ALTER TABLE public.department_users_settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to read
CREATE POLICY "Allow public read access on department_users_settings"
    ON public.department_users_settings
    FOR SELECT
    USING (true);

-- Allow anonymous and authenticated users to update
CREATE POLICY "Allow public update access on department_users_settings"
    ON public.department_users_settings
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow anonymous and authenticated users to insert (for initial seeding if needed)
CREATE POLICY "Allow public insert access on department_users_settings"
    ON public.department_users_settings
    FOR INSERT
    WITH CHECK (true);

-- Insert the default users to seed the table
INSERT INTO public.department_users_settings (email, password, role_id, display_name) VALUES
    ('admin@kwsb.gov.pk', 'admin', 'admin', 'SYSTEM ADMINISTRATOR'),
    ('cfo@kwsb.gov.pk', 'cfo@12345', 'cfo', 'CFO'),
    ('cia@kwsb.gov.pk', 'cia@12345', 'cia', 'CIA'),
    ('budget@kwsb.gov.pk', 'budget@12345', 'budget', 'BUDGET'),
    ('pension@kwsb.gov.pk', 'pension@12345', 'pension', 'PENSION'),
    ('fund@kwsb.gov.pk', 'fund@12345', 'fund', 'FUND'),
    ('audit1@kwsb.gov.pk', 'audit1@12345', 'internal_audit_1', 'INTERNAL AUDIT-1'),
    ('director.account@kwsb.gov.pk', 'da@12345', 'director_account', 'DIRECTOR ACCOUNT'),
    ('director.finance@kwsb.gov.pk', 'df@12345', 'director_finance', 'DIRECTOR FINANCE'),
    ('director.it@kwsb.gov.pk', 'dit@12345', 'director_it', 'DIRECTOR IT'),
    ('subcfo@kwsb.gov.pk', 'sub@12345', 'sub_cfo', 'ASST. CFO'),
    ('books@kwsb.gov.pk', 'books@12345', 'books', 'BOOKS'),
    ('establishment@kwsb.gov.pk', 'est@12345', 'establishment', 'ESTABLISHMENT'),
    ('director.audit@kwsb.gov.pk', 'daudit@12345', 'director_audit', 'DIRECTOR AUDIT'),
    ('audit2@kwsb.gov.pk', 'audit2@12345', 'internal_audit_2', 'INTERNAL AUDIT-2'),
    ('law@kwsb.gov.pk', 'law@12345', 'law_department', 'LAW DEPARTMENT'),
    ('chro@kwsb.gov.pk', 'chro@12345', 'chro', 'CHRO'),
    ('asst.cfo1@kwsb.gov.pk', 'acfo1@12345', 'sub_cfo_1', 'ASST. CFO-1'),
    ('asst.cfo2@kwsb.gov.pk', 'acfo2@12345', 'sub_cfo_2', 'ASST. CFO-2'),
    ('asst.cfo3@kwsb.gov.pk', 'acfo3@12345', 'sub_cfo_3', 'ASST. CFO-3'),
    ('asst.cfo4@kwsb.gov.pk', 'acfo4@12345', 'sub_cfo_4', 'ASST. CFO-4'),
    ('asst.cfo5@kwsb.gov.pk', 'acfo5@12345', 'sub_cfo_5', 'ASST. CFO-5'),
    ('mdoffice@kwsb.gov.pk', 'md@12345', 'md_office', 'MD OFFICE'),
    ('emp1@kwsb.gov.pk', 'emp1@12345', 'emp_operator', 'EMPLOYEE REGISTRY 1'),
    ('transfer@kwsb.gov.pk', 'transfer@12345', 'transfer_user', 'TRANSFER ADVICE'),
    ('emp2@kwsb.gov.pk', 'emp2@12345', 'emp_operator', 'EMPLOYEE REGISTRY 2'),
    ('viewer@kwsb.gov.pk', 'viewer@12345', 'file_viewer', 'FILE VIEWER')
ON CONFLICT (role_id) DO NOTHING;
