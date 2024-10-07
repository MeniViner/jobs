import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Bell, User, Lock, CreditCard, Settings, FileText } from 'lucide-react';
import '../../styles/accountPage.css';

// Assuming you're using a translation library like react-i18next
import { useTranslation } from 'react-i18next';

const AccountPage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('Personal information');
  const navigate = useNavigate();
  const auth = getAuth();

  const menuItems = [
    { id: 'Personal information', label: t('Personal information'), icon: User },
    { id: 'Login & security', label: t('Login & security'), icon: Lock },
    { id: 'Payments and payouts', label: t('Payments and payouts'), icon: CreditCard },
    { id: 'Accessibility', label: t('Accessibility'), icon: Settings },
    { id: 'Taxes', label: t('Taxes'), icon: FileText },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            setUser({ id: authUser.uid, ...userDoc.data(), photoURL: authUser.photoURL });
          } else {
            console.error('No user document found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpgradeToEmployer = () => {
    navigate('/employer-registration');
  };

  const handleUpdateUserInfo = async (updatedInfo) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), updatedInfo);
      setUser({ ...user, ...updatedInfo });
    } catch (error) {
      console.error('Error updating user info:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const PersonalInformation = ({ loading, setLoading }) => (
    <div className="section-content">
      <h2>{t('Personal Information')}</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedInfo = Object.fromEntries(formData);
        handleUpdateUserInfo(updatedInfo);
      }}>
        <div className="form-group">
          <label htmlFor="name">{t('Name')}</label>
          <input type="text" id="name" name="name" defaultValue={user.name} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">{t('Email')}</label>
          <input type="email" id="email" name="email" defaultValue={user.email} required />
        </div>
        <div className="form-group">
          <label htmlFor="phone">{t('Phone')}</label>
          <input type="tel" id="phone" name="phone" defaultValue={user.phone} />
        </div>
        <button type="submit" disabled={loading}>{t('Save Changes')}</button>
      </form>
    </div>
  );

  const LoginSecurity = () => (
    <div className="section-content">
      <h2>{t('Login & Security')}</h2>
      <p>{t('Change your password or set up two-factor authentication.')}</p>
      {/* Add more security settings here */}
    </div>
  );

  const PaymentsPayouts = () => (
    <div className="section-content">
      <h2>{t('Payments and Payouts')}</h2>
      <p>{t('Manage your payment methods and payout preferences.')}</p>
      {/* Add payment and payout options here */}
    </div>
  );

  const AccessibilitySettings = () => (
    <div className="section-content">
      <h2>{t('Accessibility')}</h2>
      <p>{t('Adjust accessibility settings for a better experience.')}</p>
      {/* Add accessibility settings here */}
    </div>
  );

  const TaxInformation = () => (
    <div className="section-content">
      <h2>{t('Taxes')}</h2>
      <p>{t('Manage your tax information and documents.')}</p>
      {/* Add tax information management here */}
    </div>
  );

  return (
    <div className="account-page">
      <div className="header">
        <h1>{t('Profile')}</h1>
        <Bell className="notification-icon" />
      </div>

      <div className="user-profile">
        <img src={user.photoURL} alt={user.name} className="user-picture" />
        <div className="user-info">
          <h2>{user.name}</h2>
          <p>{t('Show profile')}</p>
        </div>
        <div className="chevron-right">›</div>
      </div>

      {user.role !== 'employer' && user.role !== 'pending_employer' && (
        <div className="upgrade-section">
          <h3>{t('Upgrade to Employer')}</h3>
          <p>{t('Post jobs and find the best candidates for your company.')}</p>
          <button onClick={handleUpgradeToEmployer} className="upgrade-button">
            {t('Upgrade Now')}
          </button>
        </div>
      )}

      {user.role === 'pending_employer' && (
        <div className="pending-approval">
          <p>{t('Your employer registration is pending approval.')}</p>
        </div>
      )}

      <div className="settings-section">
        <h3>{t('Settings')}</h3>
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.id} 
              onClick={() => setActiveSection(item.id)}
              className={activeSection === item.id ? 'active' : ''}
            >
              <item.icon className="settings-icon" />
              <span>{item.label}</span>
              <span className="chevron-right">›</span>
            </li>
          ))}
        </ul>
      </div>

      {activeSection === 'Personal information' && <PersonalInformation loading={loading} setLoading={setLoading} />}
      {activeSection === 'Login & security' && <LoginSecurity />}
      {activeSection === 'Payments and payouts' && <PaymentsPayouts />}
      {activeSection === 'Accessibility' && <AccessibilitySettings />}
      {activeSection === 'Taxes' && <TaxInformation />}

      <button onClick={handleSignOut} className="sign-out-button">{t('Sign Out')}</button>

    </div>
  );
};

export default AccountPage;