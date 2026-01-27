// Sparken Brand Constants
// Brand: Built for the Brain - Behavioral Science Creative Studio

export const SPARKEN_BRAND = {
  // Brand Colors - Official Palette from Brandbook
  colors: {
    primary: '#5E5592',      // Deep Cognitive Purple - headers, anchors, brand identity
    secondary: '#F8D830',    // Behavioral Yellow - CTAs and key attention moments (use sparingly)
    accent: '#D7DF5E',       // Research Lime - status, validation, success, insights
    background: '#F4F5F7',   // Soft Cognitive Gray - backgrounds, surfaces, cards
    text: '#030403',         // Near-black - official text color
    white: '#FFFFFF',        // Pure white
  },

  // Logo Configuration - Official Logo
  logo: {
    path: '/logos/sparken-logo-horizontal.png',
    width: 120,
    height: 40,
    position: {
      x: 50,   // Left margin
      y: 750,  // Position from bottom (for 8.5x11 page ~792 points tall)
    },
  },

  // Watermark Configuration - Subtle, never distracting
  watermark: {
    text: 'SPARKEN',
    fontSize: 70,
    opacity: 0.04,  // Very subtle - calm, not aggressive
    rotation: -45,  // Diagonal angle in degrees
    color: { r: 0.37, g: 0.33, b: 0.57 },  // RGB for #5E5592 (Deep Cognitive Purple)
  },

  // Header Configuration
  header: {
    text: 'SPARKEN',
    fontSize: 11,
    color: { r: 0.37, g: 0.33, b: 0.57 },  // RGB for #5E5592
    position: {
      x: 50,
      y: 770,
    },
  },

  // Footer Configuration - Clear and structured
  footer: {
    text: 'Sparken',
    fontSize: 9,
    color: { r: 0.369, g: 0.333, b: 0.573 },  // #5E5592 Deep Cognitive Purple
    position: {
      x: 50,
      y: 30,
    },
    pageNumberEnabled: true,
  },

  // File Upload Limits
  upload: {
    maxSizeBytes: 10 * 1024 * 1024,  // 10MB
    acceptedFormats: ['.pdf', '.doc', '.docx', '.md'],
    acceptedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'text/plain', // Some systems identify .md as text/plain
    ],
  },
};

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to validate file type
export function isValidFileType(file: File): boolean {
  return SPARKEN_BRAND.upload.acceptedMimeTypes.includes(file.type) ||
    SPARKEN_BRAND.upload.acceptedFormats.some(format => 
      file.name.toLowerCase().endsWith(format)
    );
}

// Helper function to validate file size
export function isValidFileSize(file: File): boolean {
  return file.size <= SPARKEN_BRAND.upload.maxSizeBytes;
}
