/**
 * Clean PDF text artifacts from content
 * Client-side version for TypeScript fallback
 */
export function cleanPdfArtifacts(text: string): string {
  // Remove link wrappers from titles
  text = text.replace(/\*\*\[([^\]]+?)\n+([^\]]*?)\]\([^)]+?\)\*\*/gm, '$1 $2');
  text = text.replace(/\*\*\[([^\]]+?)\]\([^)]+?\)\*\*/g, '$1');
  
  let lines = text.split('\n');
  const cleaned: string[] = [];
  let foundFirstHeading = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip page break markers like "-- X of Y --"
    if (/^--\s*\d+\s+of\s+\d+\s*--$/.test(line)) {
      continue;
    }
    
    // Skip bullet point artifacts like "• --"
    if (/^[•\-]\s*--\s*$/.test(line)) {
      continue;
    }
    
    // Skip standalone bullets or dashes
    if (/^[•\-]\s*$/.test(line)) {
      continue;
    }
    
    // Skip footer lines like "Page X of Y Sparken"
    if (/^Page\s+\d+\s+of\s+\d+\s+\w+\s*$/.test(line)) {
      continue;
    }
    
    // Skip standalone ## or ###
    if (/^#{2,}$/.test(line)) {
      continue;
    }
    
    // Skip lone numbers
    if (/^\d+$/.test(line)) {
      continue;
    }
    
    // Clean inline link references
    let cleanedLine = line.replace(/\[([^\]]+?)\]\(#[^)]+?\)/g, '$1');
    
    // Clean HTML entities
    cleanedLine = cleanedLine.replace(/&amp;/g, '&');
    cleanedLine = cleanedLine.replace(/&nbsp;/g, ' ');
    
    // Remove ALL markdown formatting - these should not appear in final PDF
    cleanedLine = cleanedLine.replace(/\*\*(.+?)\*\*/g, '$1');  // Remove bold
    cleanedLine = cleanedLine.replace(/\*(.+?)\*/g, '$1');  // Remove italic
    cleanedLine = cleanedLine.replace(/`(.+?)`/g, '$1');  // Remove code markers
    
    // COMPREHENSIVE: Remove backslash escapes before special characters
    // This handles \~, \=, \-, \+, \*, \_, \[, \], \(, \), etc.
    cleanedLine = cleanedLine.replace(/\\([~=\-+*_\[\](){}|<>$#@!&^%])/g, '$1');
    
    // Fix escaped numbered lists like "1\." → "1."
    cleanedLine = cleanedLine.replace(/(\d+)\\\./g, '$1.');
    
    // Remove trailing single digits
    cleanedLine = cleanedLine.replace(/\s+\d+\s*$/, '');
    
    // Detect ALL CAPS titles and convert to H1
    if (!foundFirstHeading && cleanedLine.length > 10 && cleanedLine.length < 100 && !cleanedLine.startsWith('#')) {
      const alphaChars = cleanedLine.split('').filter(c => /[a-zA-Z]/.test(c));
      if (alphaChars.length > 0) {
        const uppercaseRatio = alphaChars.filter(c => c === c.toUpperCase()).length / alphaChars.length;
        if (uppercaseRatio > 0.7) {
          cleaned.push(`# ${cleanedLine}`);
          foundFirstHeading = true;
          continue;
        }
      }
    }
    
    // Don't keep bold markers - they should be removed entirely
    // Skip empty lines after cleaning
    if (!cleanedLine.trim()) {
      if (cleaned.length > 0 && cleaned[cleaned.length - 1] !== '') {
        cleaned.push('');
      }
      continue;
    }
    
    if (cleanedLine) {
      cleaned.push(cleanedLine);
    } else if (cleaned.length > 0 && cleaned[cleaned.length - 1] !== '') {
      cleaned.push('');
    }
  }
  
  // Join and clean up excessive blank lines
  text = cleaned.join('\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text;
}
