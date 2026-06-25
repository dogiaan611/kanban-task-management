import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const DashboardLayout = () => {
    // Bảo vệ trang: Chưa đăng nhập thì đá văng về trang Login
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />
                {/* Phần ruột chính: Các trang con (như Workspace List) sẽ được nhúng vào vị trí thẻ Outlet này */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;