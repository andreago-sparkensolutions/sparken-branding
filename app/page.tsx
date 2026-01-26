'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';

type ProcessingState = 'idle' | 'processing' | 'complete' | 'error';

export default function Home() {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [brandedFileUrl, setBrandedFileUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileAccepted = async (file: File) => {
    setFileName(file.name);
    setProcessingState('processing');
    setErrorMessage('');
    setBrandedFileUrl('');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Send to branding API
      const response = await fetch('/api/brand', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Branding failed');
      }

      // Get the branded PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBrandedFileUrl(url);
      setProcessingState('complete');
    } catch (error) {
      console.error('Processing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process document');
      setProcessingState('error');
    }
  };

  const handleDownload = () => {
    if (brandedFileUrl) {
      const link = document.createElement('a');
      link.href = brandedFileUrl;
      // Always use .pdf extension for branded files
      const pdfFileName = fileName.replace(/\.(md|docx?)$/i, '.pdf');
      link.download = `sparken-branded-${pdfFileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setProcessingState('idle');
    setFileName('');
    setBrandedFileUrl('');
    setErrorMessage('');
    if (brandedFileUrl) {
      URL.revokeObjectURL(brandedFileUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#D0C6E1] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center">
          <img 
            src="/sparken logo horizontal cropped.png" 
            alt="Sparken Logo" 
            style={{ height: '48px', width: 'auto' }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-2 flex-1">
        {/* Hero Section */}
        <div className="text-center mb-1.5">
          <h2 className="text-lg font-bold text-[#5E5592] mb-0.5">
            Brand Your Documents
          </h2>
          <p className="text-xs text-[#030403]">
            Upload PDF, Word, or Markdown. We'll add Sparken branding.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-md p-2.5 mb-1.5">
          <FileUpload 
            onFileAccepted={handleFileAccepted} 
            isProcessing={processingState === 'processing'}
          />
        </div>

        {/* Processing Status */}
        <ProcessingStatus
          status={processingState}
          fileName={fileName}
          message={errorMessage || undefined}
        />

        {/* Actions */}
        {processingState === 'complete' && brandedFileUrl && (
          <div className="mt-2 flex flex-col gap-2 items-center max-w-lg mx-auto">
            <button
              onClick={handleDownload}
              className="w-full px-8 py-3.5 bg-[#F8D830] text-[#030403] text-base font-extrabold rounded-xl shadow-2xl hover:shadow-[0_8px_30px_rgb(248,216,48,0.5)] hover:bg-[#FFE040] transform hover:scale-[1.02] transition-all duration-200 border-2 border-[#E5C520]"
            >
              <span className="text-xl">⬇</span> Download Branded PDF
            </button>
            <button
              onClick={handleReset}
              className="w-full px-6 py-2 bg-white text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Brand Another Document
            </button>
          </div>
        )}

        {processingState === 'error' && (
          <div className="mt-1.5 flex justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Features - Ultra compact */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="text-center p-1.5">
            <div className="w-7 h-7 bg-[#5E5592] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-1">
              <svg className="w-3.5 h-3.5 text-[#5E5592]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-[#5E5592] mb-0.5">Professional</h3>
            <p className="text-xs text-[#030403] leading-tight">Logo, watermark, headers</p>
          </div>

          <div className="text-center p-1.5">
            <div className="w-7 h-7 bg-[#5E5592] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-1">
              <svg className="w-3.5 h-3.5 text-[#5E5592]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-[#5E5592] mb-0.5">Clear Structure</h3>
            <p className="text-xs text-[#030403] leading-tight">Reduces cognitive load</p>
          </div>

          <div className="text-center p-1.5">
            <div className="w-7 h-7 bg-[#5E5592] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-1">
              <svg className="w-3.5 h-3.5 text-[#5E5592]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-[#5E5592] mb-0.5">Instant</h3>
            <p className="text-xs text-[#030403] leading-tight">Fast, secure processing</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-2 border-t border-gray-200">
        <p className="text-center text-gray-500 text-xs">
          © 2026 Sparken
        </p>
      </footer>
    </div>
  );
}
