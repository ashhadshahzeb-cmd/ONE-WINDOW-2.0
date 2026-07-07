import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Package, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TrackingPortal() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Please enter a Tracking ID or Receiving Number");
      return;
    }

    setIsSearching(true);
    try {
      const q = trackingNumber.trim();
      const { data, error } = await supabase
        .from('file_tracking_records' as any)
        .select('cfo_diary_number, receiving_number')
        .or(`tracking_id.ilike.${q},receiving_number.ilike.${q},cfo_diary_number.ilike.${q}`)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        toast.success("Record found! Redirecting...");
        navigate(`/public-track/${data.cfo_diary_number}/${data.receiving_number}`);
      } else {
        toast.error("No record found with this Tracking ID");
      }
    } catch (err: any) {
      console.error("Error searching record:", err);
      toast.error("An error occurred while tracking");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none"></div>

      {/* Header */}
      <div className="w-full bg-[#0f1115] px-6 py-4 flex items-center justify-between shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.15)]">
            <span className="text-[10px] font-black text-white tracking-widest leading-none text-center">KW<br/>SC</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-black tracking-tight uppercase leading-none">Public Tracking</h1>
            <p className="text-emerald-400/80 text-[10px] font-bold uppercase tracking-widest mt-1">One Window Facility</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg space-y-8 -mt-20">
          
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-xl shadow-emerald-500/5 border border-emerald-500/20">
              <MapPin className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter">Track Your File</h2>
            <p className="text-sm font-bold text-zinc-500 tracking-wide">Enter your Tracking ID, Receiving Number, or CFO Diary No. to check the real-time status of your file.</p>
          </div>

          <Card className="rounded-[30px] border-none shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
            <div className="p-1 bg-gradient-to-r from-emerald-500 to-primary"></div>
            <CardContent className="p-8">
              <form onSubmit={handleTrack} className="space-y-6">
                <div className="space-y-2 relative">
                  <div className="absolute top-4 left-4 text-zinc-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g. FT-2026-12345"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-zinc-100/50 border-zinc-200 rounded-2xl text-lg font-bold tracking-wider text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-zinc-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSearching}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 group"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Track Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl">
                  <Package className="w-8 h-8 text-zinc-400" />
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Real-time</h4>
                    <p className="text-xs font-bold text-zinc-700">Status Updates</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl">
                  <ShieldCheck className="w-8 h-8 text-zinc-400" />
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Secure</h4>
                    <p className="text-xs font-bold text-zinc-700">Verification</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Footer */}
      <div className="w-full p-6 text-center relative z-10">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">© 2026 Karachi Water Corporation</p>
      </div>
    </div>
  );
}
