import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Package, ShieldCheck, ArrowRight, Loader2, Mail, Phone, MapPin as MapPinIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function TrackingPortal() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col relative overflow-hidden text-slate-200">
      
      {/* Background Graphic (Subtle, professional) */}
      <div className="absolute top-0 inset-x-0 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] -z-10 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="w-full z-50 px-6 py-6 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/kwsc-logo.png" alt="KW&SC Logo" className="h-10 w-10 object-contain" />
            <div>
              <div className="font-black text-xl tracking-tight text-white leading-none">KW&SC</div>
              <div className="text-[10px] font-bold text-blue-400 tracking-widest uppercase mt-0.5">Portal</div>
            </div>
          </div>
          <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-full shadow-lg shadow-blue-900/20">
            Login to Portal
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center pt-20 pb-20 px-4 relative z-10">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Track Your Application</h2>
          <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto font-medium">Enter your Tracking ID, Receiving Number, or CFO Diary No. to check the live status of your file.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full max-w-2xl">
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 relative">
              <div className="relative flex-1">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. KWSC-2026-12345"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 bg-slate-950 border border-slate-800 rounded-2xl text-lg font-bold text-white focus:bg-slate-950 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-500 shadow-inner"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSearching}
                className="w-full md:w-auto h-16 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Track Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pt-6 border-t border-white/10 space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Select a File to View</h3>
                {searchResults.map((res, idx) => (
                  <div 
                    key={idx}
                    onClick={() => navigate(`/public-track/${res.cfo_diary_number}/${res.receiving_number}`)}
                    className="p-4 rounded-xl border border-white/5 bg-slate-950 hover:bg-slate-800 hover:border-blue-500/50 cursor-pointer transition-all group flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md uppercase border border-blue-500/20">{res.tracking_id || "NO-ID"}</span>
                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1"><MapPin size={10}/> {res.inward_date}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-200 line-clamp-2 mt-1">{res.subject}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-semibold text-slate-500">Receiving: {res.receiving_number}</span>
                      <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {searchResults.length === 0 && (
              <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">Official & Secure</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Your file status is fetched directly from the central database.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">Live Tracking</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">See exact department locations and approval timestamps instantly.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Footer (Copied from Landing Page) */}
      <footer className="bg-slate-950 text-white border-t border-white/10 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center border-b border-white/10 pb-8 mb-8">
            <div className="flex items-center space-x-4">
              <img src="/kwsc-logo.png" alt="KW&SC Logo" className="w-12 h-12 object-contain" />
              <div>
                <h4 className="text-xl font-bold tracking-tight">Karachi Water & Sewerage Corporation</h4>
                <p className="text-slate-400 text-sm">One Window Facilitation Portal</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>© 2026 KW&SC. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
