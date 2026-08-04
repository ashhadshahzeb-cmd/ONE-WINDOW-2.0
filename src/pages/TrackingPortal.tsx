import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Package, ShieldCheck, ArrowRight, Loader2, Bell, Home, FileText, Settings, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { MobileMenu } from '@/components/MobileMenu';

export default function TrackingPortal() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const EXPO_OUT = [0.16, 1, 0.3, 1] as any;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Please enter a Tracking ID, Receiving Number, or your Name");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    try {
      const q = trackingNumber.trim();
      const { data, error } = await supabase
        .from('file_tracking_records' as any)
        .select('cfo_diary_number, receiving_number, subject, tracking_id, inward_date')
        .or(`tracking_id.ilike.%${q}%,receiving_number.ilike.%${q}%,cfo_diary_number.ilike.%${q}%,handover_person_name.ilike.%${q}%,received_from.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        if (data.length === 1) {
          toast.success("Record found! Redirecting...");
          navigate(`/public-track/${data[0].cfo_diary_number}/${data[0].receiving_number}`);
        } else {
          toast.success(`Found ${data.length} records`);
          setSearchResults(data);
        }
      } else {
        toast.error("No record found with this query");
      }
    } catch (err: any) {
      console.error("Error searching record:", err);
      toast.error("An error occurred while tracking");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center overflow-hidden font-sans">
      
      {/* Mobile Device Container - full width on mobile, max-md on desktop */}
      <div className="relative w-full max-w-md mx-auto flex flex-col h-screen">
          
        {/* Status Bar space */}
        <div className="h-6 w-full bg-white z-40"></div>

        {/* Top Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: EXPO_OUT }}
          className="bg-transparent px-5 py-3 flex justify-between items-center z-10 shrink-0"
        >
          <div className="flex items-center gap-3">
            {user ? (
              <MobileMenu />
            ) : (
              <div className="w-10 h-10 bg-white border border-slate-100 rounded-[1.25rem] flex items-center justify-center shadow-sm cursor-pointer" onClick={() => navigate('/mobile-app')}>
                <img src="/kwsc-logo.png" alt="KWSC Logo" className="w-7 h-7 object-contain" />
              </div>
            )}
            <div className="flex flex-col justify-center cursor-pointer" onClick={() => navigate('/mobile-app')}>
              <h2 className="text-[13px] font-black text-slate-800 leading-tight">KW&SC</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Tracking Portal</p>
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

        {/* Scrollable Area */}
        <div className="flex-1 p-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: EXPO_OUT }} className="mb-8 px-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Track Your File</h2>
            <p className="text-xs text-slate-500 mt-2 font-medium">Enter your Tracking ID, Receiving No, or CFO Diary No.</p>
          </motion.div>

          {/* Search / Track - Pill shaped with shadow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EXPO_OUT }}
            className="relative px-1 mb-6"
          >
            <form onSubmit={handleTrack} className="relative shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-full bg-white border border-slate-50 flex items-center">
              <div className="absolute left-5 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="e.g. KWSC-2026-12345" 
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 h-14 bg-transparent rounded-full pl-12 pr-14 text-sm font-bold text-slate-700 focus:outline-none placeholder-slate-400 uppercase placeholder:normal-case" 
              />
              <motion.button 
                type="submit"
                disabled={isSearching}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-1.5 w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </motion.button>
            </form>
          </motion.div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 space-y-3 px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select a File to View</h3>
              {searchResults.map((res, idx) => (
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx, ease: EXPO_OUT }}
                  key={idx}
                  onClick={() => navigate(`/public-track/${res.cfo_diary_number}/${res.receiving_number}`)}
                  className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] cursor-pointer group flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">{res.tracking_id || "NO-ID"}</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><MapPin size={10}/> {res.inward_date}</span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800 line-clamp-2 mt-1 leading-tight">{res.subject}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-400">Receiving: {res.receiving_number}</span>
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {searchResults.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 px-1">
              <div className="bg-slate-50 rounded-[2rem] p-6 flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-slate-800 mb-0.5">Official & Secure</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Status is fetched directly from the central KW&SC database.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-blue-50 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-slate-800 mb-0.5">Live Tracking</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">See exact department locations and approval timestamps instantly.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Bottom Tab Bar (Matching MobileDashboard) */}
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
