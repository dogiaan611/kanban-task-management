import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            // Gọi API đăng ký
            await apiClient.post('/auth/register', data);

            setSuccessMessage('Registration successful! Redirecting to login...');

            // Đợi 2 giây để người dùng đọc thông báo rồi tự chuyển sang trang login
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-10 flex items-center justify-center font-sans bg-slate-100">
            {/* Main Card */}
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative">
                <div className="p-10 sm:p-14 flex flex-col justify-center">

                    <div className="max-w-md w-full mx-auto">
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Create an account</h2>
                        <div className="text-slate-400 text-sm mb-8 font-medium">Start managing your tasks today</div>

                        {errorMessage && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 text-center border border-red-200">
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-6 text-center border border-green-200">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            {/* Full Name Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                                    placeholder="e.g. John Doe"
                                    {...register('fullName', { required: 'Please enter your Full Name' })}
                                />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-5 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                                    placeholder="your@email.com"
                                    {...register('email', {
                                        required: 'Please enter your Email',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email format"
                                        }
                                    })}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-5 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium pr-12 text-slate-700"
                                        placeholder="••••••••"
                                        {...register('password', {
                                            required: 'Please enter your Password',
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters"
                                            }
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !!successMessage}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-full transition-colors flex justify-center items-center shadow-lg shadow-emerald-600/30 mt-10"
                            >
                                {isLoading ? 'Processing...' : 'Sign Up'}
                            </button>
                        </form>

                        <div className="mt-8 flex items-center justify-center text-sm">
                            <span className="text-slate-400 mr-4 font-medium">Already have an account?</span>
                            <Link to="/login" className="px-6 py-2 border border-slate-200 rounded-full font-bold text-slate-600 hover:border-emerald-600 hover:text-emerald-600 transition-colors shadow-sm">
                                LOGIN
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}