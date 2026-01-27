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
    
    // Remove whole-line bold markers
    if (/^\*\*(.+)\*\*$/.test(cleanedLine)) {
      const inner = cleanedLine.match(/^\*\*(.+)\*\*$/)?.[1];
      if (inner && !foundFirstHeading && inner.length < 100) {
        cleanedLine = inner;
      } else if (inner && !/^##?\s+/.test(cleanedLine)) {
        cleanedLine = inner;
      }
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
