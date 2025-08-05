import { NextRequest, NextResponse } from "next/server";
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(req: NextRequest) {
  // const res = NextResponse.next();

  const res = await updateSession(req) // added

  const publicUrls = ["/reset"];
  if (publicUrls.includes(req.nextUrl.pathname)) {
    return res;
  }

  // const supabase = createMiddlewareClient({ req, res });

  // const {
  //   data: { session },
  //   error,
  // } = await supabase.auth.getSession();

  // console.log(session);
  // console.log(error);

  // if (!session) {
    // return NextResponse.rewrite(new URL("/signin", req.url));
  // }
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
