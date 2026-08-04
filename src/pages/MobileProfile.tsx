import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User as UserIcon, LogOut, Shield, MapPin, Mail, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileProfile() {
  const EXPO_OUT = [0.16, 1, 0.3, 1] as any;
  const navigate = useNavigate();
  const { user, userRole, userName, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: Shield, label: 'Security & Privacy', route: '#' },
    { icon: CreditCard, label: 'Payment Methods', route: '#' },
    { icon: MapPin, label: 'Saved Addresses', route: '#' },
    { icon: Mail, label: 'Notifications', route: '#' },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 flex justify-center overflow-hidden font-sans">
      <div className="relative w-full max-w-md mx-auto flex flex-col h-screen overflow-hidden bg-slate-50">
        
        {/* Status Bar safe area */}
        <div className="h-8 w-full bg-blue-600 z-40"></div>

        {/* Header */}
        <div className="bg-blue-600 rounded-b-[2rem] shadow-sm pb-8 relative z-30">
          <div className="px-5 pt-4 pb-6 flex items-center justify-between">
            <motion.div 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/mobile-app')}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.div>
            <h1 className="text-white font-black text-lg">My Profile</h1>
            <div className="w-10 h-10"></div> {/* Spacer for center alignment */}
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: EXPO_OUT }}
            className="flex flex-col items-center mt-2"
          >
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-4 border-blue-500 flex items-center justify-center mb-4 overflow-hidden relative">
              <UserIcon className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-white">{userName || 'Citizen'}</h2>
            <p className="text-blue-200 font-bold text-sm mt-1 uppercase tracking-wider">{userRole || 'User'}</p>
            <p className="text-blue-100 text-xs mt-1">{user?.email}</p>
          </motion.div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 pt-8 pb-10 space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EXPO_OUT }}
            className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden"
          >
            {menuItems.map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${i !== menuItems.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EXPO_OUT }}
          >
            <button 
              onClick={handleSignOut}
              className="w-full h-14 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center gap-2 font-black border border-red-100 shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
