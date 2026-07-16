import { useCallback, useRef, useState } from "react";
import { useDesignerStore } from "../../store/designerStore";
import { formatBytes, validateUpload } from "../../lib/uploadValidation";
import { Modal } from "../ui/primitives";

type SourceTab = "computer" | "mobile" | "camera" | "drive" | "dropbox" | "onedrive";

export function ImageUploadModal() {
  const open = useDesignerStore((s) => s.uploadModalOpen);
  const product = useDesignerStore((s) => s.product);
  const progress = useDesignerStore((s) => s.uploadProgress);
  const uploadingFileName = useDesignerStore((s) => s.uploadingFileName);
  const openUploadModal = useDesignerStore((s) => s.openUploadModal);
  const setUploadProgress = useDesignerStore((s) => s.setUploadProgress);
  const addImageLayer = useDesignerStore((s) => s.addImageLayer);

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [tab, setTab] = useState<SourceTab>("computer");
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const reset = () => {
    setErrors([]);
    setWarnings([]);
    setPreview(null);
    setLastFile(null);
    setUploadProgress(null, null);
  };

  const processFile = useCallback(
    async (file: File) => {
      reset();
      setLastFile(file);
      const result = await validateUpload(file, product.maxUploadMb);
      setErrors(result.errors);
      setWarnings(result.warnings);
      if (!result.ok || !result.meta) return;

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      abortRef.current = new AbortController();
      setUploadProgress(0, file.name);

      try {
        await simulateUpload(file, (pct) => setUploadProgress(pct, file.name), abortRef.current.signal);
        addImageLayer({
          src: objectUrl,
          fileName: file.name,
          width: result.meta.width || 800,
          height: result.meta.height || 800,
          hasTransparency: result.meta.hasTransparency,
        });
        if (result.meta.hasTransparency) {
          setWarnings((w) => [...w, "Transparent PNG detected — great for print overlays."]);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setErrors(["Upload cancelled."]);
        } else {
          setErrors(["Upload failed. Please retry."]);
        }
        setUploadProgress(null, null);
      }
    },
    [addImageLayer, product.maxUploadMb, setUploadProgress]
  );

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void processFile(file);
  };

  return (
    <Modal open={open} title="Upload Image" onClose={() => { reset(); openUploadModal(false); }} wide>
      <div className="pd-upload-tabs">
        {(
          [
            ["computer", "My Computer"],
            ["mobile", "Mobile Device"],
            ["camera", "Camera"],
            ["drive", "Google Drive"],
            ["dropbox", "Dropbox"],
            ["onedrive", "OneDrive"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`pd-upload-tab${tab === id ? " is-active" : ""}${
              id === "drive" || id === "dropbox" || id === "onedrive" ? " is-soon" : ""
            }`}
            disabled={id === "drive" || id === "dropbox" || id === "onedrive"}
            onClick={() => setTab(id)}
          >
            {label}
            {(id === "drive" || id === "dropbox" || id === "onedrive") && <span>Soon</span>}
          </button>
        ))}
      </div>

      <div
        className={`pd-dropzone${dragOver ? " is-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
      >
        <div className="pd-dropzone__icon">↑</div>
        <strong>Drag images here</strong>
        <span>or</span>
        <button
          type="button"
          className="pd-btn pd-btn--primary"
          onClick={() => (tab === "camera" ? cameraRef.current?.click() : inputRef.current?.click())}
        >
          Browse Files
        </button>
        <p className="pd-dropzone__meta">
          PNG · JPG · JPEG · SVG · PDF (optional) · AI/EPS (future)
          <br />
          Max {product.maxUploadMb} MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,application/pdf,.png,.jpg,.jpeg,.svg,.pdf"
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />

      {progress !== null ? (
        <div className="pd-upload-progress">
          {preview ? <img src={preview} alt="" className="pd-upload-thumb" /> : null}
          <div className="pd-upload-progress__body">
            <div className="pd-upload-progress__head">
              <strong>{uploadingFileName}</strong>
              <span>{progress}%</span>
            </div>
            <div className="pd-progress-bar">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="pd-upload-progress__actions">
              <button
                type="button"
                className="pd-link"
                onClick={() => abortRef.current?.abort()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {errors.length || warnings.length ? (
        <div className="pd-upload-msgs">
          {errors.map((msg) => (
            <p key={msg} className="is-error">
              {msg}
            </p>
          ))}
          {warnings.map((msg) => (
            <p key={msg} className="is-warn">
              {msg}
            </p>
          ))}
          {errors.length && lastFile ? (
            <button type="button" className="pd-btn pd-btn--outline" onClick={() => void processFile(lastFile)}>
              Retry upload
            </button>
          ) : null}
          {lastFile ? <p className="pd-micro">{formatBytes(lastFile.size)}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
}

function simulateUpload(
  file: File,
  onProgress: (pct: number) => void,
  signal: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    let pct = 0;
    const tick = () => {
      if (signal.aborted) {
        reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
        return;
      }
      pct = Math.min(100, pct + Math.max(4, Math.round(18 - file.size / (1024 * 1024))));
      onProgress(pct);
      if (pct >= 100) resolve();
      else window.setTimeout(tick, 90);
    };
    tick();
  });
}
