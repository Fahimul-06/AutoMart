import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Save, Loader2, CheckCircle, AlertCircle, Upload, User as UserIcon, Phone, Lock } from 'lucide-react';
import { supabase, type Profile } from '../lib/supabase';
import type { Page } from '../types';

type Props = {
  user: { id: string; email: string };
  profile: Profile | null;
  setPage: (p: Page) => void;
  onProfileUpdate: () => void;
};

export default function ProfilePage({ user, profile, setPage, onProfileUpdate }: Props) {
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File size must be less than 5MB'); return; }
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return; }

    setAvatarLoading(true);
    setError('');

    try {
      const fileName = `${user.id}-${Date.now()}`;

      // Try to upload to storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        setAvatarUrl(urlData?.publicUrl ?? '');
      } else {
        // Fallback: Convert to base64 and store as data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setAvatarUrl(base64);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      setError('Failed to upload image. Using local preview instead.');
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setAvatarUrl(base64);
      };
      reader.readAsDataURL(file);
    }

    setAvatarLoading(false);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
    if (!phone || phone.length < 10) { setError('Enter a valid phone number'); setLoading(false); return; }

    const { error } = await supabase.from('profiles').update({
      name,
      phone,
      avatar_url: avatarUrl,
    }).eq('id', user.id);

    if (error) {
      setError('Failed to update profile');
    } else {
      setSuccess('Profile updated successfully!');
      onProfileUpdate();
      setTimeout(() => setSuccess(''), 3000);
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      setLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      setError('Current password is incorrect');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError('Failed to update password. Please try again.');
    } else {
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    }
    setLoading(false);
  };

  const getInitials = () => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => setPage({ name: 'home' })} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-slate-400 text-sm">Manage your account and settings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center sticky top-24">
              <div className="mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-32 h-32 rounded-2xl mx-auto object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-2xl mx-auto bg-red-500 flex items-center justify-center text-white text-4xl font-bold">
                    {getInitials()}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="font-bold text-gray-900 text-lg mb-0.5">{name || 'User'}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.currentTarget.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                  disabled={avatarLoading}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer justify-center">
                  {avatarLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {avatarLoading ? 'Uploading...' : 'Upload Photo'}
                </span>
              </label>

              <p className="text-xs text-gray-400 mt-2">Max 5MB, JPG/PNG</p>

              <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                <p>Account ID: {user.id.slice(0, 8)}...</p>
                <p>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-BD') : 'Recently'}</p>
              </div>
            </div>
          </div>

          {/* Forms section */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Profile Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-red-500" />
                Profile Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 cursor-not-allowed text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    />
                  </div>
                  {profile?.phone_verified && (
                    <p className="text-xs text-green-600 mt-1">Phone verified</p>
                  )}
                </div>

                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                Change Password
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="w-full bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
