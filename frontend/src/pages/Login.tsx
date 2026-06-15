import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn } from 'lucide-react';
import { apiClient } from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            // Gọi API đăng nhập
            const response = await apiClient.post('/auth/login', data);

            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));

            // Chuyển hướng vào trang Dashboard (Ta sẽ làm sau)
            navigate('/');
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-full mb-4 shadow-md">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Đăng nhập Kanban</h2>
                    <p className="text-slate-500 text-sm mt-1">Quản lý công việc nhóm hiệu quả</p>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-200">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="nhap@email.com"
                            {...register('email', { required: 'Vui lòng nhập Email' })}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            {...register('password', { required: 'Vui lòng nhập Mật khẩu' })}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-600 mt-6">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                        Đăng ký ngay
                    </Link>
                </p>

            </div>
        </div>
    );
}