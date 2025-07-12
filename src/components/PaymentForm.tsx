import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, Camera, CreditCard, QrCode, X, Users } from 'lucide-react';

interface PaymentFormProps {
  onBack: () => void;
  mode?: 'payment' | 'transfer';
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onBack, mode = 'payment' }) => {
  const { wallet, addTransaction } = useWallet();
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const categories = [
    'Makanan', 'Transportasi', 'Belanja', 'Kesehatan', 
    'Hiburan', 'Pendidikan', 'Lainnya'
  ];

  const isTransferMode = mode === 'transfer';
  const availableMembers = wallet?.members.filter(m => m.id !== currentUser?.id) || [];

  useEffect(() => {
    return () => {
      // Cleanup camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const simulateQRScan = () => {
    // Simulasi scan QR code
    const mockQRData = {
      merchant: 'Warung Makan Sederhana',
      amount: '25000',
      category: 'Makanan'
    };
    
    setScannedData(`${mockQRData.merchant} - ${formatCurrency(parseInt(mockQRData.amount))}`);
    setDescription(mockQRData.merchant);
    setAmount(mockQRData.amount);
    setCategory(mockQRData.category);
    stopCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !wallet) return;

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) return;

    if (isTransferMode && !selectedMember) {
      alert('Pilih anggota tujuan transfer!');
      return;
    }

    const currentMember = wallet.members.find(m => m.id === currentUser.id);
    if (!currentMember) return;

    // Check limits for payment mode
    if (!isTransferMode) {
      if (currentMember.currentDailySpent + paymentAmount > currentMember.dailyLimit) {
        alert('Pembayaran melebihi limit harian Anda!');
        return;
      }
    }

    if (paymentAmount > wallet.balance) {
      alert('Saldo tidak mencukupi!');
      return;
    }

    setIsProcessing(true);

    try {
      if (isTransferMode) {
        // Transfer to family member
        addTransaction({
          fromMemberId: currentUser.id,
          toMemberId: selectedMember,
          amount: paymentAmount,
          type: 'transfer',
          category: 'Transfer',
          description: `Transfer ke ${wallet.members.find(m => m.id === selectedMember)?.name}`,
          status: 'completed'
        });
      } else {
        // Regular payment
        addTransaction({
          fromMemberId: currentUser.id,
          amount: paymentAmount,
          type: 'expense',
          category,
          description,
          status: 'completed'
        });
      }

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(isTransferMode ? 'Transfer berhasil!' : 'Pembayaran berhasil!');
      onBack();
    } catch (error) {
      alert(isTransferMode ? 'Transfer gagal. Silakan coba lagi.' : 'Pembayaran gagal. Silakan coba lagi.');
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
        <div className={`bg-gradient-to-r ${isTransferMode ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-indigo-600'} text-white p-6`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">
                {isTransferMode ? 'Transfer Uang' : 'Pembayaran'}
              </h1>
              <p className={isTransferMode ? 'text-green-100' : 'text-blue-100'}>
                {isTransferMode ? 'Transfer ke anggota keluarga' : 'Bayar dengan scan QR atau input manual'}
              </p>
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
            {!isTransferMode && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Limit Harian Tersisa</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(remainingLimit)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="relative w-full max-w-md">
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
              >
                <X size={20} />
              </button>
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                  <QrCode className="text-white" size={48} />
                </div>
              </div>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={simulateQRScan}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Simulasi Scan QR
                </button>
              </div>
              
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white text-center">
                <p className="text-sm">Arahkan kamera ke QR Code</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* QR Scanner Button (only for payment mode) */}
          {!isTransferMode && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={startCamera}
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Camera size={20} />
                <span>Scan QR</span>
              </button>
              <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm">Input Manual</span>
              </div>
            </div>
          )}

          {/* Scanned Data Display */}
          {scannedData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <QrCode className="text-green-600" size={16} />
                <span className="text-green-800 text-sm font-medium">QR Code Terdeteksi:</span>
              </div>
              <p className="text-green-700 mt-1">{scannedData}</p>
            </div>
          )}

          {/* Transfer Member Selection */}
          {isTransferMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer ke Anggota
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="">Pilih anggota tujuan</option>
                {availableMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah {isTransferMode ? 'Transfer' : 'Pembayaran'}
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
                max={isTransferMode ? wallet?.balance : Math.min(wallet?.balance || 0, remainingLimit)}
                required
              />
            </div>
          </div>

          {!isTransferMode && (
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
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              rows={3}
              placeholder={isTransferMode ? "Catatan transfer..." : "Tulis deskripsi pembayaran..."}
              required={!isTransferMode}
            />
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Metode {isTransferMode ? 'Transfer' : 'Pembayaran'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                <div className="flex items-center space-x-3">
                  {isTransferMode ? (
                    <Users className="text-green-600" size={20} />
                  ) : (
                    <CreditCard className="text-blue-600" size={20} />
                  )}
                  <div>
                    <p className="font-medium">Saldo UangKita</p>
                    <p className="text-sm text-gray-500">
                      {isTransferMode ? 'Transfer internal' : 'Bayar dengan saldo'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 opacity-50 cursor-not-allowed">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-400 rounded"></div>
                  <div>
                    <p className="font-medium text-gray-400">Dana/E-Wallet</p>
                    <p className="text-sm text-gray-400">Segera hadir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !amount || (!isTransferMode && !description) || (isTransferMode && !selectedMember)}
            className={`w-full bg-gradient-to-r ${isTransferMode ? 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'} text-white py-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                {isTransferMode ? <Users size={20} /> : <CreditCard size={20} />}
                <span>
                  {isTransferMode ? 'Transfer' : 'Bayar'} {amount && formatCurrency(parseFloat(amount))}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};