import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for exit animation to complete
    }, 500); // Show for 0.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Decorative Elements */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[100px]" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Logo Container with Glow */}
            <div className="relative mb-8">
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0px 0px 0px 0px rgba(59, 130, 246, 0)",
                    "0px 0px 40px 10px rgba(59, 130, 246, 0.15)",
                    "0px 0px 0px 0px rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full"
              />
              <img 
                src="/kwsc-logo.png" 
                alt="KWSC Logo" 
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-2xl relative z-10"
              />
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl sm:text-4xl font-black text-white tracking-tight text-center"
            >
              KWSC
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-white/50 font-medium mt-2 tracking-widest uppercase text-sm text-center"
            >
              One Window Portal
            </motion.p>
          </motion.div>

          {/* Loading Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-16 flex flex-col items-center gap-3"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 rounded-full bg-blue-500"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Initializing Environment</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
