import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Camera, AlertCircle, Check, Upload } from 'lucide-react';
import * as userService from '../api/userService';

const Profile = () => {
    const [profile, setProfile] = useState<userService.UserProfile | null>(null);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [profileMessage, setProfileMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setProfileMessage({ type: 'error', text: 'Image size should be less than 2MB.' });
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target?.result as string;
                setAvatarUrl(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await userService.getCurrentUser();
            setProfile(data);
            setFullName(data.fullName || '');
            setAvatarUrl(data.avatarUrl || '');
        } catch (error) {
            console.error('Failed to load profile', error);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage(null);
        setProfileLoading(true);
        try {
            const updated = await userService.updateProfile(fullName, avatarUrl);
            setProfile(updated);
            // Cập nhật lại thông tin trong localStorage để Header/Sidebar hiển thị đúng
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, fullName: updated.fullName, avatarUrl: updated.avatarUrl }));
            window.dispatchEvent(new Event('storage')); // Kích hoạt event để các component khác tự update

            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }

        setPasswordLoading(true);
        try {
            await userService.updatePassword(oldPassword, newPassword);
            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!profile) return <div className="p-8 text-slate-500">Loading profile...</div>;

    return (
        <div className="max-w-7xl mx-auto px-8 pb-8 pt-0 mt-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Profile</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Information Card */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
                            <User className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-lg font-semibold text-slate-800">Personal Information</h2>
                        </div>
                        
                        <div className="p-6">
                            {profileMessage && (
                                <div className={`p-4 rounded-lg mb-6 flex items-start space-x-3 ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                    {profileMessage.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                    <p className="text-sm font-medium">{profileMessage.text}</p>
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="flex items-center space-x-6">
                                    <div className="relative group">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-80 transition-opacity" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-md text-3xl font-bold text-emerald-700">
                                                {fullName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-8 h-8 text-white drop-shadow-md" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                        <input type="email" value={profile.email} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={fullName} 
                                        onChange={e => setFullName(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
                                    <div className="flex space-x-2">
                                        <input 
                                            type="text" 
                                            value={avatarUrl} 
                                            onChange={e => setAvatarUrl(e.target.value)}
                                            className="flex-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                                            placeholder="https://example.com/your-avatar.jpg"
                                        />
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            ref={fileInputRef} 
                                            onChange={handleFileChange} 
                                            className="hidden" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center shadow-sm"
                                            title="Browse local image"
                                        >
                                            <Upload className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center">
                                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                        Paste an image URL or click the upload icon to select a local file (Max 2MB).
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={profileLoading}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center space-x-2 disabled:opacity-70"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{profileLoading ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
                            <Lock className="w-5 h-5 text-rose-500" />
                            <h2 className="text-lg font-semibold text-slate-800">Security</h2>
                        </div>
                        
                        <div className="p-6">
                            {passwordMessage && (
                                <div className={`p-4 rounded-lg mb-6 flex items-start space-x-3 ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                    {passwordMessage.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                    <p className="text-sm font-medium">{passwordMessage.text}</p>
                                </div>
                            )}

                            <form onSubmit={handleUpdatePassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                    <input 
                                        type="password" 
                                        value={oldPassword} 
                                        onChange={e => setOldPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
                                        required
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={passwordLoading}
                                        className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center space-x-2 disabled:opacity-70"
                                    >
                                        <Lock className="w-4 h-4" />
                                        <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-md">
                        <h3 className="font-bold text-lg mb-2 text-emerald-50">Profile Tips</h3>
                        <ul className="space-y-3 text-emerald-50/90 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Use a professional square image for the best avatar result.
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Password should contain numbers and special characters.
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Your email is used for login and cannot be changed here.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
