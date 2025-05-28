import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  style?: React.CSSProperties;
}

export function FileUploader({ value, onChange, accept, maxSize, style }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles[0]);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      style={style}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}
      `}
    >
      <input {...getInputProps()} />
      {value ? (
        <div className="space-y-2">
          <p className="text-sm text-neutral-600">{value.name}</p>
          <p className="text-xs text-neutral-500">
            Click or drag to replace
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-neutral-600">
            Click or drag file to upload
          </p>
          <p className="text-xs text-neutral-500">
            PNG, JPG up to 5MB
          </p>
        </div>
      )}
    </div>
  );
} 