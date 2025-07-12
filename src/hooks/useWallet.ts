import { useState, useEffect } from 'react';
import { FamilyMember, Transaction, FamilyWallet } from '../types';

export const useWallet = () => {
  const [wallet, setWallet] = useState<FamilyWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize wallet data
    const savedWallet = localStorage.getItem('familyWallet');
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
    } else {
      // Create initial wallet
      const initialWallet: FamilyWallet = {
        id: '1',
        name: 'Keluarga Bahagia',
        balance: 5000000,
        currency: 'IDR',
        adminId: '1',
        members: [
          {
            id: '1',
            name: 'Bapak Admin',
            email: 'admin@uangkita.com',
            role: 'admin',
            dailyLimit: 500000,
            monthlyLimit: 10000000,
            currentDailySpent: 0,
            currentMonthlySpent: 0,
            isActive: true,
            createdAt: new Date()
          },
          {
            id: '2',
            name: 'Ibu Rumah Tangga',
            email: 'ibu@uangkita.com',
            role: 'member',
            dailyLimit: 300000,
            monthlyLimit: 5000000,
            currentDailySpent: 0,
            currentMonthlySpent: 0,
            isActive: true,
            createdAt: new Date()
          }
        ],
        transactions: [
          {
            id: '1',
            fromMemberId: '1',
            amount: 150000,
            type: 'expense',
            category: 'Makanan',
            description: 'Belanja bulanan di supermarket',
            timestamp: new Date(),
            status: 'completed'
          }
        ],
        createdAt: new Date()
      };
      setWallet(initialWallet);
      localStorage.setItem('familyWallet', JSON.stringify(initialWallet));
      localStorage.setItem('familyMembers', JSON.stringify(initialWallet.members));
    }
    setIsLoading(false);
  }, []);

  const saveWallet = (updatedWallet: FamilyWallet) => {
    setWallet(updatedWallet);
    localStorage.setItem('familyWallet', JSON.stringify(updatedWallet));
    localStorage.setItem('familyMembers', JSON.stringify(updatedWallet.members));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!wallet) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    const updatedWallet = {
      ...wallet,
      balance: wallet.balance - transaction.amount,
      transactions: [newTransaction, ...wallet.transactions]
    };

    // Update member spending
    const memberIndex = updatedWallet.members.findIndex(m => m.id === transaction.fromMemberId);
    if (memberIndex !== -1) {
      updatedWallet.members[memberIndex].currentDailySpent += transaction.amount;
      updatedWallet.members[memberIndex].currentMonthlySpent += transaction.amount;
    }

    saveWallet(updatedWallet);
  };

  const updateMemberLimit = (memberId: string, dailyLimit: number, monthlyLimit: number) => {
    if (!wallet) return;

    const memberIndex = wallet.members.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      const updatedWallet = {
        ...wallet,
        members: wallet.members.map(m => 
          m.id === memberId 
            ? { ...m, dailyLimit, monthlyLimit }
            : m
        )
      };
      saveWallet(updatedWallet);
    }
  };

  const addMember = (member: Omit<FamilyMember, 'id' | 'createdAt'>) => {
    if (!wallet) return;

    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    const updatedWallet = {
      ...wallet,
      members: [...wallet.members, newMember]
    };

    saveWallet(updatedWallet);
  };

  return {
    wallet,
    isLoading,
    addTransaction,
    updateMemberLimit,
    addMember,
    saveWallet
  };
};