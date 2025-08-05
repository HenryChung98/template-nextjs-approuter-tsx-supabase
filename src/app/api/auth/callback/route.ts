// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 로그인 성공 후 사용자를 리디렉션할 최종 경로를 지정합니다.
  return NextResponse.redirect(requestUrl.origin);
}
