import React, { useState, useEffect } from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [userName, setUserName] = useState('My Profile');

    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
        
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                if (userObj && userObj.fullName) {
                    setUserName(userObj.fullName);
                }
            }
        } catch (e) {
            console.error('Failed to parse user from localStorage', e);
        }
    }, [searchParams]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.trim()) {
            navigate(`/dashboard?q=${encodeURIComponent(val)}`);
        } else {
            // Nếu xóa hết chữ, chỉ bỏ param q khi đang ở trang dashboard
            if (location.pathname === '/dashboard') {
                navigate('/dashboard');
            }
        }
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-10 sticky top-0">
            {/* Search Bar */}
            <div className="flex items-center w-96 bg-slate-100/50 hover:bg-slate-100 rounded-full px-4 py-2 border border-transparent focus-within:bg-white focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-100/50 transition-all duration-300">
                <Search className="w-5 h-5 text-slate-400 mr-2" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search workspaces, boards..."
                    className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder-slate-400 font-medium"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-6">
                <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                </button>
                <div className="flex items-center space-x-3 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">{userName}</p>
                    </div>
                    <UserCircle className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
            </div>
        </header>
    );
};

export default Header;