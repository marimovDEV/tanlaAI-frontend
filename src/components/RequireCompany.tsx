import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegram } from '../contexts/useTelegram';

/**
 * Route guard: faqat kompaniyasi bor foydalanuvchilarni o'tkazadi.
 *
 * - Auth hali yuklanmagan bo'lsa (ready=false) → spinner ko'rsatadi
 * - ready=true, lekin has_company=false → / ga yo'naltiradi
 * - ready=true, has_company=true → sahifani ko'rsatadi
 */
const RequireCompany: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, ready } = useTelegram();

  // Auth hali yuklanmoqda — bo'sh ekran ko'rsatamiz (flash oldini olish uchun)
  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#FFFBF6' }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '3px solid #e8e0d8',
            borderTopColor: '#0067a5',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Auth tayyor, lekin kompaniya yo'q → bosh sahifaga qaytaramiz
  if (!profile?.has_company) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireCompany;
