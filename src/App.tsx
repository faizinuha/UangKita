import React, { useState } from 'react';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { SupabaseLogin } from './components/SupabaseLogin';
import { SupabaseDashboard } from './components/SupabaseDashboard';
import { PaymentForm } from './components/PaymentForm';
import { TransactionHistory } from './components/TransactionHistory';
import { FamilyMembers } from './components/FamilyMembers';
import { Settings } from './components/Settings';
import { TopUpForm } from './components/TopUpForm';
import { BottomNav } from './components/BottomNav';

function App() {
  const { user, loading } = useSupabaseAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Supabase...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SupabaseLogin />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <SupabaseDashboard onNavigate={setCurrentPage} />;
      case 'payment':
        return <PaymentForm onBack={() => setCurrentPage('dashboard')} mode="payment" />;
      case 'transfer':
        return <PaymentForm onBack={() => setCurrentPage('dashboard')} mode="transfer" />;
      case 'transactions':
        return <TransactionHistory onBack={() => setCurrentPage('dashboard')} />;
      case 'members':
        return <FamilyMembers onBack={() => setCurrentPage('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentPage('dashboard')} />;
      case 'topup':
        return <TopUpForm onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pb-20 md:pb-0">
        {renderPage()}
      </div>
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;