import React, { useState, useRef } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, CreditCard, Building, Smartphone, QrCode, Copy, CheckCircle } from 'lucide-react';

interface TopUpFormProps {
  onBack: () => void;
}

export const TopUpForm: React.FC<TopUpFormProps> = ({ onBack }) => {
  const { wallet, addTransaction } = useWallet();
  const { currentUser } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showBarcode, setShowBarcode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [barcodeData, setBarcodeData] = useState('');
  const [copied, setCopied] = useState(false);

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];
  
  const topupMethods = [
    {
      id: 'bank_transfer',
      name: 'Transfer Bank',
      icon: Building,
      description: 'BCA, Mandiri, BRI, BNI',
      fee: 0
    },
    {
      id: 'dana',
      name: 'Dana',
      icon: Smartphone,
      description: 'Langsung dari Dana',
      fee: 0
    },
    {
      id: 'credit_card',
      name: 'Kartu Kredit',
      icon: CreditCard,
      description: 'Visa, Mastercard',
      fee: 2500
    }
  ];

  const generateBarcode = (method: string, amount: number) => {
    // Generate barcode data untuk top up
    const timestamp = Date.now();
    const barcodeId = `TOPUP${timestamp}`;
    const data = {
      type: 'topup',
      amount: amount,
      method: method,
      id: barcodeId,
      userId: currentUser?.id,
      familyId: wallet?.id,
      timestamp: timestamp
    };
    
    const barcodeString = btoa(JSON.stringify(data));
    setBarcodeData(barcodeString);
    setShowBarcode(true);
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
    
    if (amount && parseFloat(amount) > 0) {
      generateBarcode(methodId, parseFloat(amount));
    }
  };

  const copyBarcodeData = () => {
    navigator.clipboard.writeText(barcodeData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTopUp = async () => {
    if (!currentUser || !wallet || !amount || !selectedMethod) return;

    const topupAmount = parseFloat(amount);
    if (topupAmount <= 0) return;

    const method = topupMethods.find(m => m.id === selectedMethod);
    const totalAmount = topupAmount + (method?.fee || 0);

    setIsProcessing(true);

    try {
      // Simulasi proses top up
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      addTransaction({
        fromMemberId: currentUser.id,
        amount: -topupAmount, // Negative karena ini menambah saldo
        type: 'topup',
        category: 'Top Up',
        description: `Top Up via ${method?.name} - ${formatCurrency(topupAmount)}`,
        status: 'completed'
      });

      // Update saldo (simulasi)
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance + topupAmount
      };
      
      alert(`Top Up berhasil! Saldo bertambah ${formatCurrency(topupAmount)}`);
      setShowBarcode(false);
      onBack();
    } catch (error) {
      alert('Top Up gagal. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedMethodData = topupMethods.find(m => m.id === selectedMethod);
  const finalAmount = amount ? parseFloat(amount) + (selectedMethodData?.fee || 0) : 0;

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

        {/* Barcode Modal */}
        {showBarcode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Barcode Top Up</h3>
                <p className="text-gray-600 text-sm">
                  Gunakan barcode ini untuk top up via {selectedMethodData?.name}
                </p>
              </div>

              {/* Barcode Display */}
              <div className="bg-gray-100 rounded-lg p-6 mb-4">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg mb-4 border-2 border-dashed border-gray-300">
                    <QrCode className="mx-auto text-gray-400" size={80} />
                    <p className="text-xs text-gray-500 mt-2">QR Code</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-1">Barcode Data:</p>
                    <p className="font-mono text-xs break-all text-gray-700">
                      {barcodeData.substring(0, 50)}...
                    </p>
                    <button
                      onClick={copyBarcodeData}
                      className="mt-2 flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs mx-auto"
                    >
                      {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Amount Info */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Jumlah Top Up:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(amount))}</span>
                </div>
                {selectedMethodData?.fee && selectedMethodData.fee > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Biaya Admin:</span>
                    <span className="text-sm">{formatCurrency(selectedMethodData.fee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-medium">Total Bayar:</span>
                  <span className="font-bold text-green-600">{formatCurrency(finalAmount)}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleTopUp}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Top Up</span>
                  )}
                </button>
                <button
                  onClick={() => setShowBarcode(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

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
            <div className="space-y-3">
              {topupMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        selectedMethod === method.id ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={
                          selectedMethod === method.id ? 'text-green-600' : 'text-gray-600'
                        } size={20} />
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
            onClick={() => {
              if (amount && selectedMethod) {
                generateBarcode(selectedMethod, parseFloat(amount));
              }
            }}
            disabled={!amount || !selectedMethod || parseFloat(amount) < 10000}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <QrCode size={20} />
            <span>Generate Barcode Top Up</span>
          </button>
        </div>
      </div>
    </div>
  );
};