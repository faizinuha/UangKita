import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, Plus, Edit, UserPlus, Crown, User } from 'lucide-react';

interface FamilyMembersProps {
  onBack: () => void;
}

export const FamilyMembers: React.FC<FamilyMembersProps> = ({ onBack }) => {
  const { wallet, updateMemberLimit, addMember } = useWallet();
  const { currentUser } = useAuth();
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    dailyLimit: 100000,
    monthlyLimit: 2000000
  });

  if (!wallet || !currentUser) return null;

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return;

    addMember({
      ...newMember,
      role: 'member',
      currentDailySpent: 0,
      currentMonthlySpent: 0,
      isActive: true
    });

    setNewMember({
      name: '',
      email: '',
      dailyLimit: 100000,
      monthlyLimit: 2000000
    });
    setShowAddMember(false);
  };

  const handleUpdateLimit = (memberId: string, dailyLimit: number, monthlyLimit: number) => {
    updateMemberLimit(memberId, dailyLimit, monthlyLimit);
    setEditingMember(null);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Anggota Keluarga</h1>
                <p className="text-green-100">Kelola anggota dan limit pengeluaran</p>
              </div>
            </div>
            
            {isAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus size={20} />
                <span>Tambah Anggota</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Member Form */}
        {showAddMember && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Tambah Anggota Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Nama anggota"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Limit Harian</label>
                <input
                  type="number"
                  value={newMember.dailyLimit}
                  onChange={(e) => setNewMember({...newMember, dailyLimit: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Limit Bulanan</label>
                <input
                  type="number"
                  value={newMember.monthlyLimit}
                  onChange={(e) => setNewMember({...newMember, monthlyLimit: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleAddMember}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Tambah Anggota
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="p-6">
          <div className="space-y-4">
            {wallet.members.map((member) => {
              const dailyPercentage = (member.currentDailySpent / member.dailyLimit) * 100;
              const monthlyPercentage = (member.currentMonthlySpent / member.monthlyLimit) * 100;
              
              return (
                <div key={member.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {member.role === 'admin' ? <Crown size={20} /> : <User size={20} />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{member.name}</span>
                          {member.role === 'admin' && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              Admin
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    
                    {isAdmin && member.id !== currentUser.id && (
                      <button
                        onClick={() => setEditingMember(member.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </div>
                  
                  {editingMember === member.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Limit Harian</label>
                          <input
                            type="number"
                            defaultValue={member.dailyLimit}
                            id={`daily-${member.id}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Limit Bulanan</label>
                          <input
                            type="number"
                            defaultValue={member.monthlyLimit}
                            id={`monthly-${member.id}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            const dailyInput = document.getElementById(`daily-${member.id}`) as HTMLInputElement;
                            const monthlyInput = document.getElementById(`monthly-${member.id}`) as HTMLInputElement;
                            handleUpdateLimit(member.id, parseInt(dailyInput.value), parseInt(monthlyInput.value));
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingMember(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Pengeluaran Harian</span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(member.currentDailySpent)} / {formatCurrency(member.dailyLimit)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              dailyPercentage > 90 ? 'bg-red-500' : 
                              dailyPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Pengeluaran Bulanan</span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(member.currentMonthlySpent)} / {formatCurrency(member.monthlyLimit)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              monthlyPercentage > 90 ? 'bg-red-500' : 
                              monthlyPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};