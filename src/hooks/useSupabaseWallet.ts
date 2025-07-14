import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

type FamilyWallet = Database['public']['Tables']['family_wallets']['Row'];
type FamilyMember = Database['public']['Tables']['family_members']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type DanaIntegration = Database['public']['Tables']['dana_integrations']['Row'];
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

export const useSupabaseWallet = () => {
  const { user } = useSupabaseAuth();
  const [wallet, setWallet] = useState<FamilyWallet | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [danaIntegration, setDanaIntegration] = useState<DanaIntegration | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);

  // Load wallet data
  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get current member
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error loading member:', memberError);
        return;
      }

      // Check if user has a family member record
      if (!memberData || memberData.length === 0) {
        setCurrentMember(null);
        setWallet(null);
        setMembers([]);
        setTransactions([]);
        setDanaIntegration(null);
        return;
      }

      const currentMemberData = memberData[0];
      setCurrentMember(memberData);

      // Get wallet
      const { data: walletData, error: walletError } = await supabase
        .from('family_wallets')
        .select('*')
        .eq('id', currentMemberData.wallet_id)
        .single();

      if (walletError) {
        console.error('Error loading wallet:', walletError);
        return;
      }

      setWallet(walletData);

      // Get all family members
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .eq('wallet_id', currentMemberData.wallet_id)
        .order('created_at');

      if (membersError) {
        console.error('Error loading members:', membersError);
      } else {
        setMembers(membersData);
      }

      // Get transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', currentMemberData.wallet_id)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
      } else {
        setTransactions(transactionsData);
      }

      // Get Dana integration
      const { data: danaData, error: danaError } = await supabase
        .from('dana_integrations')
        .select('*')
        .eq('wallet_id', currentMemberData.wallet_id)
        .single();

      if (!danaError && danaData) {
        setDanaIntegration(danaData);
      }

      // Get payment methods
      const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (paymentMethodsError) {
        console.error('Error loading payment methods:', paymentMethodsError);
      } else {
        setPaymentMethods(paymentMethodsData);
      }

    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create transaction
  const createTransaction = async (transactionData: {
    amount: number;
    type: 'payment' | 'transfer' | 'topup' | 'expense';
    category: string;
    description: string;
    to_member_id?: string;
    payment_method?: string;
  }) => {
    if (!user || !currentMember || !wallet) return null;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallet.id,
          from_member_id: currentMember.id,
          to_member_id: transactionData.to_member_id || null,
          amount: transactionData.amount,
          type: transactionData.type,
          category: transactionData.category,
          description: transactionData.description,
          payment_method: transactionData.payment_method || null,
          status: 'completed',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        return null;
      }

      // Reload data
      await loadWalletData();
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  };

  // Update member limits
  const updateMemberLimits = async (memberId: string, dailyLimit: number, monthlyLimit: number) => {
    if (!currentMember || currentMember.role !== 'admin') return false;

    try {
      const { error } = await supabase
        .from('family_members')
        .update({
          daily_limit: dailyLimit,
          monthly_limit: monthlyLimit,
        })
        .eq('id', memberId);

      if (error) {
        console.error('Error updating member limits:', error);
        return false;
      }

      await loadWalletData();
      return true;
    } catch (error) {
      console.error('Error updating member limits:', error);
      return false;
    }
  };

  // Add family member
  const addFamilyMember = async (memberData: {
    name: string;
    email: string;
    daily_limit: number;
    monthly_limit: number;
  }) => {
    if (!currentMember || currentMember.role !== 'admin' || !wallet) return false;

    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: memberData.email,
        password: 'temporary123', // Should be changed on first login
        email_confirm: true,
        user_metadata: {
          name: memberData.name,
        },
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return false;
      }

      // Then create family member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          wallet_id: wallet.id,
          user_id: authData.user.id,
          name: memberData.name,
          email: memberData.email,
          role: 'member',
          daily_limit: memberData.daily_limit,
          monthly_limit: memberData.monthly_limit,
        });

      if (memberError) {
        console.error('Error creating family member:', memberError);
        return false;
      }

      await loadWalletData();
      return true;
    } catch (error) {
      console.error('Error adding family member:', error);
      return false;
    }
  };

  // Create Dana integration
  const createDanaIntegration = async (phoneNumber: string, accountName: string) => {
    if (!wallet) return false;

    try {
      const { data, error } = await supabase
        .from('dana_integrations')
        .insert({
          wallet_id: wallet.id,
          phone_number: phoneNumber,
          account_name: accountName,
          balance: Math.floor(Math.random() * 5000000) + 1000000, // Demo balance
          is_connected: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating Dana integration:', error);
        return false;
      }

      setDanaIntegration(data);
      return true;
    } catch (error) {
      console.error('Error creating Dana integration:', error);
      return false;
    }
  };

  // Update Dana integration
  const updateDanaIntegration = async (updates: Partial<DanaIntegration>) => {
    if (!danaIntegration) return false;

    try {
      const { data, error } = await supabase
        .from('dana_integrations')
        .update(updates)
        .eq('id', danaIntegration.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating Dana integration:', error);
        return false;
      }

      setDanaIntegration(data);
      return true;
    } catch (error) {
      console.error('Error updating Dana integration:', error);
      return false;
    }
  };

  // Create top up session
  const createTopUpSession = async (amount: number, paymentMethodId: string) => {
    if (!user || !currentMember || !wallet) return null;

    try {
      const barcodeData = btoa(JSON.stringify({
        type: 'topup',
        amount,
        wallet_id: wallet.id,
        member_id: currentMember.id,
        timestamp: Date.now(),
      }));

      const { data, error } = await supabase
        .from('top_up_sessions')
        .insert({
          wallet_id: wallet.id,
          member_id: currentMember.id,
          amount,
          payment_method_id: paymentMethodId,
          barcode_data: barcodeData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating top up session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating top up session:', error);
      return null;
    }
  };

  // Complete top up
  const completeTopUp = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('top_up_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error completing top up:', error);
        return false;
      }

      await loadWalletData();
      return true;
    } catch (error) {
      console.error('Error completing top up:', error);
      return false;
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    if (!wallet) return;

    const transactionsSubscription = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `wallet_id=eq.${wallet.id}`,
        },
        () => {
          loadWalletData();
        }
      )
      .subscribe();

    const walletSubscription = supabase
      .channel('wallet')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'family_wallets',
          filter: `id=eq.${wallet.id}`,
        },
        () => {
          loadWalletData();
        }
      )
      .subscribe();

    return () => {
      transactionsSubscription.unsubscribe();
      walletSubscription.unsubscribe();
    };
  }, [wallet]);

  return {
    wallet,
    members,
    transactions,
    danaIntegration,
    paymentMethods,
    currentMember,
    loading,
    createTransaction,
    updateMemberLimits,
    addFamilyMember,
    createDanaIntegration,
    updateDanaIntegration,
    createTopUpSession,
    completeTopUp,
    refreshData: loadWalletData,
  };
};