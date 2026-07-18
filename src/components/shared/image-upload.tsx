import { ImagePlus, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  /** Supabase Storage bucket to upload into. Defaults to 'property-images'. */
  bucket?: string;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function ImageUpload({ value, onChange, label = 'Image', className, bucket = 'property-images' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be 5MB or smaller');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary/40"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm font-medium">Uploading…</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="size-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-foreground/60 text-background backdrop-blur transition-opacity hover:bg-foreground/80"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <ImagePlus className="size-7" />
            <span className="text-sm font-medium">Click or drop image</span>
            <span className="text-2xs">PNG, JPG up to 5MB</span>
          </button>
        )}
      </div>
      {error && <p className="text-2xs font-medium text-danger">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}