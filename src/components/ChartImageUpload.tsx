import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { uploadTradeChartImage } from '../firebase/storageService';
import { translations } from '../translations';
import { Language } from '../types';

interface ChartImageUploadProps {
  userId?: string;
  tradeId: string;
  currentChartUrl?: string;
  onChartUploaded: (url: string, storagePath?: string) => void;
  onChartRemoved: () => void;
  lang: Language;
  isMissedTrade?: boolean;
}

export const ChartImageUpload: React.FC<ChartImageUploadProps> = ({
  userId,
  tradeId,
  currentChartUrl,
  onChartUploaded,
  onChartRemoved,
  lang,
  isMissedTrade = false,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentChartUrl || '');
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError(
        lang === 'fa' 
          ? 'فرمت فایل باید JPG، PNG یا WEBP باشد.' 
          : 'Please select a valid image (JPG, PNG, WEBP).'
      );
      return;
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        lang === 'fa' 
          ? 'حجم فایل نباید بیش از ۱۰ مگابایت باشد.' 
          : 'Image size exceeds 10MB limit.'
      );
      return;
    }

    setUploadError(null);

    // Create local object URL for instant preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // If no userId (e.g. offline/unauthenticated local mode), save base64 / blob preview
    if (!userId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChartUploaded(reader.result as string, undefined);
      };
      reader.readAsDataURL(file);
      return;
    }

    try {
      setUploading(true);
      setProgress(5);
      const { downloadUrl, storagePath } = await uploadTradeChartImage(
        userId,
        tradeId,
        file,
        isMissedTrade,
        (p) => setProgress(p)
      );
      setPreviewUrl(downloadUrl);
      onChartUploaded(downloadUrl, storagePath);
    } catch (err: any) {
      console.error('Failed to upload chart image:', err);
      setUploadError(
        lang === 'fa'
          ? 'خطا در آپلود تصویر در فایربیس استوریج. اتصال یا دسترسی را بررسی کنید.'
          : err?.message || 'Failed to upload image to Firebase Storage.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChartRemoved();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
          {t.chartAttachment}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            {t.removeChart}
          </button>
        )}
      </div>

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950/60 group max-h-56 flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Chart analysis preview"
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-56 object-contain"
          />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 shadow"
            >
              <Upload className="w-3.5 h-3.5" />
              {t.changeChart}
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Upload className="w-4 h-4 text-slate-300" />
              )}
            </div>
            <p className="text-xs font-medium text-slate-300">
              {uploading ? t.uploadingChart : t.dropChartHere}
            </p>
            <p className="text-[11px] text-slate-500">PNG, JPG, WEBP (Max 10MB)</p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
};
