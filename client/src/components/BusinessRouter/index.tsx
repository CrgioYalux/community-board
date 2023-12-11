import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAPI } from '../../providers/API';

import Login from "../../pages/Login";
import LoggedLayout from "../../layouts/Logged";
import SkeletonLayout from "../../layouts/Skeleton";
import Register from '../../pages/Register';

const BusinessRouter: React.FC = () => {
    const API = useAPI();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (API.Value.tryingReauth) return;
        if (loading) return;

        setLoading(true);

        const credibleTimeout = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => {
            clearTimeout(credibleTimeout);
        };
    }, []);

    if (loading || API.Value.tryingReauth) 
        return (
            <SkeletonLayout>
                <div className='flex-auto basis-full grid place-items-center'>
                    <h1 className='text-4xl text-blue-900 dark:text-blue-200 font-semibold'>Authenticating...</h1>
                </div>
            </SkeletonLayout>
        );

    return (
        <Routes>
            <Route path='/' element={API.Value.logged ? <Navigate to='/home' /> : <Navigate to='auth' />} />
            <Route path='/' element={<SkeletonLayout><Outlet /></SkeletonLayout>}>
                <Route element={API.Value.logged ? <Outlet /> : <Navigate to='auth' />}>
                    <Route path='home' element={<LoggedLayout><Outlet /></LoggedLayout>}>
                        <Route index element={<div>feed here</div>} />
                    </Route>
                </Route>
            <Route path='auth' element={API.Value.logged ? <Navigate to='/' /> : <Outlet />}>
                <Route index element={<Navigate to='/auth/login' />} />
                <Route path='login' element={<Login />} />
                <Route path='register' element={<Register />} />
            </Route>
            <Route path='*' element={<>404</>} />
            </Route>
        </Routes>
    );
};

export default BusinessRouter;
