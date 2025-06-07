'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

export const useAuthGuard = () => {
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.replace('/');
        }
    }, [router]);
};
