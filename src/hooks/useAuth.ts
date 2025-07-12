import { useState, useEffect } from 'react';
import { FamilyMember } from '../types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    // Demo accounts - in real app, this would call an API
    const demoAccounts = [
      {
        id: '1',
        name: 'Bapak Admin',
        email: 'admin@uangkita.com',
        role: 'admin' as const,
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
        role: 'member' as const,
        dailyLimit: 300000,
        monthlyLimit: 5000000,
        currentDailySpent: 0,
        currentMonthlySpent: 0,
        isActive: true,
        createdAt: new Date()
      }
    ];
    
    const user = demoAccounts.find((account) => account.email === email);
    
    if (user && password === 'password') {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return {
    currentUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentUser
  };
};