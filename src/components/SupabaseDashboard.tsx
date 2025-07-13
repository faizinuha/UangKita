import React, { useState } from 'react';
import { useSupabaseWallet } from '../hooks/useSupabaseWallet';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { formatCurrency } from '../utils/formatters';
import { Wallet, TrendingUp, Users, Settings, Eye, EyeOff, Smartphone, Plus, LogOut } from 'lucide-react';

interface SupabaseDashboardProps {
  onNavigate: (page: string) => void;
}

export const SupabaseDashboard: React.FC<SupabaseDashboardProps> = ({ onNavigate }) => {
  const { wallet, members, transactions, danaIntegration, currentMember, loading } = useSupabaseWallet();
  const { signOut } = useSupabaseAuth();
  const [showBalance, setShowBalance] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (!wallet || !currentMember) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Wallet not found</h2>
          <p className="text-gray-600 mb-4">You need to be added to a family wallet first.</p>
          <button
            onClick={() => signOut()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const todayTransactions = transactions.filter(t => 
    new Date(t.created_at).toDateString() === new Date().toDateString()
  );

  const dailySpentPercentage = currentMember.role !== 'admin'
    ? (currentMember.current_daily_spent / currentMember.daily_limit) * 100
    : 0;

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      await signOut();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {currentMember.name}!</h1>
          <p className="text-gray-600">Kelola keuangan keluarga dengan Supabase</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white space-y-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-100 text-sm">Saldo Keluarga - {wallet.name}</p>
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl font-bold">
                {showBalance ? formatCurrency(wallet.balance) : 'Rp ••••••'}
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-blue-100 hover:text-white transition-colors"
              >
                {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Wallet className="text-blue-200" size={32} />
        </div>
        
        {/* Dana Balance Section */}
        {danaIntegration?.is_connected && (
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Smartphone className="text-blue-100" size={16} />
                  <p className="text-blue-100 text-sm">Saldo Dana</p>
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold">
                    {showBalance ? formatCurrency(danaIntegration.balance) : 'Rp ••••••'}
                  </h3>
                </div>
                <p className="text-blue-200 text-xs mt-1">
                  {danaIntegration.phone_number}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => onNavigate('payment')}
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 hover:bg-opacity-30 transition-all"
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📷</span>
              </div>
              <div className="text-xs font-medium">Scan & Bayar</div>
            </div>
          </button>
          
          <button
            onClick={() => onNavigate('transfer')}
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 hover:bg-opacity-30 transition-all"
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
              <div className="text-xs font-medium">Transfer</div>
            </div>
          </button>
        </div>
        
        {/* Dana Style Quick Actions - 3 kotak */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <button
            onClick={() => onNavigate('topup')}
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 hover:bg-opacity-30 transition-all"
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
              <div className="text-xs font-medium">Top Up</div>
            </div>
          </button>
          
          <button
            onClick={() => onNavigate('transactions')}
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 hover:bg-opacity-30 transition-all"
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div className="text-xs font-medium">Riwayat</div>
            </div>
          </button>
          
          <button
            onClick={() => onNavigate('members')}
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 hover:bg-opacity-30 transition-all"
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                <span className="text-lg">👨‍👩‍👧‍👦</span>
              </div>
              <div className="text-xs font-medium">Anggota</div>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Hari ini</span>
          </div>
          <div className="space-y-2">
            {currentMember.role === 'admin' ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentMember.current_daily_spent)}
                </h3>
                <p className="text-sm text-gray-600">Pengeluaran hari ini</p>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium inline-block">
                  👑 Admin - Tanpa Limit
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentMember.current_daily_spent)}
                </h3>
                <p className="text-sm text-gray-600">
                  dari limit {formatCurrency(currentMember.daily_limit)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(dailySpentPercentage, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Anggota</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{members.length}</h3>
            <p className="text-sm text-gray-600">Aktif dalam keluarga</p>
            <button
              onClick={() => onNavigate('members')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Kelola anggota →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">📊</span>
            </div>
            <span className="text-sm text-gray-500">Transaksi</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{todayTransactions.length}</h3>
            <p className="text-sm text-gray-600">Hari ini</p>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Lihat riwayat →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Transaksi Terbaru</h2>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Lihat semua
          </button>
        </div>
        
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => {
            const member = members.find(m => m.id === transaction.from_member_id);
            return (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{transaction.type === 'expense' ? '🛒' : '💳'}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                    <p className="text-sm text-gray-500">
                      {member?.name} • {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {transaction.type === 'topup' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};