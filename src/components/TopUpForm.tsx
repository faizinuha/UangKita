import React, { useState, useRef } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, CreditCard, Building, Smartphone, QrCode, Copy, CheckCircle, Clock, Receipt } from 'lucide-react';

interface TopUpFormProps {
  onBack: () => void;
}

export const TopUpForm: React.FC<TopUpFormProps> = ({ onBack }) => {
  const { wallet, addTransaction } = useWallet();
  const { currentUser } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [barcodeData, setBarcodeData] = useState('');
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];
  
  const topupMethods = [
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
      id: 'bri',
      name: 'BRI',
      icon: Building,
      description: 'Transfer Bank BRI',
      fee: 0,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'bni',
      name: 'BNI',
      icon: Building,
      description: 'Transfer Bank BNI',
      fee: 0,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'dana',
      name: 'Dana',
      icon: Smartphone,
      description: 'Langsung dari Dana',
      fee: 0,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'ovo',
      name: 'OVO',
      icon: Smartphone,
      description: 'Transfer dari OVO',
      fee: 0,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'gopay',
      name: 'GoPay',
      icon: Smartphone,
      description: 'Transfer dari GoPay',
      fee: 0,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'shopeepay',
      name: 'ShopeePay',
      icon: Smartphone,
      description: 'Transfer dari ShopeePay',
      fee: 0,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'credit_card',
      name: 'Kartu Kredit',
      icon: CreditCard,
      description: 'Visa, Mastercard',
      fee: 2500,
      color: 'bg-gray-100 text-gray-600'
    },
    {
      id: 'debit_card',
      name: 'Kartu Debit',
      icon: CreditCard,
      description: 'Debit semua bank',
      fee: 1500,
      color: 'bg-green-100 text-green-600'
    }
  ];

  const generatePayment = (method: string, amount: number) => {
    const timestamp = Date.now();
    const txId = `TOPUP${timestamp}`;
    const data = {
      type: 'topup',
      amount: amount,
      method: method,
      id: txId,
      userId: currentUser?.id,
      familyId: wallet?.id,
      timestamp: timestamp
    };
    
    const barcodeString = btoa(JSON.stringify(data));
    setBarcodeData(barcodeString);
    setTransactionId(txId);
    setPaymentStatus('pending');
    setShowPaymentPage(true);
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setAmount(value);
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleGeneratePayment = () => {
    if (amount && selectedMethod && parseFloat(amount) >= 10000) {
      generatePayment(selectedMethod, parseFloat(amount));
    }
  };

  const copyBarcodeData = () => {
    navigator.clipboard.writeText(barcodeData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulatePayment = async () => {
    setPaymentStatus('pending');
    
    // Simulasi proses pembayaran
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Random success/failure untuk demo
    const isSuccess = Math.random() > 0.1; // 90% success rate
    
    if (isSuccess) {
      setPaymentStatus('success');
      
      // Add transaction to wallet
      if (currentUser && wallet) {
        addTransaction({
          fromMemberId: currentUser.id,
          amount: -parseFloat(amount), // Negative karena menambah saldo
          type: 'topup',
          category: 'Top Up',
          description: `Top Up via ${topupMethods.find(m => m.id === selectedMethod)?.name} - ${formatCurrency(parseFloat(amount))}`,
          status: 'completed'
        });

        // Update saldo (simulasi)
        const updatedWallet = {
          ...wallet,
          balance: wallet.balance + parseFloat(amount)
        };
      }
    } else {
      setPaymentStatus('failed');
    }
  };

  const selectedMethodData = topupMethods.find(m => m.id === selectedMethod);
  const finalAmount = amount ? parseFloat(amount) + (selectedMethodData?.fee || 0) : 0;

  // Payment Page
  if (showPaymentPage) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPaymentPage(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Pembayaran Top Up</h1>
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
                  <p className="text-gray-600">Scan QR code atau gunakan data barcode untuk pembayaran</p>
                </div>

                {/* QR Code Display */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                    <QrCode className="mx-auto text-gray-400 mb-4" size={120} />
                    <p className="text-sm text-gray-500 text-center">QR Code untuk Pembayaran</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-1">Barcode Data:</p>
                    <p className="font-mono text-xs break-all text-gray-700 mb-2">
                      {barcodeData.substring(0, 60)}...
                    </p>
                    <button
                      onClick={copyBarcodeData}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs mx-auto"
                    >
                      {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                      <span>{copied ? 'Copied!' : 'Copy Data'}</span>
                    </button>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode:</span>
                      <span className="font-medium">{selectedMethodData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah Top Up:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                    </div>
                    {selectedMethodData?.fee && selectedMethodData.fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Biaya Admin:</span>
                        <span className="font-medium">{formatCurrency(selectedMethodData.fee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Bayar:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(finalAmount)}</span>
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
                  <p className="text-gray-600">Top up telah berhasil diproses</p>
                </div>

                {/* Receipt */}
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

  // Main Top Up Form
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Top Up Saldo</h1>
              <p className="text-green-100">Isi saldo UangKita dengan mudah</p>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">Saldo Saat Ini</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(wallet?.balance || 0)}
            </p>
          </div>
        </div>

        {/* Top Up Form */}
        <div className="p-6 space-y-6">
          {/* Quick Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pilih Jumlah Top Up
            </label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => handleAmountSelect(quickAmount)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    amount === quickAmount.toString()
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {formatCurrency(quickAmount)}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Atau Masukkan Jumlah Lain
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Masukkan jumlah"
                  min="10000"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pilih Metode Top Up
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topupMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
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
                        <div className="text-green-600">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {amount && selectedMethod && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Ringkasan Top Up</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah Top Up:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                </div>
                {selectedMethodData?.fee && selectedMethodData.fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biaya Admin:</span>
                    <span className="font-medium">{formatCurrency(selectedMethodData.fee)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Bayar:</span>
                  <span className="font-bold text-green-600">{formatCurrency(finalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saldo Setelah Top Up:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency((wallet?.balance || 0) + parseFloat(amount))}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleGeneratePayment}
            disabled={!amount || !selectedMethod || parseFloat(amount) < 10000}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <QrCode size={20} />
            <span>Lanjutkan Pembayaran</span>
          </button>
        </div>
      </div>
    </div>
  );
};