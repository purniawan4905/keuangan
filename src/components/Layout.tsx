import React, { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Guitar as Hospital, BarChart3, FileText, Settings, User, AlertTriangle, Shield, DollarSign, Eye } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasPermission, isAdmin, isFinance } = useAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, permission: 'view_reports' },
    { name: 'Laporan', href: '/reports', icon: FileText, permission: 'view_reports' },
    { name: 'Pengaturan', href: '/settings', icon: Settings, permission: 'manage_settings' },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    toast.success('Anda telah berhasil keluar dari sistem', {
      duration: 3000,
      icon: '👋',
    });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
    toast.success('Logout dibatalkan');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'finance':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-purple-600 bg-purple-50';
      case 'finance':
        return 'text-green-600 bg-green-50';
      case 'viewer':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'finance':
        return 'Finance';
      case 'viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  // Filter navigation based on permissions
  const filteredNavigation = navigation.filter(item => 
    hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <img
            src="https://pendaftaran.rsusebeningkasih.com/assets/images/logo-laporan.png"   
            alt="Logo RS Sebening Kasih"
            className="h-8 w-8"
            draggable={false}
          />
          <span className="ml-2 text-xl font-bold text-gray-900">
            RS Sebening Kasih
          </span>
        </div>
        
        <nav className="mt-8">
          <div className="space-y-1 px-4">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => toast.success(`Membuka halaman ${item.name}`)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Role-based access indicator */}
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <div className={`p-3 rounded-lg ${getRoleColor(user?.role || '')}`}>
            <div className="flex items-center gap-2">
              {getRoleIcon(user?.role || '')}
              <div className="flex-1">
                <p className="text-xs font-medium">Akses Level</p>
                <p className="text-sm font-semibold">{getRoleLabel(user?.role || '')}</p>
              </div>
            </div>
            <div className="mt-2 text-xs">
              {isAdmin() && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Akses Penuh
                </span>
              )}
              {isFinance() && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Kelola Laporan
                </span>
              )}
              {user?.role === 'viewer' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Hanya Lihat
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogoutClick}
              className="ml-3 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              title="Keluar dari sistem"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Logout</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin keluar dari sistem? Semua data yang belum disimpan akan hilang.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Pastikan:</strong> Semua laporan telah disimpan dan tidak ada proses yang sedang berjalan.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Ya, Keluar
              </button>
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;