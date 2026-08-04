import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  History,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  UserCheck,
  FileText,
  Building,
  FolderTree,
  MapPin,
  Home,
  Bell,
  Settings
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { MobileMenu } from '@/components/MobileMenu';

export default function PublicTracking() {
  const params = useParams();
  const diaryNo = params.diaryNo;
  const receivingNo = params['*'];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const EXPO_OUT = [0.16, 1, 0.3, 1] as any;

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white flex justify-center overflow-hidden font-sans">
      
      {/* Mobile Device Container */}
      <div className="relative w-full max-w-md mx-auto flex flex-col h-screen bg-white">
          
        {/* Status Bar space */}
        <div className="h-6 w-full bg-white z-40 shrink-0"></div>

        {/* Top Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: EXPO_OUT }}
          className="bg-transparent px-5 py-3 flex justify-between items-center z-10 shrink-0"
        >
          <div className="flex items-center gap-3">
            {user ? (
              <MobileMenu>
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-[1.25rem] flex items-center justify-center shadow-sm cursor-pointer" onClick={() => navigate('/track')}>
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </div>
              </MobileMenu>
            ) : (
              <div className="w-10 h-10 bg-white border border-slate-100 rounded-[1.25rem] flex items-center justify-center shadow-sm cursor-pointer" onClick={() => navigate('/track')}>
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </div>
            )}
            <div className="flex flex-col justify-center cursor-pointer" onClick={() => navigate('/track')}>
              <h2 className="text-[13px] font-black text-slate-800 leading-tight">KW&SC</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">File Details</p>
            </div>
          </div>
          <div className="relative">
            {user ? (
              <div className="bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center text-slate-600 [&_button]:w-10 [&_button]:h-10 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:bg-transparent [&_button]:border-none [&_button]:shadow-none [&_svg]:w-5 [&_svg]:h-5">
                <NotificationDropdown />
              </div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="w-10 h-10 bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center text-slate-600 relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-5 pb-10">
          
          <div className="space-y-6">
            
            {/* Hero Status Banner */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: EXPO_OUT }} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verified</span>
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                {record?.subject}
              </h2>

              <div className="mt-6 flex gap-4">
                <div className="flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diary No</p>
                  <p className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 inline-block">
                    {record?.cfo_diary_number || "---"}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Receiving</p>
                  <p className="text-sm font-black text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 inline-block">
                    {record?.receiving_number || "---"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Application Details */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EXPO_OUT }} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Details
              </h3>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><FolderTree className="w-3 h-3" /> Category</p>
                  <p className="text-[13px] font-bold text-slate-800 capitalize">
                    {record?.mainCategory?.replace(/_/g, ' ')}
                    {record?.subCategory && ` / ${record.subCategory.replace(/_/g, ' ')}`}
                  </p>
                </div>

                {record?.department_number && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Building className="w-3 h-3" /> Dept No</p>
                    <p className="text-[13px] font-bold text-slate-800">{record.department_number}</p>
                  </div>
                )}

                {record?.handover_person_name && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Owner</p>
                    <p className="text-[13px] font-bold text-slate-800">{record.handover_person_name}</p>
                  </div>
                )}

                {record?.amount > 0 && (
                  <div className="col-span-2 bg-emerald-50 rounded-[1.25rem] p-4 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest mb-0.5">Net Amount Verified</p>
                      <p className="text-lg font-black text-emerald-700 tracking-tight">PKR {record?.amount?.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Horizontal Progress Bar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: EXPO_OUT }} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Current Status
              </h3>
              
              <div className="relative pt-2 pb-6">
                {/* Progress Line */}
                <div className="absolute top-[18px] left-0 w-full h-1 bg-slate-100 rounded-full"></div>
                <div className="absolute top-[18px] left-0 w-2/3 h-1 bg-blue-600 rounded-full"></div>

                <div className="relative flex justify-between">
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 border-2 border-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-center absolute top-10">
                      <p className="text-[9px] font-black text-slate-900 uppercase">Received</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 border-2 border-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-center absolute top-10">
                      <p className="text-[9px] font-black text-slate-900 uppercase">In-Process</p>
                    </div>
                  </div>

                  {/* Step 3 (Current) */}
                  <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg border-[3px] border-blue-600 relative">
                      <div className="absolute -inset-2 bg-blue-600/20 rounded-full animate-ping"></div>
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="text-center absolute top-10 w-20 -ml-6">
                      <p className="text-[9px] font-black text-blue-600 uppercase">Location</p>
                      <p className="text-[9px] font-bold text-slate-800 mt-0.5 uppercase">{record?.forward_to || 'Pending'}</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center border-2 border-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-center absolute top-10">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Done</p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>

            {/* History Timeline */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease: EXPO_OUT }} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" /> Activity Log
              </h3>
              
              <div className="space-y-4">
                {record?.history && record.history.length > 0 ? (
                  <div className="relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-[1px] before:bg-slate-200">
                    {record.history.map((step: any, i: number) => (
                      <div key={i} className="relative flex items-start gap-4 mb-4">
                        <div className="w-5 h-5 rounded-full border-[3px] border-white bg-blue-600 shrink-0 z-10 mt-1"></div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{step.processed_by}</span>
                            <span className="text-[9px] font-bold text-slate-400">{new Date(step.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium">"{step.remarks}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No history recorded yet</p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Bottom Tab Bar */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EXPO_OUT }}
          className="h-24 bg-white border-t border-slate-100 flex justify-around items-center px-4 pb-6 z-20 shrink-0"
        >
          {[
            { icon: Home, label: "Home", color: "text-slate-400", route: "/mobile-app" },
            { icon: FileText, label: "Records", color: "text-blue-600", route: "/track" }
          ].map((item, i) => (
            <motion.div key={i} onClick={() => navigate(item.route)} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center gap-1.5 ${item.color} cursor-pointer`}>
              <item.icon className={`w-6 h-6 ${i === 1 ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] font-extrabold">{item.label}</span>
            </motion.div>
          ))}
          
          {/* Center Floating Button */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/mobile-app')}
            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_12px_24px_rgba(37,99,235,0.4)] -mt-12 cursor-pointer relative z-30"
          >
            <QrCode className="w-7 h-7" />
          </motion.div>

          {[
            { icon: Bell, label: "Alerts", color: "text-slate-400", route: "#" },
            { icon: Settings, label: "Profile", color: "text-slate-400", route: user ? "/profile" : "/login" }
          ].map((item, i) => (
            <motion.div key={i} onClick={() => item.route !== "#" && navigate(item.route)} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center gap-1.5 ${item.color} cursor-pointer`}>
              <item.icon className="w-6 h-6" />
              <span className="text-[11px] font-extrabold">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
