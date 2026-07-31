import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  History,
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
  FileSignature,
  Download,
  Search,
  MapPin,
  ChevronRight,
  Printer
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

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
            status: "In-Process", // Could be dynamic
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
          setRecord({
            cfo_diary_number: diaryNo,
            receiving_number: receivingNo,
            subject: "Sample File Tracking Record (Record Not Found in DB)",
            mainCategory: "employee",
            subCategory: "medical_case",
            status: "Unknown",
            forward_to: searchParams.get('sec') || "PROCESSING",
            history: [
              { date: new Date().toISOString(), processed_by: "One Window", remarks: "Application Received" },
              { date: new Date().toISOString(), processed_by: "Zone East", remarks: "Initial verification complete" }
            ]
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      
      {/* Top Navbar */}
      <div className="bg-slate-950 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/track')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <img src="/kwsc-logo.png" alt="KWSC Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none text-white">KW&SC</h1>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">File Tracking</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/track')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 rounded-full px-6 shadow-lg shadow-blue-900/20">
              <Search className="w-4 h-4" /> Track Another
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Details & Status */}
        <div className="flex-1 space-y-8">
          
          {/* Hero Status Banner */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <ShieldCheck className="w-48 h-48" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Active & Verified</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last updated today</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug max-w-2xl">
              {record?.subject}
            </h2>

            <div className="mt-8 flex flex-wrap gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CFO Diary No</p>
                <p className="text-lg font-black text-blue-600 font-mono bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 inline-block">
                  {record?.cfo_diary_number || "---"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Receiving No</p>
                <p className="text-lg font-black text-slate-700 font-mono bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 inline-block">
                  {record?.receiving_number || "---"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Horizontal Progress Bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" /> Current Location & Status
            </h3>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 w-full h-1.5 bg-slate-100 rounded-full"></div>
              <div className="absolute top-5 left-0 w-2/3 h-1.5 bg-blue-600 rounded-full"></div>

              <div className="relative flex justify-between">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center gap-3 z-10 w-1/4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-slate-900 uppercase">Received</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{record?.registration_date ? new Date(record.registration_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center gap-3 z-10 w-1/4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-slate-900 uppercase">In-Process</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{record?.history?.[0] ? new Date(record.history[0].date).toLocaleDateString() : 'Processing'}</p>
                  </div>
                </div>

                {/* Step 3 (Current) */}
                <div className="flex flex-col items-center gap-3 z-10 w-1/4">
                  <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg border-4 border-blue-600 relative">
                    <div className="absolute -inset-2 bg-blue-600/20 rounded-full animate-ping"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-blue-600 uppercase">Current Section</p>
                    <p className="text-[11px] font-bold text-slate-800 mt-1 bg-blue-50 px-2 py-1 rounded inline-block uppercase tracking-tight">{record?.forward_to || 'Pending'}</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center gap-3 z-10 w-1/4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center border-4 border-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-slate-400 uppercase">Completed</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Details Grid */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">Application Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><FolderTree className="w-3 h-3" /> Category</p>
                <p className="text-sm font-bold text-slate-800 capitalize">
                  {record?.mainCategory?.replace(/_/g, ' ')}
                  {record?.subCategory && ` / ${record.subCategory.replace(/_/g, ' ')}`}
                </p>
              </div>

              {record?.department_number && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Building className="w-3 h-3" /> Department No</p>
                  <p className="text-sm font-bold text-slate-800">{record.department_number}</p>
                </div>
              )}

              {record?.handover_person_name && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><UserCheck className="w-3 h-3" /> Assigned Owner</p>
                  <p className="text-sm font-bold text-slate-800">{record.handover_person_name}</p>
                </div>
              )}

              {record?.received_from && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ArrowLeft className="w-3 h-3" /> Received From</p>
                  <p className="text-sm font-bold text-slate-800">{record.received_from}</p>
                </div>
              )}

              {record?.file_purpose && (
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Purpose</p>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{record.file_purpose}</p>
                </div>
              )}

              {record?.amount > 0 && (
                <div className="sm:col-span-2 bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-0.5">Net Amount Verified</p>
                      <p className="text-xl font-black text-emerald-700 tracking-tight">PKR {record?.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-emerald-200" />
                </div>
              )}

            </div>
          </motion.div>

        </div>

        {/* Right Column: History & Verification */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-8">
          
          {/* Verification Card */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-white p-2 rounded-xl shrink-0 shadow-lg">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight mb-1">Official Digital Record</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Scan this QR code to verify the authenticity of this document directly on the KW&SC Portal.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Inward Date</span>
                <span className="text-white">{record?.inward_date ? new Date(record.inward_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Outward Date</span>
                <span className="text-white">{record?.outward_date ? new Date(record.outward_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span>Print Date</span>
                <span className="text-white">{record?.print_date ? new Date(record.print_date).toLocaleDateString() : new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>

          {/* History Timeline */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Activity Log
            </h3>
            
            <div className="space-y-6">
              {record?.history && record.history.length > 0 ? (
                <div className="relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
                  {record.history.map((step: any, i: number) => (
                    <div key={i} className="relative flex items-start gap-4 mb-6 group">
                      <div className="w-5 h-5 rounded-full border-[3px] border-white bg-blue-600 shadow-sm shrink-0 z-10 mt-1 group-hover:scale-125 transition-transform"></div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{step.processed_by}</span>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(step.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">"{step.remarks}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No history recorded yet</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-slate-900 text-slate-400 py-8 text-center text-xs font-bold uppercase tracking-widest mt-auto">
        <p>© 2026 Karachi Water & Sewerage Corporation • Finance Department</p>
      </div>

    </div>
  );
}
