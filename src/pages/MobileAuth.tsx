import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function MobileAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { localSignIn } = useAuth();
  
  const EXPO_OUT = [0.16, 1, 0.3, 1] as any;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const localResult = await localSignIn(email, password);
        if (localResult.success) {
          toast.success('Welcome! Login successful.');
          navigate('/mobile-app');
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(localResult.error || error.message);
          return;
        }
        
        navigate('/mobile-app');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name }
          }
        });
        
        if (error) throw error;
        toast.success('Registration successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center overflow-hidden font-sans">
      <div className="relative w-full max-w-md mx-auto flex flex-col h-screen overflow-hidden">
        
        {/* Status Bar safe area */}
        <div className="h-8 w-full bg-transparent z-40"></div>

        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EXPO_OUT }}
          className="absolute top-10 left-5 z-50"
        >
          <div 
            onClick={() => navigate('/mobile-app')}
            className="w-10 h-10 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col px-6 pt-16 pb-8 overflow-y-auto">
          
          {/* Logo & Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EXPO_OUT }}
            className="flex flex-col items-center mb-10 mt-8"
          >
            <div className="w-20 h-20 bg-white border border-slate-100 shadow-sm rounded-[1.5rem] flex items-center justify-center mb-5">
              <img src="/kwsc-logo.png" alt="KWSC Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-2 text-center">
              {isLogin ? 'Sign in to access your portal' : 'Join KW&SC Citizen Portal'}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form 
            onSubmit={handleAuth}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EXPO_OUT }}
            className="space-y-4 flex-1"
          >
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative mb-4">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-[1.25rem] pl-14 pr-5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-[1.25rem] pl-14 pr-5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-[1.25rem] pl-14 pr-14 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isLogin && (
              <div className="flex justify-end pt-1">
                <span className="text-xs font-bold text-blue-600 cursor-pointer">Forgot Password?</span>
              </div>
            )}

            <div className="pt-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full h-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center gap-2 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
              >
                <span className="text-sm font-black tracking-wide">{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</span>
                {!loading && <ArrowRight className="w-5 h-5" />}
              </motion.button>
            </div>
          </motion.form>

          {/* Footer toggle */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 text-center"
          >
            <p className="text-[13px] font-bold text-slate-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span 
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                {isLogin ? "Register" : "Sign In"}
              </span>
            </p>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
