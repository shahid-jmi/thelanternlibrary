// Turns whatever photo an admin picks (often an iPhone HEIC, often several MB)
// into a file the cover-image upload endpoint accepts: JPG/PNG/WEBP, at most
// 2MB. The backend's sharp build can't decode HEIC, so conversion has to
// happen here in the browser. The backend still resizes to 1200px and
// re-encodes to WebP, so nothing is lost by shrinking before upload.

// Must stay in sync with MAX_FILE_SIZE_BYTES in
// backend/src/common/middleware/uploadCoverImage.ts.
const UPLOAD_LIMIT_BYTES = 2 * 1024 * 1024;

const UPLOADABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Tried in order until the result fits under the limit. The backend caps
// width at 1200px, so the last step loses nothing that would have survived.
const ATTEMPTS = [
  { maxDimension: 2000, quality: 0.85 },
  { maxDimension: 1600, quality: 0.8 },
  { maxDimension: 1200, quality: 0.75 },
];

export class UnsupportedImageError extends Error {}

const isHeic = (file: File) =>
  /^image\/hei[cf](-sequence)?$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || 'image';

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const encode = async (
  bitmap: ImageBitmap,
  maxDimension: number,
  quality: number
): Promise<Blob> => {
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available');

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  // WebP keeps transparency (stickers, logos). Browsers that can't encode it
  // hand back a PNG instead, so fall back to JPEG on a white background.
  const webp = await canvasToBlob(canvas, 'image/webp', quality);
  if (webp?.type === 'image/webp') return webp;

  context.globalCompositeOperation = 'destination-over';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const jpeg = await canvasToBlob(canvas, 'image/jpeg', quality);
  if (!jpeg) throw new Error('Could not encode image');
  return jpeg;
};

export async function prepareImageForUpload(file: File): Promise<File> {
  const heic = isHeic(file);
  if (!heic && !UPLOADABLE_TYPES.includes(file.type)) {
    throw new UnsupportedImageError(file.type || file.name);
  }
  if (!heic && file.size <= UPLOAD_LIMIT_BYTES) return file;

  let source: Blob = file;
  if (heic) {
    // Loaded on demand: the decoder is large and only admins picking a HEIC
    // photo ever need it.
    const { heicTo } = await import('heic-to');
    source = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.92 });
  }

  const bitmap = await createImageBitmap(source);
  try {
    let blob: Blob | null = null;
    for (const { maxDimension, quality } of ATTEMPTS) {
      blob = await encode(bitmap, maxDimension, quality);
      if (blob.size <= UPLOAD_LIMIT_BYTES) break;
    }
    if (!blob) throw new Error('Could not encode image');
    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
    return new File([blob], `${baseName(file.name)}.${extension}`, { type: blob.type });
  } finally {
    bitmap.close();
  }
}
