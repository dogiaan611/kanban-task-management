import React, { useState, useEffect } from 'react';
import { Search, UserCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import BoardMembersBar from '../kanban/BoardMembersBar';
import NotificationBell from './NotificationBell';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    
    let boardId: number | undefined;
    const boardMatch = location.pathname.match(/^\/board\/(\d+)/);
    if (boardMatch) {
        boardId = Number(boardMatch[1]);
    }
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [userName, setUserName] = useState('My Profile');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
        
        const loadUserData = () => {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const userObj = JSON.parse(userStr);
                    if (userObj && userObj.fullName) {
                        setUserName(userObj.fullName);
                    }
                    if (userObj && userObj.avatarUrl) {
                        setAvatarUrl(userObj.avatarUrl);
                    } else {
                        setAvatarUrl('');
                    }
                }
            } catch (e) {
                console.error('Failed to parse user from localStorage', e);
            }
        };

        loadUserData();
        window.addEventListener('storage', loadUserData);
        return () => window.removeEventListener('storage', loadUserData);
    }, [searchParams]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.trim()) {
            navigate(`/workspaces?q=${encodeURIComponent(val)}`);
        } else {
            // Nếu xóa hết chữ, chỉ bỏ param q khi đang ở trang workspaces
            if (location.pathname === '/workspaces') {
                navigate('/workspaces');
            }
        }
    };

    const searchBarElement = (
        <div className="flex items-center w-[450px] bg-slate-100/50 hover:bg-slate-100 rounded-full px-4 py-2.5 border border-transparent focus-within:bg-white focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-100/50 transition-all duration-300">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search workspaces, boards..."
                className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder-slate-400 font-medium"
            />
        </div>
    );

    const isProfilePage = location.pathname === '/profile';

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-10 sticky top-0">
            {/* Left (Back Button or Search Bar) */}
            <div className="flex-1 flex items-center">
                {!isProfilePage && (
                    !['/dashboard', '/workspaces'].includes(location.pathname) ? (
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            {location.pathname.startsWith('/board/') ? 'Back to Boards' : 'Back to Workspace'}
                        </button>
                    ) : (
                        location.pathname === '/workspaces' ? searchBarElement : null
                    )
                )}
            </div>

            {/* Center (Search Bar only on Workspace Detail pages) */}
            <div className="flex-shrink-0 flex justify-center">
                {!isProfilePage && !['/dashboard', '/workspaces'].includes(location.pathname) && !location.pathname.startsWith('/board/') && searchBarElement}
            </div>

            {/* Right Actions */}
            <div className="flex-1 flex items-center justify-end space-x-6">
                {boardId && <BoardMembersBar boardId={boardId} />}
                <NotificationBell />
                <div 
                    className="flex items-center space-x-3 cursor-pointer group"
                    onClick={() => navigate('/profile')}
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">{userName}</p>
                    </div>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-emerald-500 transition-all" />
                    ) : (
                        <UserCircle className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;