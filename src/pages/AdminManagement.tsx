import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { addAdmin, whoami } from '../services/api';
import { Loader2, Lock, UserPlus } from 'lucide-react';

const AdminManagement = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  React.useEffect(() => {
    const checkUser = async () => {
      const user = await whoami();
      setIsSuperAdmin(user?.isSuperAdmin || false);
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error('Only superadmins can add new admins');
      return;
    }

    try {
      setLoading(true);
      await addAdmin(email, password);
      toast.success('Admin added successfully');
      setEmail('');
      setPassword('');
    } catch (error) {
      toast.error('Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Lock className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400">Only superadmins can access this page</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Management</h1>
      
      <div className="max-w-md">
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Add New Admin</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Add Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;