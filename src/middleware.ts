import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function isStubEnv() {
  return (
    process.env.NEXT_PUBLIC_E2E_STUB === '1' ||
    process.env.E2E_STUB === '1' ||
    process.env.NEXT_PUBLIC_OCR_STUB === '1' ||
    process.env.OCR_STUB === '1'
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  if (!isStubEnv()) {
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    const isMissingSession = (getUserError?.message ?? '').includes('Auth session missing');
    const hasBootstrapCookie = request.cookies.get('sv_anon_bootstrap')?.value === '1';

    if ((!user || isMissingSession) && !hasBootstrapCookie && 'signInAnonymously' in supabase.auth) {
      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (!signInError) {
        const redirect = NextResponse.redirect(new URL(request.url));
        for (const cookie of response.cookies.getAll()) {
          redirect.cookies.set(cookie);
        }
        redirect.cookies.set({
          name: 'sv_anon_bootstrap',
          value: '1',
          maxAge: 10,
          path: '/',
          sameSite: 'lax',
        });
        return redirect;
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
