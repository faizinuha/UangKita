export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  dailyLimit: number;
  monthlyLimit: number;
  currentDailySpent: number;
  currentMonthlySpent: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  fromMemberId: string;
  toMemberId?: string;
  amount: number;
  type: 'payment' | 'transfer' | 'topup' | 'expense';
  category: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface FamilyWallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  adminId: string;
  members: FamilyMember[];
  transactions: Transaction[];
  createdAt: Date;
}