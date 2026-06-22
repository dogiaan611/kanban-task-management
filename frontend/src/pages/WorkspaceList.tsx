import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkspaces, createWorkspace, deleteWorkspace } from '../api/workspaceService';
import { Plus, Briefcase, Trash2, ArrowRight, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const WorkspaceList = () => {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const q = searchParams.get('q') || undefined;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    // Hook lấy danh sách Workspace từ API
    const { data: workspaces, isLoading } = useQuery({
        queryKey: ['workspaces', q],
        queryFn: () => getWorkspaces(q)
    });

    // Hook tạo mới Workspace
    const createMutation = useMutation({
        mutationFn: () => createWorkspace(newName, newDesc),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] }); // Tự động load lại danh sách
            setIsModalOpen(false);
            setNewName('');
            setNewDesc('');
        }
    });

    // Hook xóa Workspace
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteWorkspace(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] }); // Tự động load lại danh sách
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        createMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Workspaces</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md shadow-emerald-200 flex items-center hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Workspace
                </button>
            </div>

            {/* Grid hiển thị các Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {workspaces?.map((ws) => (
                    <div key={ws.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        {/* Hình tròn trang trí mờ mờ ở góc thẻ */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-slate-800 pr-4">{ws.name}</h3>
                                {ws.userRole === 'ROLE_ADMIN' && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if(window.confirm('Are you sure you want to delete this workspace?')) {
                                                deleteMutation.mutate(ws.id);
                                            }
                                        }}
                                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors shrink-0"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">{ws.description || 'No description.'}</p>

                            {/* Nút bấm vào trong Workspace để xem các Board */}
                            <Link
                                to={`/workspace/${ws.id}`}
                                className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-800 group/link"
                            >
                                Access
                                <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Nếu chưa có Workspace nào thì hiển thị giao diện này */}
                {workspaces?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-300">
                        <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No Workspaces Yet</h3>
                        <p className="text-slate-500 mb-8 text-center">Start by creating your first workspace to collaborate.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-2 bg-emerald-50 text-emerald-600 font-medium px-6 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                            Create Workspace
                        </button>
                    </div>
                )}
            </div>

            {/* Modal hiển thị Form tạo mới Workspace */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    {/* Giao diện Modal nổi lên */}
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Workspace</h2>

                        <form onSubmit={handleCreate}>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Workspace Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                                        placeholder="e.g. Marketing Team..."
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
                                    <textarea
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-slate-700"
                                        placeholder="Describe the purpose of this workspace..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceList;