-- Run this in Supabase SQL Editor to create the Transfer Advice tables

CREATE TABLE IF NOT EXISTS public.transfer_advices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advice_no TEXT NOT NULL,
    date DATE NOT NULL,
    bank_name TEXT NOT NULL,
    subject TEXT DEFAULT 'TRANSFER ADVICE.',
    payment_method TEXT,
    payment_number TEXT,
    total_amount NUMERIC NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transfer_advice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_advice_id UUID REFERENCES public.transfer_advices(id) ON DELETE CASCADE,
    s_no INTEGER NOT NULL,
    transfer_amount NUMERIC NOT NULL,
    amount_in_words TEXT NOT NULL,
    ac_no_debit TEXT NOT NULL,
    ac_no_credit TEXT NOT NULL,
    in_respect_of TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (if enabled)
ALTER TABLE public.transfer_advices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_advice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users to read transfer_advices" ON public.transfer_advices FOR SELECT USING (true);
CREATE POLICY "Allow all authenticated users to insert transfer_advices" ON public.transfer_advices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all authenticated users to update transfer_advices" ON public.transfer_advices FOR UPDATE USING (true);

CREATE POLICY "Allow all authenticated users to read transfer_advice_items" ON public.transfer_advice_items FOR SELECT USING (true);
CREATE POLICY "Allow all authenticated users to insert transfer_advice_items" ON public.transfer_advice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all authenticated users to update transfer_advice_items" ON public.transfer_advice_items FOR UPDATE USING (true);
