import { useState, useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileDropProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

export function FileDrop({ 
  onFileSelect, 
  acceptedTypes = ['.csv'], 
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className = '' 
}: FileDropProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) return;

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExtension)) {
      alert(`Please select a file with one of these extensions: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    onFileSelect(file);
  }, [disabled, acceptedTypes, maxSize, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExtension)) {
      alert(`Please select a file with one of these extensions: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    onFileSelect(file);
    e.target.value = ''; // Reset input
  }, [acceptedTypes, maxSize, onFileSelect]);

  return (
    <div 
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
        ${isDragOver 
          ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
          : 'border-gray-300 dark:border-gray-600'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:border-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {isDragOver ? (
            <Upload className="h-6 w-6 text-[var(--primary)]" />
          ) : (
            <FileText className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            {isDragOver ? 'Drop your file here' : 'Upload your portfolio'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDragOver 
              ? 'Release to upload' 
              : `Drag & drop or click to select (${acceptedTypes.join(', ')})`
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Max file size: {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      </div>
    </div>
  );
}