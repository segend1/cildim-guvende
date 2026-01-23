import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Set this to true to enable maintenance mode
const MAINTENANCE_MODE = false;

export function middleware(request: NextRequest) {
    // If maintenance mode is off, allow all requests
    if (!MAINTENANCE_MODE) {
        return NextResponse.next();
    }

    // Allow access to the maintenance page itself and static assets
    const { pathname } = request.nextUrl;
    if (
        pathname === '/maintenance' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Redirect all other requests to the maintenance page
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
