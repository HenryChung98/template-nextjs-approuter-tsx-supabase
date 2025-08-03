import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 유틸: 오류 응답 단축 함수
const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const formData = await req.json();
    const { email, password, firstName, lastName } = formData;

    // ✅ 1. 필수 필드 확인
    if (!email || !password || !firstName || !lastName) {
      return errorResponse("Email, password, and name are required.", 400);
    }

    // ✅ 2. 비밀번호 유효성 검사
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!pwRegex.test(password)) {
      return errorResponse(
        "Passwords must be at least 8 characters long and contain letters and numbers.",
        400
      );
    }

    // ✅ 5. Supabase Auth 회원가입
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: `${url.origin}/callback/confirmed`,
        },
      }
    );

    if (signUpError) {
      const msg = signUpError.message;

      if (msg.includes("users_email_key"))
        return errorResponse("Email already exists.", 409);

      return errorResponse(msg, 400);
    }

    if (!signUpData.user?.id) {
      return errorResponse("Signup failed: missing user ID.", 500);
    }

    // ✅ 6. public.users 테이블에 사용자 프로필 추가
    const userProfile = {
      id: signUpData.user.id,
      email,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    };

    const { error: profileError } = await supabase
      .from("users")
      .insert([userProfile]);

    if (profileError) {
      const msg = profileError.message;

      if (msg.includes("users_email_key"))
        return errorResponse("Email already exists.", 409);

      return errorResponse(msg, 400);
    }

    // ✅ 7. 성공 응답
    return NextResponse.json({ user: userProfile });
  } catch (err) {
    console.error("Unexpected signup error:", err);
    return errorResponse("Internal server error", 500);
  }
}
