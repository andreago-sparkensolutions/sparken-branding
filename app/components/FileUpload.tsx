'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { SPARKEN_BRAND, formatFileSize, isValidFileType, isValidFileSize } from '@/lib/constants';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileAccepted, isProcessing }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        alert(`File is too large. Maximum size is ${formatFileSize(SPARKEN_BRAND.upload.maxSizeBytes)}`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        alert('Invalid file type. Please upload PDF, Word, or Markdown documents.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (!isValidFileType(file)) {
        alert('Invalid file type. Please upload PDF, Word, or Markdown documents.');
        return;
      }
      
      if (!isValidFileSize(file)) {
        alert(`File is too large. Maximum size is ${formatFileSize(SPARKEN_BRAND.upload.maxSizeBytes)}`);
        return;
      }
      
      onFileAccepted(file);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
      'text/plain': ['.md'],
    },
    maxSize: SPARKEN_BRAND.upload.maxSizeBytes,
    multiple: false,
    disabled: isProcessing,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-3 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragActive 
          ? 'border-[#5E5592] bg-[#5E5592] bg-opacity-5' 
          : 'border-gray-300 hover:border-[#5E5592] hover:bg-gray-50'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-1">
        {/* Upload Icon */}
        <svg
          className="w-7 h-7 text-[#5E5592]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        {isDragActive ? (
          <p className="text-sm font-semibold text-[#5E5592]">
            Drop your document here
          </p>
        ) : (
          <>
            <p className="text-sm font-semibold text-[#030403]">
              {isProcessing ? 'Processing...' : 'Drag and drop your document'}
            </p>
            <p className="text-xs text-gray-600">
              or click to select
            </p>
          </>
        )}

        <p className="text-xs text-gray-500 mt-0.5">
          PDF, DOC, DOCX, MD • Max {formatFileSize(SPARKEN_BRAND.upload.maxSizeBytes)}
        </p>
      </div>
    </div>
  );
}
