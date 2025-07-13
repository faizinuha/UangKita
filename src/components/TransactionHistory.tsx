import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';
import { ArrowLeft, Search, Filter, Download, FileSpreadsheet, Calendar } from 'lucide-react';

interface TransactionHistoryProps {
  onBack: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onBack }) => {
  const { wallet } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  if (!wallet) return null;

  const filteredTransactions = wallet.transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = Array.from(new Set(wallet.transactions.map(t => t.category)));
  const types = Array.from(new Set(wallet.transactions.map(t => t.type)));

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  const exportToExcel = () => {
    // Create CSV content
    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Jenis', 'Jumlah', 'Status', 'Anggota'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => {
        const member = wallet.members.find(m => m.id === transaction.fromMemberId);
        return [
          formatDate(transaction.timestamp),
          `"${transaction.description}"`,
          transaction.category,
          transaction.type === 'expense' ? 'Pengeluaran' : 
          transaction.type === 'payment' ? 'Pembayaran' : 
          transaction.type === 'transfer' ? 'Transfer' : 'Top Up',
          formatCurrency(transaction.amount),
          transaction.status === 'completed' ? 'Selesai' :
          transaction.status === 'pending' ? 'Pending' : 'Gagal',
          member?.name || 'Unknown'
        ].join(',');
      })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transaksi_uangkita_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 md:p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">Riwayat Transaksi</h1>
              <p className="text-purple-100 text-sm">Kelola dan pantau semua transaksi keluarga</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Transaksi</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Pengeluaran</p>
              <p className="text-xl md:text-2xl font-bold text-red-600">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Rata-rata per Transaksi</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                {formatCurrency(filteredTransactions.length > 0 ? totalAmount / filteredTransactions.length : 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 md:p-6 border-b border-gray-200 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              >
                <option value="all">Semua Jenis</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'expense' ? 'Pengeluaran' : 
                     type === 'payment' ? 'Pembayaran' : 
                     type === 'transfer' ? 'Transfer' : 'Top Up'}
                  </option>
                ))}
              </select>
              
              <button 
                onClick={exportToExcel}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
              >
                <FileSpreadsheet size={16} />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="p-4 md:p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl md:text-6xl mb-4">📊</div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Tidak ada transaksi</h3>
              <p className="text-gray-500 text-sm md:text-base">Belum ada transaksi yang sesuai dengan filter Anda</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredTransactions.map((transaction) => {
                const member = wallet.members.find(m => m.id === transaction.fromMemberId);
                return (
                  <div key={transaction.id} className="bg-gray-50 rounded-lg p-3 md:p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-lg md:text-2xl">
                            {transaction.type === 'expense' ? '🛒' : 
                             transaction.type === 'payment' ? '💳' : 
                             transaction.type === 'transfer' ? '💸' : '💰'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                            {transaction.description}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1">
                            <span className="text-xs md:text-sm text-gray-500">{member?.name}</span>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 sm:mt-0 ${getCategoryColor(transaction.category)} w-fit`}>
                              {transaction.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm md:text-lg font-bold text-gray-900">
                          -{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'completed' ? 'Selesai' :
                           transaction.status === 'pending' ? 'Pending' : 'Gagal'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};