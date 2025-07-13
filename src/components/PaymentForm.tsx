import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, Camera, CreditCard, QrCode, X, Users, Building, Smartphone, CheckCircle, Receipt, Clock } from 'lucide-react';

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
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [transactionId, setTransactionId] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const categories = [
    'Makanan', 'Transportasi', 'Belanja', 'Kesehatan', 
    'Hiburan', 'Pendidikan', 'Lainnya'
  ];

  const paymentMethods = [
    {
      id: 'uangkita',
      name: 'Saldo UangKita',
      icon: CreditCard,
      description: isTransferMode ? 'Transfer internal' : 'Bayar dengan saldo',
      fee: 0,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'bca',
      name: 'BCA',
      icon: Building,
      description: 'Transfer Bank BCA',
      fee: 0,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'mandiri',
      name: 'Mandiri',
      icon: Building,
      description: 'Transfer Bank Mandiri',
      fee: 0,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'dana',
      name: 'Dana',
      icon: Smartphone,
      description: 'Bayar dengan Dana',
      fee: 0,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'ovo',
      name: 'OVO',
      icon: Smartphone,
      description: 'Bayar dengan OVO',
      fee: 0,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'gopay',
      name: 'GoPay',
      icon: Smartphone,
      description: 'Bayar dengan GoPay',
      fee: 0,
      color: 'bg-green-100 text-green-600'
    }
  ];

  const isTransferMode = mode === 'transfer';
  const availableMembers = wallet?.members.filter(m => m.id !== currentUser?.id) || [];

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
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

  const generatePayment = () => {
    if (!amount || !selectedMethod || (!isTransferMode && !description) || (isTransferMode && !selectedMember)) {
      alert('Lengkapi semua data pembayaran!');
      return;
    }

    const timestamp = Date.now();
    const txId = `PAY${timestamp}`;
    setTransactionId(txId);
    setPaymentStatus('pending');
    setShowPaymentPage(true);
  };

  const simulatePayment = async () => {
    setPaymentStatus('pending');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      setPaymentStatus('success');
      
      if (currentUser && wallet) {
        if (isTransferMode) {
          addTransaction({
            fromMemberId: currentUser.id,
            toMemberId: selectedMember,
            amount: parseFloat(amount),
            type: 'transfer',
            category: 'Transfer',
            description: `Transfer ke ${wallet.members.find(m => m.id === selectedMember)?.name}`,
            status: 'completed'
          });
        } else {
          addTransaction({
            fromMemberId: currentUser.id,
            amount: parseFloat(amount),
            type: 'expense',
            category,
            description,
            status: 'completed'
          });
        }
      }
    } else {
      setPaymentStatus('failed');
    }
  };

  const currentMember = wallet?.members.find(m => m.id === currentUser?.id);
  const remainingLimit = currentMember && currentMember.role !== 'admin'
    ? currentMember.dailyLimit - currentMember.currentDailySpent
    : wallet?.balance || 0;

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  // Payment Page
  if (showPaymentPage) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className={`bg-gradient-to-r ${isTransferMode ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-indigo-600'} text-white p-6`}>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPaymentPage(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isTransferMode ? 'Transfer' : 'Pembayaran'}
                </h1>
                <p className="text-blue-100">ID: {transactionId}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {paymentStatus === 'pending' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="text-blue-600" size={32} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Menunggu Pembayaran</h3>
                  <p className="text-gray-600">Konfirmasi pembayaran Anda</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                    <QrCode className="mx-auto text-gray-400 mb-4" size={120} />
                    <p className="text-sm text-gray-500 text-center">QR Code untuk Pembayaran</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode:</span>
                      <span className="font-medium">{selectedMethodData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deskripsi:</span>
                      <span className="font-medium">{description}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(parseFloat(amount))}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={simulatePayment}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Simulasi Pembayaran Berhasil
                </button>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">Pembayaran Berhasil!</h3>
                  <p className="text-gray-600">{isTransferMode ? 'Transfer' : 'Pembayaran'} telah berhasil diproses</p>
                </div>

                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Receipt className="text-gray-600" size={24} />
                    <span className="ml-2 font-bold text-gray-900">STRUK PEMBAYARAN</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>ID Transaksi:</span>
                      <span className="font-mono">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{new Date().toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metode:</span>
                      <span>{selectedMethodData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jumlah:</span>
                      <span>{formatCurrency(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deskripsi:</span>
                      <span>{description}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Status:</span>
                      <span className="text-green-600">BERHASIL ✓</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onBack}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-red-600 text-2xl">✗</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">Pembayaran Gagal</h3>
                  <p className="text-gray-600">Terjadi kesalahan saat memproses pembayaran</p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setPaymentStatus('pending')}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={onBack}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {currentMember?.role === 'admin' ? 'Status' : 'Limit Tersisa'}
              </p>
              <p className="text-xl font-bold text-green-600">
                {currentMember?.role === 'admin' ? '👑 Admin' : formatCurrency(remainingLimit)}
              </p>
            </div>
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
        <form onSubmit={(e) => { e.preventDefault(); generatePayment(); }} className="p-6 space-y-6">
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
                max={wallet?.balance}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${method.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                        {method.fee > 0 && (
                          <p className="text-xs text-orange-600">
                            Biaya admin: {formatCurrency(method.fee)}
                          </p>
                        )}
                      </div>
                      {selectedMethod === method.id && (
                        <div className="text-blue-600">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !amount || !selectedMethod || (!isTransferMode && !description) || (isTransferMode && !selectedMember)}
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
                  Lanjutkan {isTransferMode ? 'Transfer' : 'Pembayaran'} {amount && formatCurrency(parseFloat(amount))}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};