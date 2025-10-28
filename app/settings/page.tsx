'use client';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import { Globe, Bell, Shield, User, LogOut, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    newIntakes: true,
    eligibilityAlerts: true
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, save to database/API
    console.log('Saving settings:', { language, notifications });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your preferences and account settings
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {/* Language Settings */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-600" />
              Language / Idioma
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose your preferred language for the interface
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setLanguage('en')}
                className={`p-6 border-2 rounded-lg transition ${
                  language === 'en'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-5xl mb-3">🇺🇸</div>
                <p className="font-semibold text-gray-900">English</p>
                <p className="text-sm text-gray-500 mt-1">United States</p>
              </button>
              
              <button
                onClick={() => setLanguage('es')}
                className={`p-6 border-2 rounded-lg transition ${
                  language === 'es'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-5xl mb-3">🇲🇽</div>
                <p className="font-semibold text-gray-900">Español</p>
                <p className="text-sm text-gray-500 mt-1">México / Latino</p>
              </button>
            </div>
            {language === 'es' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🚧 <strong>Próximamente:</strong> La traducción al español estará disponible en una próxima actualización.
                </p>
              </div>
            )}
          </div>
          
          {/* Notification Settings */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-purple-600" />
              Notifications
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage how you receive notifications
            </p>
            <div className="space-y-4">
              <ToggleSetting
                label="Email Notifications"
                description="Receive updates via email"
                checked={notifications.email}
                onChange={(checked) => setNotifications({...notifications, email: checked})}
              />
              <ToggleSetting
                label="SMS Notifications"
                description="Receive text message alerts"
                checked={notifications.sms}
                onChange={(checked) => setNotifications({...notifications, sms: checked})}
              />
              <ToggleSetting
                label="New Intake Alerts"
                description="Get notified when new patient intakes are submitted"
                checked={notifications.newIntakes}
                onChange={(checked) => setNotifications({...notifications, newIntakes: checked})}
              />
              <ToggleSetting
                label="Eligibility Check Alerts"
                description="Notifications for insurance verification results"
                checked={notifications.eligibilityAlerts}
                onChange={(checked) => setNotifications({...notifications, eligibilityAlerts: checked})}
              />
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Privacy & Security
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your account password</p>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <p className="font-medium text-gray-900">Privacy Policy</p>
                <p className="text-sm text-gray-500">View our privacy and data handling policy</p>
              </button>
            </div>
          </div>

          {/* Account */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-600" />
              Account
            </h3>
            <div className="space-y-3">
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="font-medium text-gray-900">Doctor/Provider</p>
              </div>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">doctor@orthopro.com</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-red-600 hover:text-red-700 font-medium py-3 border-2 border-red-200 hover:border-red-300 rounded-lg transition flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-green-600 flex items-center justify-center"
          >
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Settings Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>OrthoPro v1.0.0 • Worker Injury Management System</p>
          <p className="mt-1">© 2025 AdvancedCare. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
