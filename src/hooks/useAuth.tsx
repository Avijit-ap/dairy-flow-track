
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, options?: { role?: string; assignedAgent?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  inviteAgent: (email: string, fullName: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role
          setTimeout(async () => {
            try {
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              console.log('User role:', roleData?.role);
              setUserRole(roleData?.role || 'customer');
            } catch (error) {
              console.error('Error fetching user role:', error);
              setUserRole('customer');
            }
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, options?: { role?: string; assignedAgent?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: options?.role || 'customer',
          assigned_agent: options?.assignedAgent
        }
      }
    });

    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Handle role assignment after signup
      if (data.user && options?.role) {
        setTimeout(async () => {
          try {
            // Update user role if not customer (customer is default)
            if (options.role !== 'customer') {
              await supabase
                .from('user_roles')
                .update({ role: options.role })
                .eq('user_id', data.user.id);
            }
            
            // Update profile with assigned agent if provided
            if (options.assignedAgent) {
              await supabase
                .from('profiles')
                .update({ assigned_agent_id: options.assignedAgent })
                .eq('id', data.user.id);
            }
          } catch (err) {
            console.error('Error updating user details:', err);
          }
        }, 1000);
      }
      
      toast({
        title: "Sign Up Successful",
        description: options?.role === 'agent' 
          ? "Your agent account is pending approval. You'll receive an email once activated."
          : "Please check your email to confirm your account.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  const inviteAgent = async (email: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          role: 'agent'
        },
        redirectTo: `${window.location.origin}/`
      });

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Magic link sent to ${email}`,
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Invitation Error",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      loading,
      signUp,
      signIn,
      signOut,
      inviteAgent
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
