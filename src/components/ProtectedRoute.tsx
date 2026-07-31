import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import { useState } from 'react';

export const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { session, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('hasShownSplash');
  });

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0c]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={() => {
          sessionStorage.setItem('hasShownSplash', 'true');
          setShowSplash(false);
        }} 
      />
    );
  }

  return <>{children}</>;
};
