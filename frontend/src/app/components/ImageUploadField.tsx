import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus } from 'lucide-react';

export default function ImageUploadField({
  label,
  file,
  onFileChange,
  existingUrl,
}: {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  existingUrl?: string;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const displayUrl = previewUrl || existingUrl;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm">
        {label}
      </label>
      <div className="flex items-center gap-4">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt=""
            className="h-24 w-16 rounded-sm border border-border object-cover"
          />
        ) : (
          <div className="flex h-24 w-16 items-center justify-center rounded-sm border border-dashed border-border opacity-50">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-4 text-xs uppercase tracking-label transition hover:bg-secondary"
          >
            {displayUrl ? t('admin.form.changeImage') : t('admin.form.chooseImage')}
          </button>
          {file && (
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="text-xs opacity-60 transition hover:opacity-100 hover:underline"
            >
              {t('admin.form.removeSelection')}
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        className="hidden"
      />
    </div>
  );
}
