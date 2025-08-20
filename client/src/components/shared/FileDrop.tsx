import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileDropProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string[];
  maxSizeBytes?: number;
  className?: string;
  disabled?: boolean;
}

export function FileDrop({ 
  onFileSelect, 
  acceptedTypes, 
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  className = '',
  disabled = false
}: FileDropProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    const acceptsAnyType = acceptedTypes.some(type => 
      type.includes('*') || type === file.type
    );
    const acceptsExtension = acceptedTypes.some(type => 
      type.startsWith('.') && type.substring(1) === fileType
    );
    
    if (!acceptsAnyType && !acceptsExtension && !acceptedTypes.includes(`.${fileType}`)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      openFileDialog();
    }
  };

  return (
    <div className={className}>
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragOver && !disabled
            ? 'border-[var(--primary)] bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload file"
        aria-describedby="file-drop-description"
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`p-3 rounded-full ${
            isDragOver && !disabled
              ? 'bg-[var(--primary)] text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            <Upload className="h-6 w-6" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              {isDragOver ? 'Drop file here' : 'Upload your portfolio'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400" id="file-drop-description">
              Drag and drop your CSV or Excel file, or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Accepted formats: {acceptedTypes.join(', ')} • Max size: {(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB
            </p>
          </div>

          <Button variant="outline" disabled={disabled} tabIndex={-1}>
            <FileText className="h-4 w-4 mr-2" />
            Choose File
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {error}
            </span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}