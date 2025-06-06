import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ['/dashboard'];
const publicRoutes = [
  '/reset-password',
  '/',
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get('token')?.value;

  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (isPublicRoute && cookie && !path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
    '/dashboard/:path*',
    '/reset-password/:path*',
  ],
};