import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { logActivity } from '@/hooks/useActivityLog';

export interface DepartmentUser {
  id?: string;
  email: string;
  password?: string;
  roleId: string;
  displayName: string;
  avatarUrl?: string;
  allowOverrideDates?: boolean;
  is_blocked?: boolean;
  enforce_attendance?: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userRole: string | null;
  userName: string | null;
  userAvatar: string | null;
  localSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifyPassword: (password: string) => boolean;
  allowOverrideDates: boolean;
  updateUserProfile: (newName: string, newPassword?: string, newAvatar?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [allowOverrideDates, setAllowOverrideDates] = useState(false);

  const loadUserProfile = async (currentUser: User) => {
    try {
      const { data: settings } = await supabase
        .from('department_users_settings')
        .select('*')
        .eq('email', currentUser.email?.toLowerCase())
        .maybeSingle();

      const role = settings?.role_id || currentUser.user_metadata?.role_id;
      const displayName = settings?.display_name || currentUser.user_metadata?.display_name || currentUser.email;

      setUserRole(role);
      setUserName(displayName);
      setUserAvatar(settings?.avatar_url || null);
      setIsAdmin(role === 'cfo' || role === 'admin');
      setAllowOverrideDates(settings?.allow_override_dates || role === 'cfo' || role === 'admin');

    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadUserProfile(newSession.user);
      } else {
        setUserRole(null);
        setUserName(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userName) return;
    const channel = supabase.channel('public:admin_commands')
      .on('broadcast', { event: 'force_logout' }, (payload) => {
        if (payload.payload?.targetName === userName) {
           signOut();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userName]);

  const localSignIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimEmail = email.trim().toLowerCase();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimEmail,
        password: password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: settings } = await supabase
          .from('department_users_settings')
          .select('is_blocked')
          .eq('email', trimEmail)
          .maybeSingle();

        if (settings?.is_blocked) {
          await supabase.auth.signOut();
          return { success: false, error: 'Your account has been blocked. Please contact Admin.' };
        }
      }

      logActivity({
        userRole: data.user?.user_metadata?.role_id || 'unknown',
        userName: data.user?.user_metadata?.display_name || trimEmail,
        action: 'LOGIN',
        details: { email: trimEmail, method: 'supabase' },
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during login.' };
    }
  };

  const updateUserProfile = async (newName: string, newPassword?: string, newAvatar?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated.' };

    try {
      const updatePayload: any = { display_name: newName };
      if (newPassword) updatePayload.password = newPassword;
      if (newAvatar !== undefined) updatePayload.avatar_url = newAvatar;

      await supabase.from('department_users_settings')
        .update(updatePayload)
        .eq('email', user.email);

      const authUpdates: any = { data: { display_name: newName } };
      if (newPassword) authUpdates.password = newPassword;

      await supabase.auth.updateUser(authUpdates);

      setUserName(newName);
      if (newAvatar !== undefined) setUserAvatar(newAvatar);

      await logActivity({
        userRole: userRole || 'unknown',
        userName: newName,
        action: 'UPDATE',
        subject: 'Profile Updated',
        details: { method: 'supabase', email: user.email, passwordChanged: !!newPassword },
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile.' };
    }
  };

  const signOut = async () => {
    if (userRole && userName) {
      await logActivity({
        userRole: userRole,
        userName: userName,
        action: 'LOGOUT',
        details: { method: 'supabase' },
      });
    }
    await supabase.auth.signOut();
    setUserRole(null);
    setUserName(null);
    setIsAdmin(false);
  };

  const verifyPassword = (password: string): boolean => {
    return password.trim() === 'gmqaBhK6@90';
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signOut, 
      isAdmin,
      userRole,
      userName,
      userAvatar,
      localSignIn,
      verifyPassword,
      allowOverrideDates,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
