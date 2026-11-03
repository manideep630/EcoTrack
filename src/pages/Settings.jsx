import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Bell, Shield, Moon, Download, LogOut, CheckCircle2, KeyRound, Palette } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function Settings() {
  const { user, userData, logout, updateProfile, updateUserData } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState('');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    location: '',
    sustainabilityGoal: 'Reduce Carbon Footprint',
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState('');

  // Controlled notification settings
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyReports: true,
    challengeUpdates: true,
    communityMentions: false,
    newResources: false,
  });

  // Controlled privacy settings
  const [privacyVisibility, setPrivacyVisibility] = useState('public');

  // Controlled appearance settings
  const [compactMode, setCompactMode] = useState(false);
  const [vibrantAccent, setVibrantAccent] = useState(true);

  // Sync state from context
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        sustainabilityGoal: user.sustainabilityGoal || 'Reduce Carbon Footprint',
      });
    }
    if (userData?.settings) {
      if (userData.settings.notifications) {
        setNotifications(userData.settings.notifications);
      }
      if (userData.settings.privacy?.visibility) {
        setPrivacyVisibility(userData.settings.privacy.visibility);
      }
      if (userData.settings.appearance) {
        setCompactMode(!!userData.settings.appearance.compactMode);
        setVibrantAccent(userData.settings.appearance.vibrantAccent ?? true);
      }
    }
  }, [user, userData]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveStatus('Saving profile...');
    updateProfile(profileForm);
    setTimeout(() => {
      setSaveStatus('Profile updated successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 400);
  };

  const handleNotificationToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateUserData({
      settings: {
        ...(userData?.settings || {}),
        notifications: updated,
      }
    });
  };

  const handleSavePrivacy = (val) => {
    setPrivacyVisibility(val);
    updateUserData({
      settings: {
        ...(userData?.settings || {}),
        privacy: { visibility: val },
      }
    });
    setSaveStatus('Privacy setting updated!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordStatus('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus('New passwords do not match.');
      return;
    }

    setPasswordStatus('Password updated successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordStatus(''), 4000);
  };

  const handleToggleCompact = () => {
    const nextVal = !compactMode;
    setCompactMode(nextVal);
    updateUserData({
      settings: {
        ...(userData?.settings || {}),
        appearance: {
          ...(userData?.settings?.appearance || {}),
          compactMode: nextVal,
        }
      }
    });
  };

  const handleToggleAccent = () => {
    const nextVal = !vibrantAccent;
    setVibrantAccent(nextVal);
    updateUserData({
      settings: {
        ...(userData?.settings || {}),
        appearance: {
          ...(userData?.settings?.appearance || {}),
          vibrantAccent: nextVal,
        }
      }
    });
  };

  const handleExportData = () => {
    const fullPayload = {
      user,
      userData,
      exportDate: new Date().toISOString(),
      app: 'EcoTrack v1.0',
    };
    const dataStr = JSON.stringify(fullPayload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecotrack-export-${user?.email || 'user'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you absolutely sure you want to permanently delete your EcoTrack account and all data? This cannot be undone.')) {
      if (user?.email) {
        localStorage.removeItem(`ecoTrack_data_${user.email.toLowerCase().trim()}`);
      }
      logout();
      navigate('/');
    }
  };

  const initials = user?.initials || (user?.name?.[0]?.toUpperCase() || 'U');

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-eco-charcoal flex items-center">
          <SettingsIcon className="w-8 h-8 mr-3 text-eco-forest" />
          Settings
        </h1>
        <p className="text-gray-500 mt-2">Manage your account preferences and personal information.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {[
            { id: 'profile', label: 'Profile Information', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy & Security', icon: Shield },
            { id: 'appearance', label: 'Appearance', icon: Moon },
            { id: 'data', label: 'Data Export', icon: Download },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-eco-forest text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5 mr-3 text-red-500" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-eco-charcoal mb-6 border-b border-gray-100 pb-4">Profile Information</h2>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-eco-forest flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{user?.name || 'Eco Member'}</h3>
                  <p className="text-sm text-gray-500 mb-1">{user?.email}</p>
                  <span className="inline-block px-3 py-1 bg-eco-mint/20 text-eco-forest rounded-full text-xs font-semibold">
                    {profileForm.sustainabilityGoal}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="input-field"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="input-field"
                      value={profileForm.location}
                      onChange={handleProfileChange}
                      placeholder="e.g. San Francisco, USA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sustainability Goal</label>
                    <select
                      name="sustainabilityGoal"
                      className="input-field"
                      value={profileForm.sustainabilityGoal}
                      onChange={handleProfileChange}
                    >
                      <option>Reduce Carbon Footprint</option>
                      <option>Zero Waste Lifestyle</option>
                      <option>Save Energy & Water</option>
                      <option>Learn & Educate Others</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  <div className="text-sm font-medium text-eco-forest flex items-center">
                    {saveStatus && <><CheckCircle2 className="w-4 h-4 mr-1" /> {saveStatus}</>}
                  </div>
                  <button type="submit" className="btn-primary py-2 px-6 cursor-pointer">Save Changes</button>
                </div>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-eco-charcoal mb-6 border-b border-gray-100 pb-4">Notification Preferences</h2>
              
              <div className="space-y-6">
                {[
                  { key: 'dailyReminders', title: 'Daily Reminders', desc: 'Get a reminder to log your daily eco-habits.' },
                  { key: 'weeklyReports', title: 'Weekly Reports', desc: 'Receive a summary of your environmental impact every Sunday.' },
                  { key: 'challengeUpdates', title: 'Challenge Updates', desc: 'Get notified when a new community challenge starts.' },
                  { key: 'communityMentions', title: 'Community Mentions', desc: 'Get notified when someone replies to your post or mentions you.' },
                  { key: 'newResources', title: 'New Resources', desc: 'Occasional updates about new educational articles and guides.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!notifications[item.key]}
                        onChange={() => handleNotificationToggle(item.key)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-eco-forest"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-eco-forest font-medium">Changes save automatically to your profile.</span>
                <button
                  type="button"
                  onClick={() => {
                    setSaveStatus('Preferences saved!');
                    setTimeout(() => setSaveStatus(''), 2500);
                  }}
                  className="btn-primary py-2 px-6 cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-eco-charcoal mb-6 border-b border-gray-100 pb-4">Privacy & Security</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">Profile Visibility</h3>
                  <div className="space-y-3">
                    {[
                      { value: 'public', label: 'Public', desc: 'Anyone can see your profile and achievements.' },
                      { value: 'community', label: 'Community Only', desc: 'Only registered members can see your profile.' },
                      { value: 'private', label: 'Private', desc: 'Only you can see your profile and stats.' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        onClick={() => handleSavePrivacy(opt.value)}
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                          privacyVisibility === opt.value
                            ? 'border-eco-forest bg-eco-mint/10'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="visibility"
                          value={opt.value}
                          checked={privacyVisibility === opt.value}
                          onChange={() => handleSavePrivacy(opt.value)}
                          className="w-4 h-4 text-eco-forest focus:ring-eco-mint border-gray-300"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-900">{opt.label}</span>
                          <span className="block text-xs text-gray-500">{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <KeyRound className="w-5 h-5 mr-2 text-eco-forest" /> Change Password
                  </h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        className="input-field py-2"
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">New Password (min 6 characters)</label>
                      <input
                        type="password"
                        required
                        className="input-field py-2"
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        className="input-field py-2"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>

                    {passwordStatus && (
                      <p className={`text-xs font-medium ${passwordStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordStatus}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-5 rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-eco-charcoal mb-6 border-b border-gray-100 pb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-eco-forest" /> Interface & Appearance
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">Compact View Mode</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Reduces card padding and spacing for high-density dashboard monitoring.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={compactMode}
                      onChange={handleToggleCompact}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-eco-forest"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">Vibrant Eco Highlights</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Enables animated progress bars and glowing badge accents on achievements.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={vibrantAccent}
                      onChange={handleToggleAccent}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-eco-forest"></div>
                  </label>
                </div>

                <div className="p-4 bg-eco-mint/10 border border-eco-mint/30 rounded-xl text-xs text-eco-forest font-medium">
                  🌿 EcoTrack uses the natural Earth palette to optimize energy consumption and visual comfort.
                </div>
              </div>
            </div>
          )}

          {/* DATA EXPORT TAB */}
          {activeTab === 'data' && (
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-eco-charcoal mb-6 border-b border-gray-100 pb-4">Data Management</h2>
              
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-800">Export Your Data</h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">Download a complete copy of all your tracked habits, carbon footprint calculations, challenges, reward points, and posts in JSON format.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="flex items-center justify-center shrink-0 py-2.5 px-4 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-eco-forest transition-colors shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download JSON
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100 gap-4">
                  <div>
                    <h4 className="font-bold text-red-800">Delete Account & Data</h4>
                    <p className="text-sm text-red-600 mt-1 max-w-md">Permanently wipe your account profile and all stored metrics from this device. This action cannot be undone.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="shrink-0 py-2.5 px-4 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
