'use client';

interface ProcessingStatusProps {
  status: 'idle' | 'processing' | 'complete' | 'error';
  message?: string;
  fileName?: string;
}

export default function ProcessingStatus({ status, message, fileName }: ProcessingStatusProps) {
  if (status === 'idle') return null;

  return (
    <div className="mt-1.5 p-1.5 rounded-md bg-white shadow-sm border border-gray-200">
      <div className="flex items-center gap-2">
        {/* Status Icon */}
        {status === 'processing' && (
          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#5E5592] border-t-transparent" />
        )}
        
        {status === 'complete' && (
          <svg className="w-3.5 h-3.5 text-[#D7DF5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        
        {status === 'error' && (
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}

        {/* Status Message */}
        <div className="flex-1">
          <p className={`text-xs font-semibold ${
            status === 'complete' ? 'text-[#5E5592]' : 
            status === 'error' ? 'text-red-600' : 
            'text-[#5E5592]'
          }`}>
            {message || (
              status === 'processing' ? 'Applying branding...' :
              status === 'complete' ? fileName ? `✓ ${fileName}` : 'Branding complete' :
              'Processing failed'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
