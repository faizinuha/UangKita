import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, CreditCard, ShoppingCart } from 'lucide-react';

interface PaymentFormProps {
  onBack: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onBack }) => {
  const { wallet, addTransaction } = useWallet();
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = [
    'Makanan', 'Transportasi', 'Belanja', 'Kesehatan', 
    'Hiburan', 'Pendidikan', 'Lainnya'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !wallet) return;

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) return;

    const currentMember = wallet.members.find(m => m.id === currentUser.id);
    if (!currentMember) return;

    // Check limits
    if (currentMember.currentDailySpent + paymentAmount > currentMember.dailyLimit) {
      alert('Pembayaran melebihi limit harian Anda!');
      return;
    }

    if (paymentAmount > wallet.balance) {
      alert('Saldo tidak mencukupi!');
      return;
    }

    setIsProcessing(true);

    try {
      addTransaction({
        fromMemberId: currentUser.id,
        amount: paymentAmount,
        type: 'expense',
        category,
        description,
        status: 'completed'
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Pembayaran berhasil!');
      onBack();
    } catch (error) {
      alert('Pembayaran gagal. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentMember = wallet?.members.find(m => m.id === currentUser?.id);
  const remainingLimit = currentMember 
    ? currentMember.dailyLimit - currentMember.currentDailySpent
    : 0;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Pembayaran</h1>
              <p className="text-blue-100">Bayar tagihan dan pengeluaran</p>
            </div>
          </div>
        </div>

        {/* Balance Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Saldo Keluarga</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(wallet?.balance || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Limit Harian Tersisa</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(remainingLimit)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Pembayaran
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                placeholder="0"
                min="0"
                max={Math.min(wallet?.balance || 0, remainingLimit)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              rows={3}
              placeholder="Tulis deskripsi pembayaran..."
              required
            />
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                <div className="flex items-center space-x-3">
                  <CreditCard className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium">Saldo UangKita</p>
                    <p className="text-sm text-gray-500">Bayar dengan saldo</p>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 opacity-50 cursor-not-allowed">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-400">E-Wallet</p>
                    <p className="text-sm text-gray-400">Segera hadir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !amount || !description}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CreditCard size={20} />
                <span>Bayar {amount && formatCurrency(parseFloat(amount))}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};