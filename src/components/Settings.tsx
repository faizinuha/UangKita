import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { currentUser, logout } = useAuth();
  const { wallet } = useWallet();

  if (!currentUser || !wallet) return null;

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Pengaturan</h1>
              <p className="text-gray-300">Kelola profil dan preferensi Anda</p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentUser.name}</h2>
              <p className="text-gray-600">{currentUser.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                currentUser.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {currentUser.role === 'admin' ? 'Admin Keluarga' : 'Anggota Keluarga'}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profil Pengguna</h3>
                  <p className="text-sm text-gray-600">Ubah nama, email, dan informasi pribadi</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bell className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                  <p className="text-sm text-gray-600">Atur preferensi notifikasi dan peringatan</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="text-purple-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Keamanan</h3>
                  <p className="text-sm text-gray-600">Ganti password dan pengaturan keamanan</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <HelpCircle className="text-orange-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bantuan & Dukungan</h3>
                  <p className="text-sm text-gray-600">FAQ, tutorial, dan hubungi customer service</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Keluarga</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Nama Keluarga</h4>
              <p className="text-blue-700">{wallet.name}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Total Anggota</h4>
              <p className="text-green-700">{wallet.members.length} orang</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};