import { Link } from 'react-router-dom';
import { ArrowRight, Layout, Zap, ShieldCheck, MousePointerClick, Sparkles } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-emerald-500/30">
            {/* Ambient Background Glow (Light Mode) */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/10 blur-[120px]" />
            </div>

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800 font-extrabold text-2xl tracking-tighter">
                        Kanban<span className="text-emerald-500">.</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8 text-[14px] font-medium text-slate-600">
                        <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it works</a>
                        <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Testimonials</a>
                    </nav>
                    <div className="flex items-center space-x-5 text-[14px] font-semibold">
                        <Link to="/login" className="text-slate-600 hover:text-emerald-600 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-md">
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="relative z-10 pt-24 pb-20">
                
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 pt-8 pb-32 flex flex-col items-center text-center w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-medium text-emerald-700 mb-6 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>Kanban v2.0 is now live</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-10 leading-[1.1] text-slate-900 w-full">
                        Master Your Workflow, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                            Elevate Your Team.
                        </span>
                    </h1>
                    
                    <p className="w-full max-w-2xl text-lg md:text-xl text-slate-500 leading-relaxed">
                        The ultimate project management experience designed for modern, agile teams. 
                        Experience real-time collaboration, bank-grade security, and lightning-fast performance.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-12">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-1">
                            Start for free
                        </Link>
                        <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2">
                            Explore Features
                        </a>
                    </div>

                    {/* Dashboard Mockup (CSS) */}
                    <div className="mt-24 relative mx-auto max-w-5xl group">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-200/50 to-transparent blur-3xl -z-10 rounded-full transition-all duration-700 group-hover:bg-emerald-300/50" />
                        <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-xl p-4 md:p-8 shadow-2xl shadow-slate-200 overflow-hidden relative transform transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
                            {/* Browser Header */}
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            
                            {/* Kanban Board Mock */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                {/* Column 1 */}
                                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
                                        To Do <span className="text-xs bg-white border border-slate-200 shadow-sm px-2 py-1 rounded-full text-slate-500">2</span>
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="bg-white hover:bg-slate-50 transition-colors p-4 rounded-lg border border-slate-100 shadow-sm cursor-grab">
                                            <div className="w-10 h-1.5 bg-red-400 rounded-full mb-3" />
                                            <p className="text-sm font-medium text-slate-700">Design System Update</p>
                                        </div>
                                        <div className="bg-white hover:bg-slate-50 transition-colors p-4 rounded-lg border border-slate-100 shadow-sm cursor-grab">
                                            <div className="w-10 h-1.5 bg-blue-400 rounded-full mb-3" />
                                            <p className="text-sm font-medium text-slate-700">User Authentication API</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Column 2 */}
                                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
                                        In Progress <span className="text-xs bg-white border border-slate-200 shadow-sm px-2 py-1 rounded-full text-slate-500">1</span>
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="bg-white hover:bg-slate-50 transition-colors p-4 rounded-lg border border-emerald-400 shadow-[0_4px_20px_-5px_rgba(16,185,129,0.2)] cursor-grab">
                                            <div className="w-10 h-1.5 bg-emerald-500 rounded-full mb-3" />
                                            <p className="text-sm font-medium text-slate-700">Landing Page Redesign</p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 border-2 border-white shadow-sm" />
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 border-2 border-white shadow-sm" />
                                                </div>
                                                <span className="text-[10px] text-emerald-700 font-bold px-2 py-1 bg-emerald-100 rounded-md">In review</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 3 */}
                                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 opacity-60">
                                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
                                        Done <span className="text-xs bg-white border border-slate-200 shadow-sm px-2 py-1 rounded-full text-slate-500">0</span>
                                    </h3>
                                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-white">
                                        <p className="text-xs text-slate-400 font-medium">Drop cards here</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">Everything you need to <span className="text-emerald-500">scale</span></h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            Built with enterprise-grade architecture, PM-KABAN offers powerful features without compromising on simplicity or speed.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                                <Zap className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-800">Real-time Sync</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Powered by WebSockets, every movement, comment, and update reflects instantly across all team members' screens. No refreshing needed.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                                <ShieldCheck className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-800">Advanced RBAC</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Granular permissions ensure data security. Assign roles from Workspace Admin down to View-Only at the card level.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-100 transition-all">
                                <MousePointerClick className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-800">Fluid Drag & Drop</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Effortlessly organize tasks. Our highly optimized DnD engine guarantees a buttery-smooth experience even with hundreds of cards.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-5xl mx-auto px-6 py-24">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 p-12 md:p-20 text-center shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10 leading-tight text-white">Stop managing, start <span className="text-emerald-200">delivering.</span></h2>
                        <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto relative z-10 font-medium">
                            Join the teams that are accelerating their workflow and achieving their goals faster than ever before.
                        </p>
                        <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-emerald-800 font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 relative z-10 shadow-lg">
                            Create your Workspace
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-12 text-center text-slate-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg mb-4 md:mb-0">
                        Kanban.
                    </div>
                    <div className="flex gap-6 mb-4 md:mb-0 font-medium">
                        <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
                    </div>
                    <p>© 2026 Kanban Task Management. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
