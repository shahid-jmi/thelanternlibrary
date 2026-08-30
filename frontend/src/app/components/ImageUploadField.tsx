import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Loader2, X } from 'lucide-react';

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
  const [imageLoading, setImageLoading] = useState(false);

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

  useEffect(() => {
    if (displayUrl) {
      setImageLoading(true);
    }
  }, [displayUrl]);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-16 shrink-0">
          {displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt=""
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                className={`h-24 w-16 rounded-sm border border-border object-cover transition-opacity ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-sm border border-border bg-input-background">
                  <Loader2 className="h-5 w-5 animate-spin opacity-60" />
                </div>
              )}
              {file && (
                <button
                  type="button"
                  onClick={() => onFileChange(null)}
                  aria-label={t('admin.form.removeSelection')}
                  title={t('admin.form.removeSelection')}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-card-foreground transition hover:border-destructive hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="flex h-24 w-16 items-center justify-center rounded-sm border border-dashed border-border opacity-50">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-4 text-xs uppercase tracking-label transition hover:bg-secondary"
        >
          {displayUrl ? t('admin.form.changeImage') : t('admin.form.chooseImage')}
        </button>
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
