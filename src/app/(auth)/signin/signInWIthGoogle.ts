"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Supabase 콜백 핸들러로 리디렉션할 URL
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    // 에러 발생 시, 에러 페이지로 리디렉션하거나 다른 처리를 할 수 있습니다.
    console.error("OAuth failed:", error.message);
    // 예를 들어, 로그인 페이지로 다시 리디렉션하며 에러를 쿼리 파라미터에 추가
    redirect("/auth/login?error=Google_OAuth_failed");
  }

  // Supabase가 반환한 인증 URL로 사용자를 리디렉션합니다.
  // 이 URL은 사용자에게 Google 로그인 페이지를 보여줍니다.
  if (data?.url) {
    redirect(data.url);
  }
}
