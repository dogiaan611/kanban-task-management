import React, { useEffect, useState } from 'react';
import { Briefcase, LayoutDashboard, CheckSquare, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as dashboardService from '../api/dashboardService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DashboardOverview = () => {
    const [stats, setStats] = useState<dashboardService.DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await dashboardService.getDashboardStats();
                setStats(data);
            } catch (err: any) {
                setError('Failed to load dashboard statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return <div className="p-8 text-slate-500">Loading dashboard...</div>;
    }

    if (error || !stats) {
        return (
            <div className="p-8">
                <div className="bg-rose-50 text-rose-800 p-4 rounded-xl flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <span>{error || 'Something went wrong.'}</span>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const chartData = Object.entries(stats.cardsByList).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <div className="max-w-7xl mx-auto px-8 pb-8 pt-0 mt-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mr-4">
                        <Briefcase className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Workspaces</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.totalWorkspaces}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                        <LayoutDashboard className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Boards</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.totalBoards}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center">
                    <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mr-4">
                        <CheckSquare className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Assigned Tasks</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.totalAssignedCards}</h3>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Tasks by List</h2>
                <div className="h-[350px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: any) => [`${value} tasks`, 'Count']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <CheckSquare className="w-16 h-16 mb-4 opacity-50" />
                            <p>You don't have any assigned tasks yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
