import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session on every request and gates the app:
 *
 * - Supabase not configured  -> pass through (local demo mode, no auth).
 * - Signed out + protected route -> redirect to /login?redirect=<path>.
 * - Signed in + on /login        -> redirect to <redirect> or /.
 *
 * `/login`, `/auth/*` and `/api/*` are never redirected (API routes return
 * their own 401 JSON instead of an HTML redirect).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touching getUser() triggers the token refresh when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isAuthRoute = pathname === '/login' || pathname.startsWith('/auth');
  const isApi = pathname.startsWith('/api');

  /** Carry any refreshed auth cookies onto a redirect response. */
  const withCookies = (redirect: NextResponse) => {
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!user && !isAuthRoute && !isApi) {
    const target = request.nextUrl.clone();
    target.pathname = '/login';
    target.search = '';
    target.searchParams.set('redirect', pathname + search);
    return withCookies(NextResponse.redirect(target));
  }

  if (user && pathname === '/login') {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const target = request.nextUrl.clone();
    target.pathname =
      redirectParam && redirectParam.startsWith('/') ? redirectParam : '/';
    target.search = '';
    return withCookies(NextResponse.redirect(target));
  }

  return response;
}
