"use client";

import React from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Bell,
  Shield,
  Globe,
  Moon,
  CreditCard,
  Package,
  Truck,
  ChevronRight,
  Settings,
  Loader2,
  LogOut,
  Heart,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Section component ─────────────────────────────────────────────────────────
const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
    {children}
  </div>
);

// ─── Row item component ─────────────────────────────────────────────────────────
const SettingsRow = ({
  icon: Icon,
  label,
  value,
  href,
  accentColor = "text-blue-600",
  bgColor = "bg-blue-50",
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  href?: string;
  accentColor?: string;
  bgColor?: string;
}) => {
  const content = (
    <div className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-surface px-4 py-3.5 transition-all duration-200 hover:border-gray-200 hover:shadow-xs">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgColor} ${accentColor}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
          {value || "Not set"}
        </p>
      </div>
      {href && (
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

// ─── Toggle component ───────────────────────────────────────────────────────────
const SettingsToggle = ({
  icon: Icon,
  label,
  description,
  enabled,
  accentColor = "text-blue-600",
  bgColor = "bg-blue-50",
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  accentColor?: string;
  bgColor?: string;
}) => (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-surface px-4 py-3.5">
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgColor} ${accentColor}`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="mt-0.5 text-xs text-gray-500">{description}</p>
    </div>
    {/* Visual toggle (non-functional placeholder) */}
    <div
      className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${
        enabled ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <div
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  </div>
);

// ─── Quick Link card ────────────────────────────────────────────────────────────
const QuickLink = ({
  icon: Icon,
  label,
  description,
  href,
  accentColor = "text-blue-600",
  bgColor = "bg-blue-50",
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  accentColor?: string;
  bgColor?: string;
}) => (
  <Link
    href={href}
    className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
  >
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgColor} ${accentColor}`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="mt-0.5 text-xs text-gray-500">{description}</p>
    </div>
    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />
  </Link>
);

// ─── Main Page ──────────────────────────────────────────────────────────────────
const AccountSettingsPage = (): React.ReactNode => {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">
            Account Settings
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your account settings.
          </p>
        </div>

        <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white px-6 text-center shadow-sm">
          <Settings className="h-10 w-10 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Sign in required
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            You need to sign in to access your account settings.
          </p>
          <Link
            href="/sign-in"
            className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
  const email = user.primaryEmailAddress?.emailAddress || "No email";
  const phone = user.primaryPhoneNumber?.phoneNumber || "Not set";
  const imageUrl = user.imageUrl;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 mb-3">
          <Settings className="h-3.5 w-3.5" />
          <span>Account Management</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-xl">
          Manage your profile, preferences, and account security in one place.
        </p>
      </div>

      {/* ── PROFILE CARD ─────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gray-100 shadow-sm">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={fullName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
                  <User className="h-7 w-7" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
              <p className="text-sm text-gray-500">{email}</p>
              <p className="mt-1 text-xs text-gray-400">
                Member since{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => user.update({})}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50"
            >
              Edit Profile
            </button>
            <button
              onClick={() => signOut()}
              className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow-xs transition hover:bg-red-100"
            >
              <LogOut className="mr-1 inline-block h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Personal Information */}
          <SettingsSection
            title="Personal Information"
            description="Your basic profile details."
          >
            <div className="space-y-3">
              <SettingsRow
                icon={User}
                label="Full Name"
                value={fullName}
                accentColor="text-indigo-600"
                bgColor="bg-indigo-50"
              />
              <SettingsRow
                icon={Mail}
                label="Email Address"
                value={email}
                accentColor="text-sky-600"
                bgColor="bg-sky-50"
              />
              <SettingsRow
                icon={Phone}
                label="Phone Number"
                value={phone}
                accentColor="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <SettingsRow
                icon={MapPin}
                label="Default Address"
                value="Not set"
                accentColor="text-amber-600"
                bgColor="bg-amber-50"
              />
            </div>
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            title="Security"
            description="Keep your account secure."
          >
            <div className="space-y-3">
              <SettingsRow
                icon={Shield}
                label="Password"
                value="••••••••"
                accentColor="text-rose-600"
                bgColor="bg-rose-50"
              />
              <SettingsRow
                icon={Shield}
                label="Two-Factor Authentication"
                value={
                  user.twoFactorEnabled ? "Enabled" : "Not enabled"
                }
                accentColor="text-orange-600"
                bgColor="bg-orange-50"
              />
            </div>
          </SettingsSection>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Preferences */}
          <SettingsSection
            title="Preferences"
            description="Customize your shopping experience."
          >
            <div className="space-y-3">
              <SettingsToggle
                icon={Bell}
                label="Push Notifications"
                description="Get notified about order updates & deals"
                enabled={true}
                accentColor="text-blue-600"
                bgColor="bg-blue-50"
              />
              <SettingsToggle
                icon={Mail}
                label="Email Newsletters"
                description="Receive weekly deals and product updates"
                enabled={true}
                accentColor="text-indigo-600"
                bgColor="bg-indigo-50"
              />
              <SettingsToggle
                icon={Moon}
                label="Dark Mode"
                description="Switch to dark theme"
                enabled={false}
                accentColor="text-purple-600"
                bgColor="bg-purple-50"
              />
              <SettingsRow
                icon={Globe}
                label="Language"
                value="English (US)"
                accentColor="text-green-600"
                bgColor="bg-green-50"
              />
              <SettingsRow
                icon={CreditCard}
                label="Currency"
                value="USD ($)"
                accentColor="text-pink-600"
                bgColor="bg-pink-50"
              />
            </div>
          </SettingsSection>

          {/* Quick Links */}
          <SettingsSection title="Quick Links">
            <div className="space-y-3">
              <QuickLink
                icon={Package}
                label="My Orders"
                description="View and track your recent orders"
                href="/orders"
                accentColor="text-blue-600"
                bgColor="bg-blue-50"
              />
              <QuickLink
                icon={Heart}
                label="Wishlist"
                description="Products you saved for later"
                href="/wishlist"
                accentColor="text-rose-600"
                bgColor="bg-rose-50"
              />
              <QuickLink
                icon={Truck}
                label="Returns & Refunds"
                description="Manage your return requests"
                href="/return"
                accentColor="text-amber-600"
                bgColor="bg-amber-50"
              />
            </div>
          </SettingsSection>
        </div>
      </div>

      {/* ── DANGER ZONE ──────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Irreversible and destructive actions.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100">
            Delete Account
          </button>
          <button className="rounded-full border border-gray-200 bg-surface px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">
            Download My Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
