export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'payment':
      return '💳';
    case 'transfer':
      return '💸';
    case 'topup':
      return '💰';
    case 'expense':
      return '🛒';
    default:
      return '💳';
  }
};

export const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'Makanan': 'bg-orange-100 text-orange-800',
    'Transportasi': 'bg-blue-100 text-blue-800',
    'Belanja': 'bg-purple-100 text-purple-800',
    'Kesehatan': 'bg-green-100 text-green-800',
    'Hiburan': 'bg-pink-100 text-pink-800',
    'Pendidikan': 'bg-indigo-100 text-indigo-800',
    'Lainnya': 'bg-gray-100 text-gray-800'
  };
  return colors[category] || colors['Lainnya'];
};