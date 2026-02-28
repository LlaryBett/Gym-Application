import React, { useState, useEffect } from 'react';
import {
  FaSave, FaCog, FaPalette, FaBell, FaEnvelope,
  FaSms, FaGlobe, FaLock, FaShieldAlt, FaDatabase,
  FaCreditCard, FaMoneyBill, FaPercent, FaUsers,
  FaDumbbell, FaClock, FaCalendarAlt, FaTrash,
  FaPlus, FaEdit, FaKey, FaUserCog, FaServer,
  FaCloud, FaChartLine, FaSlidersH, FaToggleOn,
  FaToggleOff, FaCheck, FaTimes
} from 'react-icons/fa';
import { adminAPI } from '../../services/adminAPI';
import toast from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      gymName: 'PowerGym',
      gymEmail: 'info@powergym.com',
      gymPhone: '+254 712 345 678',
      gymAddress: '123 Fitness Street, Workout City',
      timezone: 'Africa/Nairobi',
      currency: 'KES',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    appearance: {
      primaryColor: '#f97316',
      secondaryColor: '#000000',
      logo: '/logo.png',
      favicon: '/favicon.ico',
      theme: 'light',
      accentColor: '#facc15',
      fontFamily: 'Inter'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      bookingReminders: true,
      membershipExpiry: true,
      paymentReceipts: true,
      promotionalEmails: false,
      adminAlerts: true
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: true,
      smtpUser: 'noreply@powergym.com',
      smtpPassword: '********',
      fromEmail: 'noreply@powergym.com',
      fromName: 'PowerGym',
      replyTo: 'support@powergym.com'
    },
    payment: {
      provider: 'paystack',
      paystackPublicKey: 'pk_test_...',
      paystackSecretKey: 'sk_test_...',
      currency: 'KES',
      taxRate: 16,
      depositRequired: false,
      depositPercentage: 50,
      autoRenew: true,
      gracePeriod: 3
    },
    membership: {
      trialDays: 7,
      maxMembers: 1000,
      allowCancellation: true,
      cancellationNotice: 30,
      freezeAllowed: true,
      maxFreezeDays: 60,
      autoApprove: false,
      requirePayment: true
    },
    bookings: {
      maxAdvanceDays: 30,
      minNoticeHours: 2,
      maxPerDay: 3,
      allowCancellation: true,
      cancellationHours: 24,
      allowRescheduling: true,
      rescheduleFee: 0,
      noShowFee: 500
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      ipWhitelist: [],
      allowedDomains: ['powergym.com'],
      requireStrongPassword: true
    },
    integrations: {
      googleAnalytics: '',
      facebookPixel: '',
      zapier: false,
      slack: '',
      discord: '',
      mailchimp: ''
    },
    system: {
      maintenance: false,
      maintenanceMessage: '',
      debug: false,
      logLevel: 'error',
      cacheEnabled: true,
      cacheDuration: 3600,
      backupFrequency: 'daily',
      backupTime: '02:00'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminAPI.updateSettings(settings);
      
      if (response.success) {
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  const handleToggle = (section, field) => {
    handleChange(section, field, !settings[section][field]);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'email', label: 'Email', icon: FaEnvelope },
    { id: 'payment', label: 'Payment', icon: FaCreditCard },
    { id: 'membership', label: 'Membership', icon: FaUsers },
    { id: 'bookings', label: 'Bookings', icon: FaClock },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'integrations', label: 'Integrations', icon: FaGlobe },
    { id: 'system', label: 'System', icon: FaServer }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your gym management system</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
        >
          <FaSave />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex flex-nowrap gap-2 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">General Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gym Name</label>
                <input
                  type="text"
                  value={settings.general.gymName}
                  onChange={(e) => handleChange('general', 'gymName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gym Email</label>
                <input
                  type="email"
                  value={settings.general.gymEmail}
                  onChange={(e) => handleChange('general', 'gymEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gym Phone</label>
                <input
                  type="tel"
                  value={settings.general.gymPhone}
                  onChange={(e) => handleChange('general', 'gymPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gym Address</label>
                <input
                  type="text"
                  value={settings.general.gymAddress}
                  onChange={(e) => handleChange('general', 'gymAddress', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Africa/Nairobi">Nairobi (EAT)</option>
                  <option value="Africa/Lagos">Lagos (WAT)</option>
                  <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.general.currency}
                  onChange={(e) => handleChange('general', 'currency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="UGX">UGX - Ugandan Shilling</option>
                  <option value="TZS">TZS - Tanzanian Shilling</option>
                  <option value="RWF">RWF - Rwandan Franc</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Appearance Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.appearance.secondaryColor}
                    onChange={(e) => handleChange('appearance', 'secondaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.appearance.secondaryColor}
                    onChange={(e) => handleChange('appearance', 'secondaryColor', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.appearance.accentColor}
                    onChange={(e) => handleChange('appearance', 'accentColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.appearance.accentColor}
                    onChange={(e) => handleChange('appearance', 'accentColor', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => handleChange('appearance', 'theme', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={settings.appearance.logo}
                  onChange={(e) => handleChange('appearance', 'logo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
                <input
                  type="url"
                  value={settings.appearance.favicon}
                  onChange={(e) => handleChange('appearance', 'favicon', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Notification Settings</h2>
            
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send notifications via email' },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send notifications via SMS' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Send browser push notifications' },
                { key: 'bookingReminders', label: 'Booking Reminders', desc: 'Send reminders before bookings' },
                { key: 'membershipExpiry', label: 'Membership Expiry Alerts', desc: 'Alert members before membership expires' },
                { key: 'paymentReceipts', label: 'Payment Receipts', desc: 'Send receipts after payments' },
                { key: 'promotionalEmails', label: 'Promotional Emails', desc: 'Send marketing and promotional emails' },
                { key: 'adminAlerts', label: 'Admin Alerts', desc: 'Send alerts to administrators' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle('notifications', item.key)}
                    className="text-2xl text-gray-400 hover:text-orange-500 transition"
                  >
                    {settings.notifications[item.key] ? <FaToggleOn className="text-orange-500" /> : <FaToggleOff />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Email Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => handleChange('email', 'smtpHost', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => handleChange('email', 'smtpPort', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => handleChange('email', 'smtpUser', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                <input
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => handleChange('email', 'smtpPassword', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => handleChange('email', 'fromEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) => handleChange('email', 'fromName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.email.smtpSecure}
                onChange={(e) => handleChange('email', 'smtpSecure', e.target.checked)}
                className="text-orange-500 focus:ring-orange-500 rounded"
              />
              <span className="text-sm text-gray-700">Use secure connection (SSL/TLS)</span>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Payment Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Provider</label>
                <select
                  value={settings.payment.provider}
                  onChange={(e) => handleChange('payment', 'provider', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="paystack">Paystack</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="stripe">Stripe</option>
                  <option value="flutterwave">Flutterwave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Public Key</label>
                <input
                  type="text"
                  value={settings.payment.paystackPublicKey}
                  onChange={(e) => handleChange('payment', 'paystackPublicKey', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                <input
                  type="password"
                  value={settings.payment.paystackSecretKey}
                  onChange={(e) => handleChange('payment', 'paystackSecretKey', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.payment.taxRate}
                  onChange={(e) => handleChange('payment', 'taxRate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Percentage</label>
                <input
                  type="number"
                  value={settings.payment.depositPercentage}
                  onChange={(e) => handleChange('payment', 'depositPercentage', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grace Period (days)</label>
                <input
                  type="number"
                  value={settings.payment.gracePeriod}
                  onChange={(e) => handleChange('payment', 'gracePeriod', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.payment.depositRequired}
                  onChange={(e) => handleChange('payment', 'depositRequired', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Require deposit for bookings</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.payment.autoRenew}
                  onChange={(e) => handleChange('payment', 'autoRenew', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Enable auto-renew for memberships</span>
              </label>
            </div>
          </div>
        )}

        {/* Membership Settings */}
        {activeTab === 'membership' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Membership Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trial Days</label>
                <input
                  type="number"
                  value={settings.membership.trialDays}
                  onChange={(e) => handleChange('membership', 'trialDays', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Members</label>
                <input
                  type="number"
                  value={settings.membership.maxMembers}
                  onChange={(e) => handleChange('membership', 'maxMembers', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Notice (days)</label>
                <input
                  type="number"
                  value={settings.membership.cancellationNotice}
                  onChange={(e) => handleChange('membership', 'cancellationNotice', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Freeze Days</label>
                <input
                  type="number"
                  value={settings.membership.maxFreezeDays}
                  onChange={(e) => handleChange('membership', 'maxFreezeDays', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.membership.allowCancellation}
                  onChange={(e) => handleChange('membership', 'allowCancellation', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Allow members to cancel</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.membership.freezeAllowed}
                  onChange={(e) => handleChange('membership', 'freezeAllowed', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Allow members to freeze</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.membership.autoApprove}
                  onChange={(e) => handleChange('membership', 'autoApprove', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Auto-approve new members</span>
              </label>
            </div>
          </div>
        )}

        {/* Bookings Settings */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Booking Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Advance Days</label>
                <input
                  type="number"
                  value={settings.bookings.maxAdvanceDays}
                  onChange={(e) => handleChange('bookings', 'maxAdvanceDays', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Notice (hours)</label>
                <input
                  type="number"
                  value={settings.bookings.minNoticeHours}
                  onChange={(e) => handleChange('bookings', 'minNoticeHours', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Bookings/Day</label>
                <input
                  type="number"
                  value={settings.bookings.maxPerDay}
                  onChange={(e) => handleChange('bookings', 'maxPerDay', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Hours</label>
                <input
                  type="number"
                  value={settings.bookings.cancellationHours}
                  onChange={(e) => handleChange('bookings', 'cancellationHours', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reschedule Fee (KSH)</label>
                <input
                  type="number"
                  value={settings.bookings.rescheduleFee}
                  onChange={(e) => handleChange('bookings', 'rescheduleFee', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No-Show Fee (KSH)</label>
                <input
                  type="number"
                  value={settings.bookings.noShowFee}
                  onChange={(e) => handleChange('bookings', 'noShowFee', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.bookings.allowCancellation}
                  onChange={(e) => handleChange('bookings', 'allowCancellation', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Allow booking cancellation</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.bookings.allowRescheduling}
                  onChange={(e) => handleChange('bookings', 'allowRescheduling', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Allow booking rescheduling</span>
              </label>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Security Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleChange('security', 'sessionTimeout', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                <input
                  type="number"
                  value={settings.security.passwordExpiry}
                  onChange={(e) => handleChange('security', 'passwordExpiry', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleChange('security', 'maxLoginAttempts', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lockout Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.security.lockoutDuration}
                  onChange={(e) => handleChange('security', 'lockoutDuration', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Domains (comma separated)</label>
              <input
                type="text"
                value={settings.security.allowedDomains.join(', ')}
                onChange={(e) => handleChange('security', 'allowedDomains', e.target.value.split(',').map(d => d.trim()))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="gym.com, powergym.com"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => handleChange('security', 'twoFactorAuth', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Enable two-factor authentication</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.security.requireStrongPassword}
                  onChange={(e) => handleChange('security', 'requireStrongPassword', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Require strong passwords</span>
              </label>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                <select
                  value={settings.system.logLevel}
                  onChange={(e) => handleChange('system', 'logLevel', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cache Duration (seconds)</label>
                <input
                  type="number"
                  value={settings.system.cacheDuration}
                  onChange={(e) => handleChange('system', 'cacheDuration', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                <select
                  value={settings.system.backupFrequency}
                  onChange={(e) => handleChange('system', 'backupFrequency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Time</label>
                <input
                  type="time"
                  value={settings.system.backupTime}
                  onChange={(e) => handleChange('system', 'backupTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
              <textarea
                value={settings.system.maintenanceMessage}
                onChange={(e) => handleChange('system', 'maintenanceMessage', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Message to display during maintenance..."
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.system.maintenance}
                  onChange={(e) => handleChange('system', 'maintenance', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Maintenance Mode</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.system.cacheEnabled}
                  onChange={(e) => handleChange('system', 'cacheEnabled', e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Enable caching</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;