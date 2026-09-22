import React, { useState } from 'react';
import { translations } from '../translations';
import { Language, UserProfile, SubscriptionPlan } from '../types';
import { updateUserProfileData, logoutUser } from '../firebase/authService';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Crown, 
  LogOut, 
  Check, 
  Save, 
  Loader2, 
  DollarSign, 
  Sparkles,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userProfile: UserProfile | null;
  onOpenPricing: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  lang,
  userProfile,
  onOpenPricing,
}) => {
  const t = translations[lang];

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [currency, setCurrency] = useState(userProfile?.preferredCurrency || '$');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen || !userProfile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfileData(userProfile.uid, {
        displayName: displayName.trim(),
        preferredCurrency: currency,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isPro = userProfile.plan === 'premium';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Avatar & Details */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold text-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : userProfile.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">
                {userProfile.displayName || (lang === 'fa' ? 'کاربر معامله‌گر' : 'Active Trader')}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                isPro 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {isPro ? <Crown className="w-3 h-3" /> : null}
                <span>{isPro ? t.premiumPlan : t.freePlan}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{userProfile.email}</span>
            </p>
          </div>
        </div>

        {/* Subscription Plan Card */}
        <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.currentPlan}: {isPro ? t.premiumPlan : t.freePlan}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              {isPro ? t.proFeatures : t.freeFeatures}
            </p>
          </div>

          {!isPro ? (
            <button
              onClick={() => {
                onClose();
                onOpenPricing();
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold shadow-md shrink-0 flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t.upgradeToPro}</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Pro</span>
            </div>
          )}
        </div>

        {/* Account Settings Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {t.fullName}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your Display Name"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl ps-9 pe-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {lang === 'fa' ? 'واحد پولی پیش‌فرض حساب' : 'Default Trading Currency'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl ps-9 pe-3 py-2.5 text-slate-100 outline-none"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="﷼">IRR / Toman (﷼)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saveSuccess ? (lang === 'fa' ? 'ذخیره شد!' : 'Saved!') : (lang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes')}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
