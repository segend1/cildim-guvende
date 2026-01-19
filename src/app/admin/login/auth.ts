'use server';

import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Default fallback for dev

export async function login(password: string) {
    if (password === ADMIN_PASSWORD) {
        (await cookies()).set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        return true;
    }
    return false;
}

export async function logout() {
    (await cookies()).delete('admin_session');
}

export async function isLoggedIn() {
    return (await cookies()).has('admin_session');
}
