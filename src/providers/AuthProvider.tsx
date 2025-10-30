"use client";

import React, { useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { setUserAndSession, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserAndSession(session?.user ?? null, session);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserAndSession(session?.user ?? null, session);
      setLoading(false); // Update loading state on change
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [setUserAndSession, setLoading]); // Dependencies for useEffect

  return <>{children}</>;
};

export default AuthProvider;
