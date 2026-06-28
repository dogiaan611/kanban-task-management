import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const DashboardLayout = () => {
    const location = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Bảo vệ trang: Chưa đăng nhập thì đá văng về trang Login
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Đóng sidebar khi chuyển trang trên mobile
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location.pathname]);

    // Lắng nghe sự kiện mở sidebar từ Header
    useEffect(() => {
        const toggleSidebar = () => setIsMobileSidebarOpen(prev => !prev);
        window.addEventListener('toggleMobileSidebar', toggleSidebar);
        return () => window.removeEventListener('toggleMobileSidebar', toggleSidebar);
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
            {/* Overlay for mobile sidebar */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}
            
            <Sidebar isOpen={isMobileSidebarOpen} />
            
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