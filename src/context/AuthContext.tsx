
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "../components/ui/use-toast";

type UserProfile = {
  id: string;
  fullName: string;
  username: string;
  country: string;
  email?: string;
  contact?: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: { email: string, password: string, fullName: string, username: string, country: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // First set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          setSession(session);
          setIsAuthenticated(!!session);
          
          if (session?.user) {
            // Fetch user profile after auth state changes
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (profileError) {
                console.error('Error fetching profile:', profileError);
              } else if (profileData) {
                setProfile({
                  id: profileData.id,
                  fullName: profileData.username || '',
                  username: profileData.username || '',
                  country: profileData.avatar_url || '', // Using avatar_url temporarily as country
                  email: session.user.email || '',
                });
              }
            } catch (error) {
              console.error('Error in profile fetch:', error);
            }
          } else {
            setProfile(null);
          }
        }
      );

      // Then check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setSession(session);
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            setProfile({
              id: profileData.id,
              fullName: profileData.username || '',
              username: profileData.username || '',
              country: profileData.avatar_url || '', // Using avatar_url temporarily as country
              email: session.user.email || '',
            });
          }
        } catch (error) {
          console.error('Error in initial profile fetch:', error);
        }
      }
      
      setIsLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (userData: { email: string, password: string, fullName: string, username: string, country: string }): Promise<void> => {
    try {
      const { email, password, fullName, username, country } = userData;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
            country
          }
        }
      });

      if (error) {
        throw error;
      }
      
      // Profile will be created by the database trigger
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      toast({
        title: "Logout Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isAuthenticated, 
      isLoading,
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
