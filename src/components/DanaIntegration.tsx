import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle, Wallet, X, Building, CreditCard } from 'lucide-react';

interface DanaIntegrationProps {
  onClose: () => void;
}

export const DanaIntegration: React.FC<DanaIntegrationProps> = ({ onClose }) => {
  const { wallet, updateDanaIntegration } = useWallet();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const sendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Masukkan nomor Dana yang valid (minimal 10 digit)');
      return;
    }

    // Format nomor telepon
    const formattedNumber = phoneNumber.startsWith('08') ? phoneNumber : '08' + phoneNumber;
    setPhoneNumber(formattedNumber);
    
    alert(`Kode OTP telah dikirim ke ${formattedNumber}\nKode OTP: 123456`);
    setStep('otp');
  };

  const verifyOtp = async () => {
    if (otp !== '123456') {
      alert('Kode OTP salah. Gunakan: 123456');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('idle');

    try {
      // Simulasi proses verifikasi
      await new Promise(resolve => setTimeout(resolve, 2500));

      const danaAccount = {
        phoneNumber,
        accountName: 'User Development',
        balance: Math.floor(Math.random() * 5000000) + 1000000,
        isConnected: true,
        lastSync: new Date(),
        transactions: [
          {
            id: 'DANA001',
            amount: 75000,
            type: 'out' as const,
            description: 'Bayar Merchant - Warung Makan',
            timestamp: new Date(Date.now() - 3600000),
            merchant: 'Warung Sederhana'
          },
          {
            id: 'DANA002',
            amount: 50000,
            type: 'out' as const,
            description: 'Transfer ke Bank BCA',
            timestamp: new Date(Date.now() - 86400000),
            merchant: 'Bank BCA'
          },
          {
            id: 'DANA003',
            amount: 200000,
            type: 'in' as const,
            description: 'Top Up dari Bank Mandiri',
            timestamp: new Date(Date.now() - 172800000),
            merchant: 'Bank Mandiri'
          },
          {
            id: 'DANA004',
            amount: 25000,
            type: 'out' as const,
            description: 'Bayar Parkir Mall',
            timestamp: new Date(Date.now() - 259200000),
            merchant: 'Mall Central Park'
          }
        ]
      };

      updateDanaIntegration(danaAccount);
      setConnectionStatus('success');
      setStep('success');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const syncBalance = async () => {
    if (!wallet?.danaIntegration) return;

    setIsSyncing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate new balance and transactions
      const newBalance = Math.floor(Math.random() * 5000000) + 1000000;
      const newTransaction = {
        id: `DANA${Date.now()}`,
        amount: Math.floor(Math.random() * 100000) + 10000,
        type: Math.random() > 0.5 ? 'in' : 'out' as const,
        description: Math.random() > 0.5 ? 'Top Up dari Bank' : 'Bayar Merchant',
        timestamp: new Date(),
        merchant: Math.random() > 0.5 ? 'Bank BCA' : 'Merchant ABC'
      };

      const updatedDana = {
        ...wallet.danaIntegration,
        balance: newBalance,
        lastSync: new Date(),
        transactions: [newTransaction, ...wallet.danaIntegration.transactions.slice(0, 9)]
      };

      updateDanaIntegration(updatedDana);
      alert('Sinkronisasi berhasil! Saldo dan transaksi telah diperbarui.');
    } catch (error) {
      alert('Gagal melakukan sinkronisasi. Silakan coba lagi.');
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectDana = () => {
    if (confirm('Apakah Anda yakin ingin memutuskan koneksi dengan Dana?')) {
      updateDanaIntegration(null);
      alert('Koneksi Dana telah diputuskan.');
      onClose();
    }
  };

  const danaAccount = wallet?.danaIntegration;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Smartphone size={24} />
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
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!danaAccount?.isConnected ? (
            <div className="space-y-6">
              {step === 'input' && (
                <>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Hubungkan Akun Dana</h3>
                    <p className="text-gray-600 text-sm">Masukkan nomor Dana untuk sinkronisasi saldo dan transaksi</p>
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
                    <p className="text-xs text-gray-500 mt-1">Contoh: 081234567890</p>
                  </div>

                  <button
                    onClick={sendOtp}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Kirim Kode OTP
                  </button>
                </>
              )}

              {step === 'otp' && (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifikasi OTP</h3>
                    <p className="text-gray-600 text-sm">Masukkan kode OTP yang dikirim ke {phoneNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Kode OTP demo: 123456</p>
                  </div>

                  <button
                    onClick={verifyOtp}
                    disabled={isConnecting || otp.length !== 6}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Menghubungkan...</span>
                      </>
                    ) : (
                      <span>Verifikasi & Hubungkan</span>
                    )}
                  </button>

                  <button
                    onClick={() => setStep('input')}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Ubah Nomor
                  </button>

                  {connectionStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                      Gagal menghubungkan ke Dana. Silakan coba lagi.
                    </div>
                  )}
                </>
              )}

              {step === 'success' && (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Berhasil Terhubung!</h3>
                    <p className="text-gray-600 text-sm">Akun Dana Anda telah berhasil dihubungkan</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Selesai
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-green-900">Terhubung ke Dana</p>
                    <p className="text-green-700 text-sm">{danaAccount.phoneNumber}</p>
                    <p className="text-green-600 text-xs">{danaAccount.accountName}</p>
                  </div>
                </div>
              </div>

              {/* Dana Balance */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-blue-100 text-sm">Saldo Dana</span>
                  <Wallet className="text-blue-200" size={20} />
                </div>
                <p className="text-3xl font-bold mb-2">{formatCurrency(danaAccount.balance)}</p>
                <p className="text-blue-100 text-sm">
                  Terakhir sync: {formatDate(danaAccount.lastSync)}
                </p>
              </div>

              {/* Sync Button */}
              <button
                onClick={syncBalance}
                disabled={isSyncing}
                className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
                    <span>Menyinkronkan...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Sinkronkan Saldo</span>
                  </>
                )}
              </button>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Transaksi Dana Terbaru</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {danaAccount.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'in' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <span className="text-lg">
                            {transaction.type === 'in' ? '↓' : '↑'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                          <p className="text-gray-500 text-xs">{transaction.merchant}</p>
                          <p className="text-gray-400 text-xs">{transaction.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${
                          transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-gray-500 text-xs">{formatDate(transaction.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={disconnectDana}
                className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors"
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