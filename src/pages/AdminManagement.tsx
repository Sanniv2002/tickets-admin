import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { addAdmin, whoami, getAdmins } from '../services/api';
import { Loader2, Lock, UserPlus, Shield, User } from 'lucide-react';

interface Admin {
  email: string;
  isSuperAdmin: boolean;
  hasOnboarded: boolean;
}

const AdminManagement = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const user = await whoami();
      setIsSuperAdmin(user?.isSuperAdmin || false);
      if (user?.isSuperAdmin) {
        fetchAdmins();
      }
    };
    checkUser();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const adminList = await getAdmins();
      setAdmins(adminList.admins);
    } catch (error) {
      toast.error('Failed to fetch admins');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error('Only superadmins can add new admins');
      return;
    }

    try {
      setLoading(true);
      await addAdmin(email);
      toast.success('Admin added successfully');
      setEmail('');
      fetchAdmins(); // Refresh the list after adding new admin
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
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

        <div>
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Admin List</h2>
            
            {loadingAdmins ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800 pr-2">
                {admins.map((admin, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      admin.isSuperAdmin ? 'bg-red-600/10 border border-red-600/20' : 'bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {admin.isSuperAdmin ? (
                        <Shield className="w-5 h-5 text-red-500" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <span className={`${admin.isSuperAdmin ? 'text-red-500 font-medium' : 'text-gray-300'}`}>
                          {admin.email}
                        </span>
                        {!admin.hasOnboarded && (
                          <p className="text-sm text-yellow-500">Pending onboarding</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {admin.isSuperAdmin && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-600/20 text-red-400">
                          Super Admin
                        </span>
                      )}
                      {!admin.hasOnboarded && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-600/20 text-yellow-400">
                          Not Onboarded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;