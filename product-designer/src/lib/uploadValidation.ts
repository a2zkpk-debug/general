import type { UploadValidationResult } from "../types/designer";

const ACCEPTED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "application/pdf",
]);

const EXT_FALLBACK: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

export function detectMime(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return EXT_FALLBACK[ext] || "";
}

export async function validateUpload(
  file: File,
  maxMb: number
): Promise<UploadValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const mime = detectMime(file);
  const maxBytes = maxMb * 1024 * 1024;

  if (!ACCEPTED.has(mime)) {
    errors.push("Unsupported format. Use PNG, JPG, JPEG, SVG, or PDF.");
  }
  if (file.size > maxBytes) {
    errors.push(`File exceeds ${maxMb} MB maximum.`);
  }

  if (errors.length || mime === "application/pdf" || mime === "image/svg+xml") {
    return {
      ok: errors.length === 0,
      errors,
      warnings,
      meta: {
        width: 0,
        height: 0,
        sizeBytes: file.size,
        mime,
        hasTransparency: mime === "image/png",
      },
    };
  }

  const bitmap = await readImageMeta(file);
  if (bitmap.width < 300 || bitmap.height < 300) {
    warnings.push("Resolution is below 300×300 — print quality may look soft.");
  }
  const ratio = bitmap.width / Math.max(1, bitmap.height);
  if (ratio < 0.4 || ratio > 2.5) {
    warnings.push("Unusual aspect ratio — check how it sits in the print zone.");
  }
  if (bitmap.width * bitmap.height < 400_000) {
    warnings.push("Image quality may be low for large print areas.");
  }

  return {
    ok: true,
    errors,
    warnings,
    meta: {
      width: bitmap.width,
      height: bitmap.height,
      sizeBytes: file.size,
      mime,
      hasTransparency: bitmap.hasTransparency,
    },
  };
}

async function readImageMeta(file: File): Promise<{
  width: number;
  height: number;
  hasTransparency: boolean;
}> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    let hasTransparency = file.type === "image/png";
    if (file.type === "image/png") {
      hasTransparency = await sampleTransparency(img);
    }
    return { width: img.naturalWidth, height: img.naturalHeight, hasTransparency };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image."));
    img.src = src;
  });
}

async function sampleTransparency(img: HTMLImageElement): Promise<boolean> {
  try {
    const canvas = document.createElement("canvas");
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
