import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import { Wallet, TrendingUp, Users, Settings, Eye, EyeOff } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { wallet } = useWallet();
  const { currentUser } = useAuth();
  const [showBalance, setShowBalance] = React.useState(true);

  if (!wallet || !currentUser) return null;

  const currentMember = wallet.members.find(m => m.id === currentUser.id);
  const todayTransactions = wallet.transactions.filter(t => 
    new Date(t.timestamp).toDateString() === new Date().toDateString()
  );

  const dailySpentPercentage = currentMember 
    ? (currentMember.currentDailySpent / currentMember.dailyLimit) * 100
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {currentUser.name}!</h1>
          <p className="text-gray-600">Kelola keuangan keluarga dengan mudah</p>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-100 text-sm">Saldo Keluarga</p>
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
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => onNavigate('payment')}
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💳</div>
              <div className="text-sm font-medium">Bayar</div>
            </div>
          </button>
          
          <button
            onClick={() => onNavigate('transfer')}
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💸</div>
              <div className="text-sm font-medium">Transfer</div>
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
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentMember?.currentDailySpent || 0)}
            </h3>
            <p className="text-sm text-gray-600">
              dari limit {formatCurrency(currentMember?.dailyLimit || 0)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(dailySpentPercentage, 100)}%` }}
              />
            </div>
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
            <h3 className="text-2xl font-bold text-gray-900">{wallet.members.length}</h3>
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
          {wallet.transactions.slice(0, 5).map((transaction) => {
            const member = wallet.members.find(m => m.id === transaction.fromMemberId);
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
                    -{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString('id-ID')}
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