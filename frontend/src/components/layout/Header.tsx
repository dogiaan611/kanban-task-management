import React, { useState, useEffect } from 'react';
import { Search, UserCircle, ArrowLeft, Menu } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import BoardMembersBar from '../kanban/BoardMembersBar';
import { Filter, Calendar, LayoutGrid } from 'lucide-react';

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
    
    // View mode state (Kanban vs Calendar)
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');

    useEffect(() => {
        const handleViewChange = (e: any) => setViewMode(e.detail);
        window.addEventListener('requestBoardView', handleViewChange);
        return () => window.removeEventListener('requestBoardView', handleViewChange);
    }, []);

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
        <div className="flex items-center w-full max-w-[450px] bg-slate-100/50 hover:bg-slate-100 rounded-full px-4 py-2.5 border border-transparent focus-within:bg-white focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-100/50 transition-all duration-300">
            <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search workspaces..."
                className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder-slate-400 font-medium"
            />
        </div>
    );

    const isProfilePage = location.pathname === '/profile';
    const isNotificationsPage = location.pathname === '/notifications';
    const hideHeaderActions = isProfilePage || isNotificationsPage;

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 shadow-sm z-10 sticky top-0 gap-2">
            {/* Left (Hamburger + Back Button) */}
            <div className="flex-1 flex items-center gap-2">
                <button 
                    onClick={() => window.dispatchEvent(new Event('toggleMobileSidebar'))}
                    className="md:hidden p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                
                {!hideHeaderActions && (
                    !['/dashboard', '/workspaces'].includes(location.pathname) ? (
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-2 md:px-4 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline">{location.pathname.startsWith('/board/') ? 'Back to Boards' : 'Back to Workspace'}</span>
                        </button>
                    ) : (
                        <div className="hidden md:block w-full">{location.pathname === '/workspaces' ? searchBarElement : null}</div>
                    )
                )}
            </div>

            {/* Center (Search Bar only on Workspace Detail pages) */}
            <div className="flex-shrink-0 flex justify-center">
                {!hideHeaderActions && !['/dashboard', '/workspaces'].includes(location.pathname) && !location.pathname.startsWith('/board/') && searchBarElement}
            </div>

            {/* Right Actions */}
            <div className="flex-1 flex items-center justify-end space-x-6">
                {boardId && <BoardMembersBar boardId={boardId} />}
                {boardId && (
                    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('requestBoardView', { detail: 'board' }))}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Board View"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('requestBoardView', { detail: 'calendar' }))}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Calendar View"
                        >
                            <Calendar className="w-5 h-5" />
                        </button>
                    </div>
                )}
                {boardId && (
                    <button
                        onClick={() => window.dispatchEvent(new Event('toggleBoardFilter'))}
                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors relative"
                        aria-label="Filter"
                    >
                        <Filter className="w-6 h-6" />
                    </button>
                )}
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