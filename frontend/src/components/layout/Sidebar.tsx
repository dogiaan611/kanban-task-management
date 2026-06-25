import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Briefcase, User as UserIcon } from 'lucide-react';

const Sidebar = () => {
    // Xử lý đăng xuất (Xóa token và đẩy về login)
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <aside className="w-64 bg-emerald-600 text-white flex flex-col h-screen shrink-0 shadow-2xl transition-all duration-300">
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center border-b border-white/20 font-extrabold text-xl tracking-wider text-white">
                KANBAN
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                            isActive
                                ? 'bg-white text-emerald-600 shadow-md shadow-black/10'
                                : 'text-white/80 hover:bg-white/20 hover:text-white'
                        }`
                    }
                >
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/workspaces"
                    className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                            isActive
                                ? 'bg-white text-emerald-600 shadow-md shadow-black/10'
                                : 'text-white/80 hover:bg-white/20 hover:text-white'
                        }`
                    }
                >
                    <Briefcase className="w-5 h-5 mr-3" />
                    <span>Workspaces</span>
                </NavLink>

                {/* Tính năng mở rộng sau này */}
                <div className="flex items-center px-4 py-3 rounded-xl text-white/40 cursor-not-allowed font-medium">
                    <Users className="w-5 h-5 mr-3" />
                    <span>Members</span>
                </div>
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                            isActive
                                ? 'bg-white text-emerald-600 shadow-md shadow-black/10'
                                : 'text-white/80 hover:bg-white/20 hover:text-white'
                        }`
                    }
                >
                    <UserIcon className="w-5 h-5 mr-3" />
                    <span>Profile</span>
                </NavLink>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/20">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-4 py-3 text-white/80 hover:text-white hover:bg-rose-500/80 rounded-xl transition-all duration-200 font-bold"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;