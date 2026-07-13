import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  History,
  Calendar,
  User,
  Building2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  UserCheck,
  FileText,
  Building,
  MessageSquare,
  CalendarCheck,
  CalendarDays,
  FolderTree,
  FileSignature
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function PublicTracking() {
  const params = useParams();
  const diaryNo = params.diaryNo;
  const receivingNo = params['*'];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('file_tracking_records' as any)
          .select('*')
          .or(`cfo_diary_number.eq.${diaryNo},receiving_number.eq.${receivingNo}`)
          .maybeSingle();

        if (data) {
          setRecord({
            cfo_diary_number: data.cfo_diary_number,
            receiving_number: data.receiving_number,
            subject: data.subject,
            mainCategory: data.main_category,
            subCategory: data.sub_category,
            status: "In-Progress",
            amount: data.amount || 0,
            forward_to: data.mark_to,
            handover_person_name: data.handover_person_name,
            file_purpose: data.file_purpose,
            received_from: data.received_from,
            remarks: data.remarks,
            registration_date: data.created_at,
            outward_date: data.outward_date,
            print_date: data.print_date,
            inward_date: data.inward_date,
            date_of_sign: data.date_of_sign,
            department_number: data.employee_number,
            history: data.history || []
          });
        } else {
          // Fallback mockup if no record found (for local dev testing without DB)
          setRecord({
            cfo_diary_number: diaryNo,
            receiving_number: receivingNo,
            subject: "Sample File Tracking Record (Record Not Found in DB)",
            mainCategory: "employee",
            subCategory: "medical_case",
            status: "Unknown",
            forward_to: searchParams.get('sec') || "PROCESSING",
            history: []
          });
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [diaryNo, receivingNo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Verifying Record...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {/* Mobile-First Header */}
      <div className="bg-primary px-6 pt-12 pb-20 rounded-b-[40px] shadow-2xl relative overflow-hidden max-w-3xl mx-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="relative flex justify-between items-center mb-6">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.15)]">
            <span className="text-[9px] font-black text-white tracking-widest leading-none text-center">KW<br/>SC</span>
          </div>
        </div>

        <div className="relative text-center space-y-2">
          <h1 className="text-white text-2xl font-black tracking-tighter uppercase">Verified Record</h1>
          <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Karachi Water Corporation</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="px-6 -mt-12 relative max-w-3xl mx-auto">
        <Card className="rounded-[30px] border-none shadow-xl overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-emerald-500 to-primary"></div>
          <CardContent className="pt-8 space-y-8">
            {/* Status Badge */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border-4 border-emerald-500/5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-black text-zinc-800 uppercase tracking-tight">Active Status</h2>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 font-bold px-4 py-1 rounded-full uppercase text-[10px]">
                  In-Process / Verified
                </Badge>
              </div>
            </div>

            {/* Tracking Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-6 text-center border-2 border-primary/10 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-3xl"></div>
                <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">CFO Diary No</span>
                <p className="text-lg font-black text-zinc-800 font-mono mt-2 tracking-tighter">{record?.cfo_diary_number || "---"}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 text-center border-2 border-emerald-500/10 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-bl-3xl"></div>
                <span className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.2em]">Receiving No</span>
                <p className="text-lg font-black text-zinc-800 font-mono mt-2 tracking-tighter">{record?.receiving_number || "---"}</p>
              </div>
            </div>

            {/* File Info */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Subject</span>
                  <p className="text-sm font-bold text-zinc-800 leading-tight">{record?.subject}</p>
                </div>
              </div>

              {record?.file_purpose && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">File Purpose / Description</span>
                    <p className="text-sm font-bold text-zinc-800 leading-tight">{record.file_purpose}</p>
                  </div>
                </div>
              )}

              {record?.mainCategory && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 shrink-0">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Category</span>
                    <p className="text-sm font-bold text-zinc-800 leading-tight">
                      {record.mainCategory.replace(/_/g, ' ').toUpperCase()}
                      {record.subCategory && ` / ${record.subCategory.replace(/_/g, ' ').toUpperCase()}`}
                    </p>
                  </div>
                </div>
              )}

              {record?.department_number && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Department Number</span>
                    <p className="text-sm font-bold text-zinc-800 leading-tight">{record.department_number}</p>
                  </div>
                </div>
              )}

              {record?.handover_person_name && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Handover Person / Owner</span>
                    <p className="text-sm font-bold text-zinc-800 leading-tight">{record.handover_person_name}</p>
                  </div>
                </div>
              )}

              {record?.received_from && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Received From Section</span>
                    <p className="text-sm font-bold text-zinc-800 leading-tight">{record.received_from}</p>
                  </div>
                </div>
              )}

              {record?.remarks && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Remarks</span>
                    <p className="text-sm font-bold text-zinc-800 leading-tight">{record.remarks}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Current Section</span>
                  <p className="text-sm font-black text-blue-600 uppercase tracking-tight">{record?.forward_to}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Registration Date</span>
                    <p className="text-xs font-bold text-zinc-800">{record?.registration_date ? new Date(record.registration_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Outward Date</span>
                    <p className="text-xs font-bold text-zinc-800">{record?.outward_date ? new Date(record.outward_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                
                {record?.inward_date && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">Inward Date</span>
                      <p className="text-xs font-bold text-zinc-800">{new Date(record.inward_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {record?.date_of_sign && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                      <FileSignature className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">Date of Sign</span>
                      <p className="text-xs font-bold text-zinc-800">{new Date(record.date_of_sign).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {record?.print_date && (
                  <div className="flex items-start gap-3 col-span-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center text-zinc-600 shrink-0">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">Print Date</span>
                      <p className="text-xs font-bold text-zinc-800">{new Date(record.print_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {record?.amount > 0 && (
                <div className="flex items-start gap-4 mt-4 pt-4 border-t border-zinc-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Net Amount</span>
                    <p className="text-sm font-black text-emerald-600 tracking-tight">PKR {record?.amount?.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-6 pt-6 border-t border-zinc-100">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                <History className="w-4 h-4" /> Movement History
              </h3>

              <div className="space-y-6 ml-2 border-l-2 border-zinc-100 pl-6">
                {record?.history.map((step: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white"></div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black text-primary uppercase">{step.processed_by}</span>
                      <span className="text-[9px] font-bold text-zinc-400">{new Date(step.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium italic">"{step.remarks}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Section */}
            <div className="mt-8 p-6 bg-zinc-950 rounded-[30px] flex flex-col items-center gap-4 text-center">
              <div className="bg-white p-3 rounded-2xl shadow-xl shadow-primary/20 flex flex-col items-center">
                <div className="w-20 h-20">
                  <QrCode className="w-full h-full text-zinc-900" />
                </div>
                <span className="text-[8px] font-bold mt-2 text-zinc-600 uppercase text-center">Prepared by<br />Engineer Tariq Zamir</span>
              </div>
              <div>
                <p className="text-white text-sm font-black">Digital Authentication</p>
                <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">Scan to verify this document</p>
              </div>
            </div>

          </CardContent>
          <div className="bg-zinc-100 p-4 text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">© 2026 KWC Finance Department</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
