import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { resetPassword } from '../services/api';
import { CircleUserRound, Eye, EyeOff, Lock } from 'lucide-react';

const Onboarding = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    if (!id) {
      toast.error("Invalid onboarding link");
      navigate('/mgmt');
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error("Invalid onboarding link");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      // Pass the admin ID to reset the password
      await resetPassword(password);
      toast.success("Password set successfully!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return <Navigate to="/mgmt" replace />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <CircleUserRound className="w-16 h-16 text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-white">Welcome to TedX MGMT</h1>
          <p className="text-gray-400 text-center mt-2">Please set a new password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 px-3 mt-1 rounded-md bg-zinc-800 border-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-2 px-3 mt-1 rounded-md bg-zinc-800 border-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Lock className="animate-spin w-4 h-4 mr-2" />
                Setting password...
              </>
            ) : (
              'Set Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;