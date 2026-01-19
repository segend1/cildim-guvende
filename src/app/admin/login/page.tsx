'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from './auth';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await login(password);
            if (success) {
                router.push('/');
                // Optional: router.refresh() to ensure cookies are seen
            } else {
                setError('Hatalı şifre!');
            }
        } catch (err) {
            setError('Bir hata oluştu.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-black p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Yönetici Girişi</h1>
                    <p className="text-gray-500 text-sm mt-2">İçerik düzenlemek için giriş yapın.</p>
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Yönetici Şifresi"
                        className="w-full p-3 border rounded-xl bg-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                <button type="submit" className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-80 transition-opacity">
                    Giriş Yap
                </button>
            </form>
        </div>
    );
}
