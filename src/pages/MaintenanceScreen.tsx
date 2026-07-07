import React from 'react';
import { Settings, Wrench, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function MaintenanceScreen() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />

      <Card className="max-w-lg w-full bg-[#0f1115]/80 backdrop-blur-xl border-orange-500/20 shadow-2xl z-10 animate-in fade-in zoom-in duration-500">
        <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center border-2 border-orange-500/30">
              <Settings className="w-12 h-12 text-orange-400 animate-[spin_4s_linear_infinite]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#0f1115] flex items-center justify-center border-2 border-orange-500/20">
              <Wrench className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight">System Maintenance</h1>
            <p className="text-white/60">
              We are currently performing scheduled maintenance to improve the system. 
              Please check back in a little while.
            </p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 w-full flex items-start gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-sm text-orange-300">
              Your data is completely safe. We are just upgrading our servers for a better experience.
            </div>
          </div>

          <Button 
            variant="outline" 
            className="border-white/10 text-white hover:bg-white/5 w-full mt-4"
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
          >
            Go Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
