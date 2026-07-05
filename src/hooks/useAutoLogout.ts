import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AUTO_LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useAutoLogout() {
  const { userRole, isLocalAuth, signOut } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Only apply auto-logout if user is logged in
  const isLoggedIn = userRole !== null || isLocalAuth;

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (isLoggedIn) {
      timerRef.current = setTimeout(() => {
        toast.error("Session expired due to inactivity. Logging out...", { duration: 5000 });
        signOut();
      }, AUTO_LOGOUT_TIME);
    }
  };

  useEffect(() => {
    // Initial timer setup
    resetTimer();

    // Events that count as "activity"
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    let lastAction = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      // Only reset timer if 5 seconds have passed since last reset
      if (now - lastAction > 5000) {
        lastAction = now;
        resetTimer();
      }
    };

    if (isLoggedIn) {
      events.forEach(event => {
        window.addEventListener(event, handleActivity, { passive: true });
      });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isLoggedIn]);
}
