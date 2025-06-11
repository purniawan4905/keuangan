import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Guitar as Hospital, Eye, EyeOff, User, Shield, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('Login berhasil!');
      } else {
        toast.error('Email atau password salah');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDemoLogin = async (role: 'admin' | 'finance' | 'viewer') => {
    const demoCredentials = {
      admin: { email: 'admin@hospital.com', password: 'password' },
      finance: { email: 'finance@hospital.com', password: 'password' },
      viewer: { email: 'viewer@hospital.com', password: 'password' }
    };

    setFormData(demoCredentials[role]);
    setLoading(true);

    try {
      const success = await login(demoCredentials[role].email, demoCredentials[role].password);
      if (success) {
        toast.success(`Login berhasil sebagai ${role}!`);
      } else {
        toast.error('Demo login gagal');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="https://pendaftaran.rsusebeningkasih.com/assets/images/logo-laporan.png"
            alt="Logo Rumah Sakit"
            className="mx-auto mt-6 h-12 w-auto"
            draggable={false}
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Masuk ke Sistem
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistem Laporan Keuangan Rumah Sakit
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@hospital.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Daftar disini
                </Link>
              </p>
            </div>

            {/* Demo Login Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-3 text-center">Demo Login:</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                  <Shield className="h-3 w-3" />
                  Admin (Semua Akses)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('finance')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <DollarSign className="h-3 w-3" />
                  Finance (Buat & Edit Laporan)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('viewer')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <User className="h-3 w-3" />
                  Viewer (Hanya Lihat)
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;