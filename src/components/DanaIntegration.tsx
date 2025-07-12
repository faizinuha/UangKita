import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle, Wallet } from 'lucide-react';

interface DanaIntegrationProps {
  onClose: () => void;
}

export const DanaIntegration: React.FC<DanaIntegrationProps> = ({ onClose }) => {
  const { wallet, updateDanaIntegration } = useWallet();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Simulasi koneksi ke Dana
  const connectDana = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Masukkan nomor Dana yang valid');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('idle');

    try {
      // Simulasi API call ke Dana
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulasi data Dana
      const danaAccount = {
        phoneNumber,
        accountName: 'User Development',
        balance: Math.floor(Math.random() * 5000000) + 1000000, // Random balance 1-6 juta
        isConnected: true,
        lastSync: new Date(),
        transactions: [
          {
            id: '1',
            amount: 50000,
            type: 'out' as const,
            description: 'Transfer ke Bank',
            timestamp: new Date(Date.now() - 86400000),
            merchant: 'Bank BCA'
          },
          {
            id: '2',
            amount: 100000,
            type: 'in' as const,
            description: 'Top Up dari Bank',
            timestamp: new Date(Date.now() - 172800000),
            merchant: 'Bank Mandiri'
          }
        ]
      };

      updateDanaIntegration(danaAccount);
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  // Simulasi sync saldo
  const syncBalance = async () => {
    if (!wallet?.danaIntegration) return;

    setIsSyncing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulasi update saldo
      const newBalance = Math.floor(Math.random() * 5000000) + 1000000;
      const updatedDana = {
        ...wallet.danaIntegration,
        balance: newBalance,
        lastSync: new Date()
      };
      
      updateDanaIntegration(updatedDana);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const danaAccount = wallet?.danaIntegration;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Integrasi Dana</h2>
                <p className="text-blue-100 text-sm">Hubungkan akun Dana Anda</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {!danaAccount?.isConnected ? (
            /* Connection Form */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hubungkan Akun Dana
                </h3>
                <p className="text-gray-600 text-sm">
                  Masukkan nomor Dana untuk sinkronisasi saldo dan transaksi
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Dana
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {connectionStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="text-red-500" size={16} />
                  <span className="text-red-700 text-sm">Gagal menghubungkan ke Dana</span>
                </div>
              )}

              {connectionStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-green-700 text-sm">Berhasil terhubung ke Dana!</span>
                </div>
              )}

              <button
                onClick={connectDana}
                disabled={isConnecting || !phoneNumber}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Menghubungkan...</span>
                  </>
                ) : (
                  <>
                    <Smartphone size={20} />
                    <span>Hubungkan Dana</span>
                  </>
                )}
              </button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
                  <div className="text-yellow-800 text-sm">
                    <p className="font-medium mb-1">Mode Pengembangan</p>
                    <p>Ini adalah simulasi untuk testing. Data yang ditampilkan adalah contoh dan tidak terhubung ke akun Dana asli.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Connected State */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-green-900">Terhubung ke Dana</p>
                    <p className="text-green-700 text-sm">{danaAccount.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Saldo Dana */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm">Saldo Dana</span>
                  <Wallet className="text-blue-200" size={20} />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(danaAccount.balance)}</p>
                <p className="text-blue-100 text-sm mt-1">
                  Terakhir sync: {formatDate(danaAccount.lastSync)}
                </p>
              </div>

              {/* Sync Button */}
              <button
                onClick={syncBalance}
                disabled={isSyncing}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    <span>Menyinkronkan...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    <span>Sinkronkan Saldo</span>
                  </>
                )}
              </button>

              {/* Recent Dana Transactions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Transaksi Dana Terbaru</h4>
                <div className="space-y-3">
                  {danaAccount.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'in' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <span className="text-sm">
                            {transaction.type === 'in' ? '↓' : '↑'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                          <p className="text-gray-500 text-xs">{transaction.merchant}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${
                          transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(transaction.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={() => updateDanaIntegration(null)}
                className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Putuskan Koneksi Dana
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};