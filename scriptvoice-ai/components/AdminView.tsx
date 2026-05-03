import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { RefreshIcon, LoaderIcon } from './Icons';

interface AdminViewProps {}

const AdminView: React.FC<AdminViewProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatabase = () => {
    setLoading(true);
    // Simulate API Fetch from LocalStorage DB
    setTimeout(() => {
        const dbString = localStorage.getItem('sv_users_db');
        if (dbString) {
            try {
                const parsed = JSON.parse(dbString);
                // Sort by date descending
                parsed.sort((a: User, b: User) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
                setUsers(parsed);
            } catch (e) {
                console.error("DB Error", e);
                setUsers([]);
            }
        } else {
            setUsers([]);
        }
        setLoading(false);
    }, 600);
  };

  const handleResetDatabase = () => {
    if (window.confirm("WARNING: This will delete ALL user accounts and data. This action cannot be undone. Are you sure?")) {
        localStorage.removeItem('sv_users_db');
        setUsers([]);
        alert("Database has been reset successfully.");
        fetchDatabase();
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  // Metrics Calculation
  const totalUsers = users.length;
  const proUsers = users.filter(u => u.plan === 'Pro').length;
  const totalGenerations = users.reduce((acc, curr) => acc + (curr.generationsCount || 0), 0);
  // Calculate mock revenue based on plan types for demo
  const estimatedRevenue = (proUsers * 29) + (users.filter(u => u.plan === 'Enterprise').length * 99);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-fadeIn bg-gray-50 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage users and view platform performance.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={handleResetDatabase}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
            >
                Reset Database
            </button>
            <button 
                onClick={fetchDatabase}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all"
            >
                <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
            </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{totalUsers}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-1">Active Subscribers</div>
            <div className="text-3xl font-bold text-indigo-600">{proUsers}</div>
        </div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Generations</div>
            <div className="text-3xl font-bold text-gray-900">{totalGenerations}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-1">Est. Revenue</div>
            <div className="text-3xl font-bold text-emerald-600">${estimatedRevenue}<span className="text-sm font-normal text-gray-400">/mo</span></div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">User Database</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{users.length} records</span>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Password</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Plan</th>
                        <th className="px-6 py-3">Generations</th>
                        <th className="px-6 py-3">Joined</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                                <div className="flex justify-center items-center gap-2">
                                    <LoaderIcon className="w-5 h-5 animate-spin" /> Loading database...
                                </div>
                            </td>
                        </tr>
                    ) : users.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No users found in database.</td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {user.name[0]?.toUpperCase()}
                                    </div>
                                    {user.name}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{user.email}</td>
                                <td className="px-6 py-4 font-mono text-xs text-red-500 bg-red-50 px-2 py-1 rounded w-fit select-all">
                                    {user.password || '—'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        user.plan === 'Enterprise' ? 'bg-blue-100 text-blue-700' : 
                                        user.plan === 'Pro' ? 'bg-green-100 text-green-700' : 
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {user.plan}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{user.generationsCount || 0}</td>
                                <td className="px-6 py-4 text-gray-400 text-xs">
                                    {new Date(user.joinedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
