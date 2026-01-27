// Quick test to verify markdown conversion
import { marked } from 'marked';

const testMarkdown = `**[MARKET & BEHAVIORAL RESEARCH REPORT 1](#market-&-behavioral-research-report)**`;

console.log('Input:', testMarkdown);

const html = await marked(testMarkdown, { breaks: true, gfm: true });
console.log('Output from marked:', html);

// Test our HTML stripping
let plainText = html
  .replace(/<\/?strong>/g, '')
  .replace(/<\/?b>/g, '')
  .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
  .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n')
  .replace(/<[^>]+>/g, '')
  // Fallback
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/\*\*([^*]+)\*\*/g, '$1');

console.log('Final plain text:', plainText);
