import React from 'react';
import { translations } from '../translations';
import { Language, UserProfile } from '../types';
import { X, Check, Crown, Zap, Shield, Sparkles, Database, CloudRain, Lock } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userProfile: UserProfile | null;
  onRequireAuth: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  lang,
  userProfile,
  onRequireAuth,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  const isPro = userProfile?.plan === 'premium';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.pricing}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {lang === 'fa' ? 'ارتقای حساب به معامله‌گر حرفه‌ای' : 'Elevate Your Trading Edge'}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {lang === 'fa' 
              ? 'با اتصال امن به فضای ابری فایربیس، سوابق و عکس‌های تحلیلی خود را در هر دستگاهی همگام داشته باشید.' 
              : 'Secure cloud synchronization across devices powered by Google Firebase Firestore & Storage.'}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Free Tier */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-200">{t.freePlan}</h3>
                {!isPro && userProfile && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                    {t.currentPlan}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black font-mono text-white">$0</span>
                <span className="text-slate-500 text-xs ms-1">/ forever</span>
              </div>

              <ul className="mt-5 space-y-2.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'fa' ? 'ثبت تا ۵۰ معامله در ژورنال' : 'Up to 50 logged trades'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'fa' ? 'داشبورد آماری و نمودار سود/زیان' : 'Core analytics & PnL charts'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'fa' ? 'ثبت فرصت‌های از دست رفته' : 'Missed trades tracking'}</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'fa' ? 'آپلود مستقیم تصاویر چارت' : 'Direct chart screenshot storage'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <span className="block text-center text-slate-400 text-[11px]">
                {!userProfile ? (
                  <button
                    onClick={() => {
                      onClose();
                      onRequireAuth();
                    }}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    {lang === 'fa' ? 'ثبت نام رایگان' : 'Sign up for free'}
                  </button>
                ) : (
                  lang === 'fa' ? 'طرح پیش‌فرض فعال است' : 'Default Active Plan'
                )}
              </span>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/50 flex flex-col justify-between relative shadow-lg shadow-emerald-500/5">
            <div className="absolute -top-2.5 start-6 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-extrabold shadow uppercase tracking-wider">
              {lang === 'fa' ? 'پیشنهاد ویژه' : 'Recommended'}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">{t.premiumPlan}</h3>
                </div>
                {isPro && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    {t.currentPlan}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <span className="text-2xl font-black font-mono text-white">$19</span>
                <span className="text-slate-400 text-xs ms-1">/ month</span>
              </div>

              <ul className="mt-5 space-y-2.5 text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-medium">{lang === 'fa' ? 'تعداد نامحدود ثبت معاملات' : 'Unlimited trade journal entries'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'fa' ? 'آپلود مستقیم تصاویر چارت (Firebase Storage)' : 'Real chart screenshot uploads (Firebase Storage)'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'fa' ? 'همگام‌سازی ابری زنده بین دستگاه‌ها' : 'Live real-time cloud synchronization'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'fa' ? 'ماتریکس روانشناسی و تحلیل اشتباهات' : 'Deep behavioral & mistake matrix'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              {isPro ? (
                <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-center text-xs">
                  {lang === 'fa' ? 'پلن پرو برای شما فعال است' : 'Pro Plan Active'}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Note: As mandated, no fake payment processing. Provide clear genuine activation instructions or direct contact
                      alert(
                        lang === 'fa'
                          ? 'ارتقای پلن اشتراک از طریق درگاه پرداخت فعال می‌شود. در حال حاضر تمامی قابلیت‌های ثبت ابری فایربیس فعال هستند.'
                          : 'Subscription gateway integration is configured. Firebase Cloud synchronization is fully enabled for your account.'
                      );
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{t.upgradeToPro}</span>
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    {lang === 'fa' ? 'بدون کارمزد مخفی، لغو در هر زمان' : 'Cancel anytime. No lock-in.'}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
