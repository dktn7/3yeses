'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTalentsByCategory } from '@/lib/data';
import TalentCard from '@/components/TalentCard';
import Link from 'next/link';

interface User {
  userId: string;
  email: string;
  role: string;
  name: string;
  profileComplete: boolean;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentTalents, setRecentTalents] = useState<any[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/verify', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setUser(data.user);
                        // Load recent talents
                        const talents = (await fetchTalentsByCategory('all')).slice(-3);
                        setRecentTalents(talents);
                    } else {
                        router.push('/auth/signin');
                    }
                } else {
                    router.push('/auth/signin');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/auth/signin');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            localStorage.removeItem('user');
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-blue"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to signin
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
            <div>
                {/* Welcome Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Welcome back, {user.name}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex justify-center gap-4 mt-6 mb-8">
                    <Link href="/categories" className="bg-primary-blue text-white px-6 py-2 rounded-full hover:bg-primary-blueHover dark:bg-accent-red dark:hover:bg-accent-red/80 transition-colors">Browse Categories</Link>
                    <Link href="/dashboard" className="bg-accent-red text-white px-6 py-2 rounded-full hover:bg-accent-red dark:bg-primary-blue dark:hover:bg-primary-blueHover transition-colors">Dashboard</Link>
                    {user.role === 'talent' ? (
                        <Link href="/dashboard/talent" className="bg-background-light text-primary-blue px-6 py-2 rounded-full border border-primary-blue hover:bg-primary-blue hover:text-white dark:bg-background-dark dark:text-accent-red dark:border-accent-red dark:hover:bg-accent-red dark:hover:text-white transition-colors">Talent Profile</Link>
                    ) : (
                        <Link href="/dashboard/client" className="bg-background-light text-primary-blue px-6 py-2 rounded-full border border-primary-blue hover:bg-primary-blue hover:text-white dark:bg-background-dark dark:text-accent-red dark:border-accent-red dark:hover:bg-accent-red dark:hover:text-white transition-colors">Client Dashboard</Link>
                    )}
                </nav>
                
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Recently Joined Talent</h2>
                    {recentTalents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recentTalents.map((talent) => (
                                <TalentCard key={talent.id} talent={talent} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400">No recent talent to display.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
