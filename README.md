# UangKita - Family Wallet Application

![UangKita Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=UangKita)

**UangKita** adalah aplikasi dompet digital keluarga yang memungkinkan pengelolaan keuangan keluarga secara terpusat dengan fitur pembayaran QR, transfer antar anggota, dan integrasi dengan Dana.

## 🚀 Fitur Utama

### 💰 **Manajemen Saldo Keluarga**
- Saldo terpusat untuk seluruh anggota keluarga
- Integrasi dengan akun Dana
- Real-time balance tracking
- Privacy control dengan hide/show balance

### 📱 **Scan & Bayar**
- QR Code scanner menggunakan kamera native
- Auto-fill data merchant setelah scan
- Kategori pembayaran otomatis
- Simulasi pembayaran untuk development

### 👥 **Transfer Antar Anggota**
- Transfer internal antar anggota keluarga
- Real-time balance update
- History transfer lengkap
- Limit control per anggota

### 🏦 **Integrasi Dana**
- Koneksi dengan akun Dana
- Sinkronisasi saldo real-time
- History transaksi Dana
- Manual sync balance

### 👨‍👩‍👧‍👦 **Manajemen Anggota Keluarga**
- Role-based access (Admin/Member)
- Daily & monthly spending limits
- Individual spending tracking
- Member management untuk admin

### 📊 **Riwayat Transaksi**
- Filter berdasarkan kategori dan jenis
- Export data transaksi
- Search functionality
- Detailed transaction history

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Mobile**: Capacitor (untuk native features)
- **Storage**: LocalStorage (development) / Supabase (production)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Git

### Setup Development

```bash
# Clone repository
git clone https://github.com/yourusername/uangkita.git
cd uangkita

# Install dependencies
npm install

# Start development server
npm run dev
```

### Setup untuk Mobile (Capacitor)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# Install plugins yang dibutuhkan
npm install @capacitor/camera
npm install @capacitor/local-notifications
npm install @capacitor/haptics
npm install @capacitor/network
npm install @capacitor/preferences

# Initialize Capacitor
npx cap init UangKita com.uangkita.app

# Add platforms
npx cap add android
npx cap add ios

# Build dan sync
npm run build
npx cap sync

# Run di device
npx cap run android
npx cap run ios
```

## 🔧 Configuration

### Environment Variables
Buat file `.env` di root project:

```env
# Supabase Configuration (untuk production)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Dana API Configuration (untuk production)
VITE_DANA_API_URL=your_dana_api_url
VITE_DANA_API_KEY=your_dana_api_key
```

### Capacitor Configuration
Edit `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.uangkita.app',
  appName: 'UangKita',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
    }
  }
};

export default config;
```

## 🎯 Cara Penggunaan

### 1. **Login**
- Gunakan akun demo yang tersedia
- Admin: `admin@uangkita.com` / password: `password`
- Member: `ibu@uangkita.com` / password: `password`

### 2. **Hubungkan Dana**
- Klik "Hubungkan" pada card Integrasi Dana
- Masukkan nomor Dana (format: 08xxxxxxxxxx)
- Sistem akan simulasi koneksi untuk development

### 3. **Scan & Bayar**
- Klik "Scan & Bayar" di dashboard
- Izinkan akses kamera
- Scan QR code atau gunakan "Simulasi Scan QR"
- Konfirmasi pembayaran

### 4. **Transfer Keluarga**
- Klik "Transfer Keluarga"
- Pilih anggota tujuan
- Masukkan jumlah dan catatan
- Konfirmasi transfer

### 5. **Kelola Anggota** (Admin only)
- Buka menu "Anggota"
- Tambah anggota baru
- Set limit harian/bulanan
- Monitor spending per anggota

## 📱 Mobile Features (Capacitor)

### Camera Integration
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
};
```

### Local Notifications
```typescript
import { LocalNotifications } from '@capacitor/local-notifications';

const scheduleNotification = async () => {
  await LocalNotifications.schedule({
    notifications: [
      {
        title: "UangKita",
        body: "Transaksi berhasil!",
        id: 1,
        schedule: { at: new Date(Date.now() + 1000 * 5) }
      }
    ]
  });
};
```

## 🔒 Security Features

- **Role-based Access Control**: Admin vs Member permissions
- **Spending Limits**: Daily dan monthly limits per user
- **Transaction Validation**: Balance checking sebelum transaksi
- **Secure Storage**: Encrypted local storage untuk data sensitif
- **Biometric Auth**: Fingerprint/Face ID (coming soon)

## 🧪 Testing

### Demo Accounts
```
Admin Account:
- Email: admin@uangkita.com
- Password: password
- Role: Admin (full access)

Member Account:
- Email: ibu@uangkita.com  
- Password: password
- Role: Member (limited access)
```

### Test Data
- Initial balance: Rp 5.000.000
- Sample transactions included
- Demo Dana integration

## 📚 API Documentation

### Local Storage Structure
```typescript
// Family Wallet
{
  id: string,
  name: string,
  balance: number,
  currency: "IDR",
  members: FamilyMember[],
  transactions: Transaction[],
  danaIntegration?: DanaAccount
}

// Family Member
{
  id: string,
  name: string,
  email: string,
  role: "admin" | "member",
  dailyLimit: number,
  monthlyLimit: number,
  currentDailySpent: number,
  currentMonthlySpent: number
}
```

## 🚀 Deployment

### Web Deployment
```bash
# Build untuk production
npm run build

# Deploy ke Netlify/Vercel
npm run deploy
```

### Mobile Deployment
```bash
# Build web assets
npm run build

# Sync dengan Capacitor
npx cap sync

# Build Android APK
npx cap build android

# Build iOS App
npx cap build ios
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- **Developer**: Your Name
- **Email**: your.email@example.com
- **Project Link**: [https://github.com/yourusername/uangkita](https://github.com/yourusername/uangkita)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Capacitor](https://capacitorjs.com/)
- [Vite](https://vitejs.dev/)

---

**UangKita** - Kelola keuangan keluarga dengan mudah dan aman! 💰👨‍👩‍👧‍👦