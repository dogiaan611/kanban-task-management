import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { apiClient } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            // Gọi API đăng ký
            await apiClient.post('/auth/register', data);

            setSuccessMessage('Đăng ký thành công! Đang chuyển hướng đến trang Đăng nhập...');

            // Đợi 2 giây để người dùng đọc thông báo rồi tự chuyển sang trang login
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-green-600 p-3 rounded-full mb-4 shadow-md">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Tạo tài khoản mới</h2>
                    <p className="text-slate-500 text-sm mt-1">Bắt đầu quản lý công việc ngay hôm nay</p>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-200">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4 text-center border border-green-200">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Nguyễn Văn A"
                            {...register('fullName', { required: 'Vui lòng nhập Họ và tên' })}
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="nhap@email.com"
                            {...register('email', {
                                required: 'Vui lòng nhập Email',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Email không hợp lệ"
                                }
                            })}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            {...register('password', {
                                required: 'Vui lòng nhập Mật khẩu',
                                minLength: {
                                    value: 6,
                                    message: "Mật khẩu phải có ít nhất 6 ký tự"
                                }
                            })}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !!successMessage}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-600 mt-6">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}