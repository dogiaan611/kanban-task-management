import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './layouts/DashboardLayout'
import WorkspaceList from './pages/WorkspaceList'
import WorkspaceDetail from './pages/WorkspaceDetail'
import Home from './pages/Home'
import BoardDetail from './pages/BoardDetail'
import DashboardOverview from './pages/DashboardOverview'
import Profile from './pages/Profile'

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Các trang yêu cầu đăng nhập sẽ nằm trong DashboardLayout */}
            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardOverview />} />
                <Route path="/workspaces" element={<WorkspaceList />} />
                <Route path="/workspace/:id" element={<WorkspaceDetail />} />
                <Route path="/board/:id" element={<BoardDetail />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
export default App;