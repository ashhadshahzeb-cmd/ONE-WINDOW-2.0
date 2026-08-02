import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { logActivity } from '@/hooks/useActivityLog';

// ========== DEPARTMENT USERS ==========
// Predefined credentials for each KW&SB Finance section
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

export const DEFAULT_DEPARTMENT_USERS: DepartmentUser[] = [
  { email: 'hr.admin@kwsb.gov.pk',         password: 'hradmin',      roleId: 'hr_admin',          displayName: 'HR ADMIN' },
  { email: 'admin@kwsb.gov.pk',            password: 'admin',        roleId: 'admin',             displayName: 'SYSTEM ADMINISTRATOR' },
  { email: 'cfo@kwsb.gov.pk',              password: 'cfo@12345',    roleId: 'cfo',              displayName: 'CFO' },
  { email: 'cia@kwsb.gov.pk',              password: 'cia@12345',    roleId: 'cia',              displayName: 'CIA' },
  { email: 'budget@kwsb.gov.pk',           password: 'budget@12345', roleId: 'budget',            displayName: 'BUDGET' },
  { email: 'pension@kwsb.gov.pk',          password: 'pension@12345',roleId: 'pension',           displayName: 'PENSION' },
  { email: 'fund@kwsb.gov.pk',             password: 'fund@12345',   roleId: 'fund',              displayName: 'FUND' },
  { email: 'audit1@kwsb.gov.pk',           password: 'audit1@12345', roleId: 'internal_audit_1',  displayName: 'INTERNAL AUDIT-1' },
  { email: 'director.account@kwsb.gov.pk', password: 'da@12345',     roleId: 'director_account',  displayName: 'DIRECTOR ACCOUNT' },
  { email: 'director.finance@kwsb.gov.pk', password: 'df@12345',     roleId: 'director_finance',  displayName: 'DIRECTOR FINANCE' },
  { email: 'director.it@kwsb.gov.pk',      password: 'dit@12345',    roleId: 'director_it',       displayName: 'DIRECTOR IT' },
  { email: 'subcfo@kwsb.gov.pk',           password: 'sub@12345',     roleId: 'sub_cfo',           displayName: 'ASST. CFO' },
  { email: 'books@kwsb.gov.pk',            password: 'books@12345',   roleId: 'books',             displayName: 'BOOKS' },
  { email: 'establishment@kwsb.gov.pk',    password: 'est@12345',     roleId: 'establishment',     displayName: 'ESTABLISHMENT' },
  { email: 'director.audit@kwsb.gov.pk',   password: 'daudit@12345',  roleId: 'director_audit',    displayName: 'DIRECTOR AUDIT' },
  { email: 'audit2@kwsb.gov.pk',           password: 'audit2@12345',  roleId: 'internal_audit_2',  displayName: 'INTERNAL AUDIT-2' },
  { email: 'law@kwsb.gov.pk',              password: 'law@12345',     roleId: 'law_department',    displayName: 'LAW DEPARTMENT' },
  { email: 'chro@kwsb.gov.pk',             password: 'chro@12345',    roleId: 'chro',              displayName: 'CHRO' },
  { email: 'asst.cfo1@kwsb.gov.pk',        password: 'acfo1@12345',  roleId: 'sub_cfo_1',         displayName: 'ASST. CFO-1' },
  { email: 'asst.cfo2@kwsb.gov.pk',        password: 'acfo2@12345',  roleId: 'sub_cfo_2',         displayName: 'ASST. CFO-2' },
  { email: 'asst.cfo3@kwsb.gov.pk',        password: 'acfo3@12345',  roleId: 'sub_cfo_3',         displayName: 'ASST. CFO-3' },
  { email: 'asst.cfo4@kwsb.gov.pk',        password: 'acfo4@12345',  roleId: 'sub_cfo_4',         displayName: 'ASST. CFO-4' },
  { email: 'asst.cfo5@kwsb.gov.pk',        password: 'acfo5@12345',  roleId: 'sub_cfo_5',         displayName: 'ASST. CFO-5' },
  { email: 'mdoffice@kwsb.gov.pk',         password: 'md@12345',      roleId: 'md_office',         displayName: 'MD OFFICE' },
  { email: 'emp1@kwsb.gov.pk',             password: 'emp1@12345',    roleId: 'emp_operator',      displayName: 'EMPLOYEE REGISTRY 1' },
  { email: 'transfer@kwsb.gov.pk',         password: 'transfer@12345',roleId: 'transfer_user',   displayName: 'TRANSFER ADVICE' },
  { email: 'emp2@kwsb.gov.pk',             password: 'emp2@12345',    roleId: 'emp_operator',      displayName: 'EMPLOYEE REGISTRY 2' },
  { email: 'viewer@kwsb.gov.pk',           password: 'viewer@12345',  roleId: 'file_viewer',       displayName: 'FILE VIEWER' },
];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  // Department-specific fields
  userRole: string | null;       // e.g. 'cfo', 'cia', 'director_account'
  userName: string | null;       // e.g. 'CFO', 'DIRECTOR ACCOUNT'
  userAvatar: string | null;
  localSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isLocalAuth: boolean;
  verifyPassword: (password: string) => boolean;
  allowOverrideDates: boolean;
  updateUserProfile: (newName: string, newPassword?: string, newAvatar?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'kwsb_local_auth';
export const CUSTOM_USERS_KEY = 'kwsb_custom_users';

export const getDepartmentUsers = (): DepartmentUser[] => {
  const customStr = localStorage.getItem(CUSTOM_USERS_KEY);
  if (customStr) {
    try {
      const customUsers = JSON.parse(customStr);
      const merged = [...customUsers];
      DEFAULT_DEPARTMENT_USERS.forEach(defaultUser => {
        if (!merged.find(u => u.email === defaultUser.email)) {
          merged.push(defaultUser);
        }
      });
      return merged;
    } catch {
      return DEFAULT_DEPARTMENT_USERS;
    }
  }
  return DEFAULT_DEPARTMENT_USERS;
};

export const saveDepartmentUsers = (users: DepartmentUser[]) => {
  localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Local department auth state
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isLocalAuth, setIsLocalAuth] = useState(false);
  const [allowOverrideDates, setAllowOverrideDates] = useState(false);
  const [isTransferUser, setIsTransferUser] = useState(false);

  useEffect(() => {
    // 1) Check for local department auth first
    const savedLocal = localStorage.getItem(LOCAL_AUTH_KEY);
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        setUserRole(parsed.roleId);
        setUserName(parsed.displayName);
        setUserAvatar(parsed.avatarUrl || null);
        setIsLocalAuth(true);
        setIsAdmin(parsed.roleId === 'cfo' || parsed.roleId === 'admin');
        setIsTransferUser(parsed.roleId === 'transfer_user');
        const usersList = getDepartmentUsers();
        const match = usersList.find(u => u.email === parsed.email);
        setAllowOverrideDates(match?.allowOverrideDates || parsed.roleId === 'cfo' || parsed.roleId === 'admin');
        
        // Sync local auth user with Supabase asynchronously to keep it fresh
        supabase.from('department_users_settings').select('*').eq('email', parsed.email).maybeSingle().then(({ data }) => {
          if (data) {
            setUserName(data.display_name);
            setUserAvatar(data.avatar_url || null);
            setAllowOverrideDates(data.allow_override_dates || data.role_id === 'cfo' || data.role_id === 'admin');
            
            // Update local storage so it has latest
            const usersList = getDepartmentUsers();
            const idx = usersList.findIndex(u => u.email === data.email);
            if (idx !== -1) {
              usersList[idx] = {
                ...usersList[idx],
                displayName: data.display_name,
                password: data.password,
                avatarUrl: data.avatar_url,
                allowOverrideDates: data.allow_override_dates,
                is_blocked: data.is_blocked,
                enforce_attendance: data.enforce_attendance
              };
              saveDepartmentUsers(usersList);
            }
          }
        });
        
        setLoading(false);
        return; // skip Supabase auth if local auth is active
      } catch {
        localStorage.removeItem(LOCAL_AUTH_KEY);
      }
    }

    // 2) Fallback to Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
        const usersList = getDepartmentUsers();
        const match = usersList.find(u => u.email === session.user.email?.toLowerCase());
        if (match) {
           setUserRole(match.roleId);
           setUserName(match.displayName);
           setAllowOverrideDates(match.allowOverrideDates || match.roleId === 'cfo' || match.roleId === 'admin');
        } else {
           const prefix = session.user.email?.split('@')[0].toLowerCase() || '';
           const fallbackMatch = usersList.find(u => u.roleId === prefix || u.roleId.replace('_', '') === prefix);
           if (fallbackMatch) {
              setUserRole(fallbackMatch.roleId);
              setUserName(fallbackMatch.displayName);
              setAllowOverrideDates(fallbackMatch.allowOverrideDates || fallbackMatch.roleId === 'cfo' || fallbackMatch.roleId === 'admin');
           }
        }
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
        const usersList = getDepartmentUsers();
        const match = usersList.find(u => u.email === session.user.email?.toLowerCase());
        if (match) {
           setUserRole(match.roleId);
           setUserName(match.displayName);
           setAllowOverrideDates(match.allowOverrideDates || match.roleId === 'cfo' || match.roleId === 'admin');
        } else {
           // Default fallback based on email prefix if not exactly matched
           const prefix = session.user.email?.split('@')[0].toLowerCase() || '';
           const fallbackMatch = usersList.find(u => u.roleId === prefix || u.roleId.replace('_', '') === prefix);
           if (fallbackMatch) {
              setUserRole(fallbackMatch.roleId);
              setUserName(fallbackMatch.displayName);
              setAllowOverrideDates(fallbackMatch.allowOverrideDates || fallbackMatch.roleId === 'cfo' || fallbackMatch.roleId === 'admin');
           }
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Re-check allowOverrideDates when localStorage changes (cross-tab) or window regains focus
  useEffect(() => {
    const refreshOverrideDates = () => {
      const savedLocal = localStorage.getItem(LOCAL_AUTH_KEY);
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          const usersList = getDepartmentUsers();
          const match = usersList.find((u: DepartmentUser) => u.email === parsed.email);
          if (match) {
            setAllowOverrideDates(!!match.allowOverrideDates || match.roleId === 'cfo' || match.roleId === 'admin');
          }
        } catch { /* ignore */ }
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CUSTOM_USERS_KEY) refreshOverrideDates();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', refreshOverrideDates);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', refreshOverrideDates);
    };
  }, []);

  // Listen for admin force logout events
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

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Error checking admin role:', err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Local department login
  const localSignIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimEmail = email.trim().toLowerCase();
    const trimPass = password.trim();

    let match: DepartmentUser | undefined;

    try {
      const { data, error } = await supabase.from('department_users_settings').select('*').eq('email', trimEmail).maybeSingle();
      if (data && !error) {
        match = {
          roleId: data.role_id,
          email: data.email,
          displayName: data.display_name,
          password: data.password,
          avatarUrl: data.avatar_url,
          allowOverrideDates: data.allow_override_dates,
          is_blocked: data.is_blocked,
          enforce_attendance: data.enforce_attendance
        };
        // Also update local list so offline login works next time
        const usersList = getDepartmentUsers();
        const idx = usersList.findIndex(u => u.email === trimEmail);
        if (idx !== -1) {
          usersList[idx] = match;
          saveDepartmentUsers(usersList);
        }
      }
    } catch (e) {
      console.log('Could not fetch user from Supabase, falling back to local');
    }

    if (!match) {
      const usersList = getDepartmentUsers();
      match = usersList.find(u => u.email === trimEmail);
    }

    if (!match || match.password !== trimPass) {
      // HRMS Fallback
      try {
        const { data: hrmsData, error: hrmsError } = await supabase
          .from('hrms_employees')
          .select('*')
          .eq('email', trimEmail)
          .maybeSingle();
        
        if (hrmsData && !hrmsError && hrmsData.password === trimPass) {
          // Valid HRMS employee
          
          // Enforce manual HRMS block (If we ever add it to hrms_employees)
          // For now, HRMS fallback doesn't have is_blocked. 
          
          localStorage.setItem('kwsb_hrms_emp_id', hrmsData.id);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({
            roleId: 'hrms_employee',
            displayName: hrmsData.name,
            email: hrmsData.email,
          }));

          setUserRole('hrms_employee');
          setUserName(hrmsData.name);
          setIsLocalAuth(true);
          setIsAdmin(false);
          setAllowOverrideDates(false);
          setIsTransferUser(false);

          logActivity({
            userRole: 'hrms_employee',
            userName: hrmsData.name,
            action: 'LOGIN',
            details: { email: hrmsData.email, method: 'hrms_fallback' },
          });

          return { success: true };
        }
      } catch (e) {
        console.error('HRMS Fallback error', e);
      }

      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }

    if (match.is_blocked) {
      return { success: false, error: 'Your account has been blocked. Please contact Admin.' };
    }

    if (match.enforce_attendance) {
      // Check if they missed previous working day attendance
      try {
        const { data: empData } = await supabase.from('hrms_employees').select('id').eq('email', trimEmail).maybeSingle();
        if (empData) {
          // Get yesterday date (simplified, ideally we exclude weekends)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const dateStr = yesterday.toISOString().split('T')[0];

          // Check if they have an attendance record for yesterday
          const { data: attData } = await supabase.from('hrms_attendance').select('status').eq('employee_id', empData.id).eq('date', dateStr).maybeSingle();
          
          if (!attData || attData.status === 'Absent') {
             // Auto-block the user
             await supabase.from('department_users_settings').update({ is_blocked: true }).eq('email', trimEmail);
             match.is_blocked = true;
             
             // Update local list
             const usersList = getDepartmentUsers();
             const idx = usersList.findIndex(u => u.email === trimEmail);
             if (idx !== -1) {
               usersList[idx].is_blocked = true;
               saveDepartmentUsers(usersList);
             }

             return { success: false, error: 'Your account has been auto-blocked due to missing attendance yesterday. Contact Admin.' };
          }
        }
      } catch (e) {
        console.error('Auto block check failed', e);
      }
    }

    // Save to localStorage
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({
      roleId: match.roleId,
      displayName: match.displayName,
      email: match.email,
    }));

    setUserRole(match.roleId);
    setUserName(match.displayName);
    setIsLocalAuth(true);
    setIsAdmin(match.roleId === 'cfo' || match.roleId === 'admin');
    setAllowOverrideDates(match.allowOverrideDates || match.roleId === 'cfo' || match.roleId === 'admin');
    setIsTransferUser(match.roleId === 'transfer_user');

    // Log login activity
    logActivity({
      userRole: match.roleId,
      userName: match.displayName,
      action: 'LOGIN',
      details: { email: match.email, method: 'local' },
    });

    return { success: true };
  };

  const updateUserProfile = async (newName: string, newPassword?: string, newAvatar?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isLocalAuth || !userRole) {
      return { success: false, error: 'Cannot update profile for non-local or unauthenticated users via this method.' };
    }

    try {
      const savedLocal = localStorage.getItem(LOCAL_AUTH_KEY);
      if (!savedLocal) return { success: false, error: 'Session not found.' };
      
      const parsed = JSON.parse(savedLocal);
      const email = parsed.email;

      const usersList = getDepartmentUsers();
      const userIndex = usersList.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found in system.' };
      }

      // Update the user details
      const oldName = usersList[userIndex].displayName;
      usersList[userIndex].displayName = newName;
      if (newPassword) {
        usersList[userIndex].password = newPassword;
      }
      if (newAvatar !== undefined) {
        usersList[userIndex].avatarUrl = newAvatar;
      }

      // Save back to storage
      saveDepartmentUsers(usersList);

      // Update in Supabase
      try {
        await supabase.from('department_users_settings').update({
          display_name: newName,
          password: newPassword || usersList[userIndex].password,
          avatar_url: newAvatar !== undefined ? newAvatar : usersList[userIndex].avatarUrl
        }).eq('email', email);
      } catch (err) {
        console.log('Failed to update profile globally in Supabase', err);
      }

      // Update current session state
      setUserName(newName);
      
      // Update the LOCAL_AUTH_KEY to reflect new display name
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({
        ...parsed,
        displayName: newName,
        ...(newAvatar !== undefined && { avatarUrl: newAvatar })
      }));

      // Log the activity to notify admin
      await logActivity({
        userRole: userRole,
        userName: newName,
        action: 'UPDATE',
        subject: 'Profile Updated',
        details: { 
          method: 'local', 
          email: email,
          nameChanged: oldName !== newName,
          passwordChanged: !!newPassword
        },
      });

      return { success: true };
    } catch (err) {
      console.error('Failed to update profile:', err);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const signOut = async () => {
    // Log logout activity before clearing state
    if (userRole && userName) {
      await logActivity({
        userRole: userRole,
        userName: userName,
        action: 'LOGOUT',
        details: { method: isLocalAuth ? 'local' : 'supabase' },
      });
    }

    // Clear local auth
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setUserRole(null);
    setUserName(null);
    setIsLocalAuth(false);
    setIsAdmin(false);

    // Also sign out from Supabase
    await supabase.auth.signOut();
  };

  const verifyPassword = (password: string): boolean => {
    const trimPass = password.trim();

    // Only this master password will be used for edits
    if (trimPass === 'gmqaBhK6@90') {
      return true;
    }

    // No longer allowing current user's login password for edits.
    // Must use the dedicated edit password above.
    return false;
  };

  // If we have local auth OR supabase session, we're authenticated
  const effectiveSession = isLocalAuth ? ({} as Session) : session;

  return (
    <AuthContext.Provider value={{ 
      session: effectiveSession, 
      user, 
      loading, 
      signOut, 
      isAdmin,
      userRole,
      userName,
      userAvatar,
      localSignIn,
      isLocalAuth,
      verifyPassword,
      allowOverrideDates,
      isTransferUser,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
