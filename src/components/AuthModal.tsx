import React, { useState } from 'react';
import { translations } from '../translations';
import { Language } from '../types';
import { 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword 
} from '../firebase/authService';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export type AuthModalMode = 'login' | 'signup' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialMode?: AuthModalMode;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMode = 'login',
  onSuccess,
}) => {
  const t = translations[lang];
  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  const handleModeSwitch = (newMode: AuthModalMode) => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    // Validation
    if (!email || !email.includes('@')) {
      setErrorMessage(t.authErrorInvalidEmail);
      return;
    }

    if (mode === 'forgot') {
      try {
        setLoading(true);
        await resetPassword(email);
        setSuccessNotice(t.resetEmailSent);
      } catch (err: any) {
        setErrorMessage(
          lang === 'fa' 
            ? 'خطا در ارسال ایمیل بازیابی. لطفاً ایمیل خود را بررسی کنید.' 
            : err?.message || 'Failed to send reset email.'
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage(t.authErrorWeakPassword);
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMessage(lang === 'fa' ? 'رمز عبور و تکرار آن یکسان نیستند.' : 'Passwords do not match.');
        return;
      }

      try {
        setLoading(true);
        await registerWithEmail(email, password, displayName.trim() || undefined);
        resetForm();
        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        console.error('Registration error:', err);
        if (err?.code === 'auth/email-already-in-use') {
          setErrorMessage(t.authErrorEmailInUse);
        } else if (err?.code === 'auth/weak-password') {
          setErrorMessage(t.authErrorWeakPassword);
        } else {
          setErrorMessage(err?.message || (lang === 'fa' ? 'خطا در ثبت نام.' : 'Registration failed.'));
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'login') {
      try {
        setLoading(true);
        await loginWithEmail(email, password);
        resetForm();
        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        console.error('Login error:', err);
        if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
          setErrorMessage(t.authErrorWrongPassword);
        } else {
          setErrorMessage(err?.message || (lang === 'fa' ? 'ورود ناموفق بود. مشخصات را بررسی کنید.' : 'Login failed. Check credentials.'));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const ArrowIcon = lang === 'fa' ? ArrowLeft : ArrowRight;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono font-black tracking-tight text-white text-base">
              WIN WAY
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Firebase Cloud Auth</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' && t.login}
            {mode === 'signup' && t.signUp}
            {mode === 'forgot' && t.resetPassword}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && (lang === 'fa' ? 'برای دسترسی به ژورنال و همگام‌سازی ابری وارد شوید' : 'Access your live trading journal & synchronized history')}
            {mode === 'signup' && (lang === 'fa' ? 'حساب کاربری ابری خود را در چند ثانیه بسازید' : 'Create your secure cloud journal account in seconds')}
            {mode === 'forgot' && (lang === 'fa' ? 'ایمیل خود را وارد کنید تا پیوند بازیابی برایتان ارسال شود' : 'Enter your registered email to receive a password reset link')}
          </p>
        </div>

        {/* Success or Error Notice */}
        {successNotice && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
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
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl ps-9 pe-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              {t.email} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="trader@example.com"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl ps-9 pe-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-300 font-medium">
                  {t.password} *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('forgot')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl ps-9 pe-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition-colors font-mono"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                {t.confirmPassword} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl ps-9 pe-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition-colors font-mono"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && t.login}
                  {mode === 'signup' && t.signUp}
                  {mode === 'forgot' && t.sendResetLink}
                </span>
                <ArrowIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {mode === 'login' && (
            <p>
              {t.dontHaveAccount}{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className="text-emerald-400 font-semibold hover:underline"
              >
                {t.signUp}
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              {t.alreadyHaveAccount}{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-emerald-400 font-semibold hover:underline"
              >
                {t.login}
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className="text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>{t.backToLogin}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
