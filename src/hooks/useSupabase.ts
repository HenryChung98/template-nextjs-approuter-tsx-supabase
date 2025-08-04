"use client";

import { supabase } from "@/lib/supabase";
import { useState, useCallback, useEffect, useRef } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type AuthUser = Database["public"]["Tables"]["auth_users"]["Row"];

export const useSupabase = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingSession = useRef(false); // 중복 호출 방지

  const mapToUserProfile = (user: Session["user"]): AuthUser => ({
    id: user.id,
    email: user.email ?? "",
    first_name: user.user_metadata?.first_name ?? "",
    last_name: user.user_metadata?.last_name ?? "",
    image: user.user_metadata?.image ?? "",
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at ?? "",
    email_confirmed_at: user.email_confirmed_at ?? "",
  });

  const getSession = useCallback(async () => {
    // if (fetchingSession.current) return; // 중복 방지
    // fetchingSession.current = true;
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setUser(null);
        return;
      }

      const { id, email, user_metadata } = session.user;

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      //===========================================================================
      if (!profile || profileError) {
        setUser({
          id,
          email: email ?? "",
          first_name: user_metadata?.first_name ?? "",
          last_name: user_metadata?.last_name ?? "",
          image: user_metadata?.image ?? "",
          created_at: new Date().toISOString(),
          last_sign_in_at: user_metadata?.last_sign_in_at ?? "",
          email_confirmed_at: profile?.email_confirmed_at ?? "",
        });
      } else {
        setUser(mapToUserProfile(profile));
      }
    } catch (error: any) {
      console.error("getSession error:", error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSession();

    const { data } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          setUser(null);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const { id, email, user_metadata } = session.user;
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .maybeSingle();

          if (profile && !profileError) {
            setUser(mapToUserProfile(profile));
          } else {
            setUser({
              id,
              email: email ?? "",
              first_name: user_metadata?.first_name ?? "",
              last_name: user_metadata?.last_name ?? "",
              image: user_metadata?.image ?? "",
              created_at: new Date().toISOString(),
              last_sign_in_at: user_metadata?.last_sign_in_at ?? "",
              email_confirmed_at: profile?.email_confirmed_at ?? "",
            });
          }
        }
      }
    );

    return () => {
      data?.subscription?.unsubscribe?.(); // ✅ prevent memory leak
    };
  }, [getSession]);

  const setSession = useCallback(
    async (access_token: string, refresh_token: string) => {
      try {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          console.error("failed to set session:", error.message);
          return false;
        }
        await getSession();
        return true;
      } catch (error: any) {
        console.error("setSession exception:", error.message);
        return false;
      }
    },
    [getSession]
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Failed to sign out:", error.message);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error("signOut exception:", error.message);
      return false;
    }
  }, []);

  return {
    user,
    loading,
    getSession,
    setSession,
    signOut,
    isAuthenticated: !!user,
  };
};
