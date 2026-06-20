import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden pt-20">
            {/* Header / Navbar */}
            <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 transition-all duration-300 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center text-slate-800 font-extrabold text-2xl tracking-tight">
                        Kanban
                    </div>
                    <nav className="hidden md:flex items-center space-x-10 text-[13px] font-bold text-slate-500">
                        <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
                        <a href="#about" className="hover:text-emerald-600 transition-colors">About Us</a>
                        <a href="#contact" className="hover:text-emerald-600 transition-colors">Contact</a>
                    </nav>
                    <div className="flex items-center space-x-6 text-[13px]">
                        <Link to="/login" className="text-slate-500 font-bold hover:text-emerald-600 transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>
            
            {/* Vùng nội dung trống để bạn thêm sau */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Bạn có thể thêm nội dung mới vào đây */}
            </main>
        </div>
    );
};

export default Home;
