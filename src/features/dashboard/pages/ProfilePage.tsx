/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : ProfilePage.tsx
 * WHAT THIS FILE DOES : Renders profile and security configurations for authenticated admins
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility)
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { UserCog, Loader2 } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { SectionHeader } from '../components/shared';
import { capabilities } from '../constants/capabilities';
import type { ProfileFormState, PasswordFormState } from '../types';

export const ProfilePage: React.FC = () => {
  const { data, error, isLoading, refreshData } = useAdminData();
  const { user, refreshUser } = useAuth();
  const [actionBusy, setActionBusy] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: '',
    username: '',
    phone: '',
    avatar: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const profileUser = useMemo(() => {
    if (!data) return user;
    return (
      data.users.find(item => item.id === user?.id) ??
      data.users.find(item => item.role === 'ADMIN') ??
      user
    );
  }, [data, user]);

  useEffect(() => {
    if (!profileUser) return;

    setProfileForm({
      name: profileUser.name || '',
      username: profileUser.username || '',
      phone: profileUser.phone || '',
      avatar: profileUser.avatar || '',
    });
  }, [profileUser]);

  const runAdminAction = async (
    key: string,
    action: () => Promise<unknown>,
    success: string
  ) => {
    setActionBusy(key);
    setActionError('');
    setActionMessage('');

    try {
      await action();
      setActionMessage(success);
      await refreshData();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'Action failed'
      );
    } finally {
      setActionBusy('');
    }
  };

  const logAdminAction = (action: string, metadata: Record<string, unknown>) =>
    api.post('/api/v1/activity-logs', {
      action,
      metadata,
    });

  const updateProfile = () =>
    runAdminAction(
      'profile-save',
      async () => {
        if (!profileUser?.id) throw new Error('No current admin user found');

        const payload = {
          name: profileForm.name.trim(),
          username: profileForm.username.trim() || null,
          displayUsername: profileForm.username.trim() || null,
          phoneNumber: profileForm.phone.trim() || null,
          image: profileForm.avatar.trim() || null,
        };

        await api.put(`/api/v1/users/${profileUser.id}`, payload);
        await refreshUser();
      },
      'Profile updated successfully.'
    );

  const changePassword = () =>
    runAdminAction(
      'profile-password',
      async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          throw new Error('New password and confirm password must match');
        }

        if (passwordForm.newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters');
        }

        await api.post('/api/v1/auth/change-password', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });

        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        await refreshUser();
      },
      'Password changed successfully.'
    );

  if (error) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        {error}
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  }

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<UserCog size={20} />}
        title="Admin Profile & Access"
        subtitle="Manage your admin profile, 2FA readiness, password controls, and personal audit trail."
        capabilities={capabilities.profile}
      />
      {actionError && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      )}
      {actionMessage && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {actionMessage}
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          {profileForm.avatar ? (
            <img
              src={profileForm.avatar}
              alt={profileUser?.name || 'Admin user'}
              className="mb-4 h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-lg font-black text-white">
              {profileUser?.name?.charAt(0) || 'A'}
            </div>
          )}
          <h2 className="text-lg font-bold text-gray-900">
            {profileUser?.name || 'Admin user'}
          </h2>
          <p className="text-sm text-gray-500">
            {profileUser?.email || 'No email loaded'}
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-semibold">Role:</span>{' '}
              {profileUser?.role || 'ADMIN'}
            </p>
            <p>
              <span className="font-semibold">Email:</span> Managed by JWT auth
            </p>
            <p>
              <span className="font-semibold">Access:</span> Admin portal only
            </p>
          </div>
          <div className="mt-4">
            <button
              disabled={actionBusy === 'profile-2fa'}
              onClick={() =>
                runAdminAction(
                  'profile-2fa',
                  () =>
                    logAdminAction('totp_setup_requested', {
                      source: 'admin_web',
                    }),
                  '2FA setup request recorded.'
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold disabled:opacity-50 hover:bg-gray-50"
            >
              Record 2FA setup request
              {actionBusy === 'profile-2fa' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm xl:col-span-2">
          <h2 className="text-base font-bold text-gray-900">Profile details</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Full name
              <input
                value={profileForm.name}
                onChange={event =>
                  setProfileForm(current => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Username
              <input
                value={profileForm.username}
                onChange={event =>
                  setProfileForm(current => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Phone number
              <input
                value={profileForm.phone}
                onChange={event =>
                  setProfileForm(current => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Avatar URL
              <input
                value={profileForm.avatar}
                onChange={event =>
                  setProfileForm(current => ({
                    ...current,
                    avatar: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-700 md:col-span-2">
              Email address
              <input
                value={profileUser?.email || ''}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              disabled={actionBusy === 'profile-save'}
              onClick={updateProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Save profile
              {actionBusy === 'profile-save' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm xl:col-span-1">
          <h2 className="text-base font-bold text-gray-900">Password</h2>
          <div className="mt-4 space-y-3">
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Current password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={event =>
                  setPasswordForm(current => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              New password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={event =>
                  setPasswordForm(current => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Confirm password
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={event =>
                  setPasswordForm(current => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </label>
            <button
              disabled={actionBusy === 'profile-password'}
              onClick={changePassword}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Change password
              {actionBusy === 'profile-password' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
