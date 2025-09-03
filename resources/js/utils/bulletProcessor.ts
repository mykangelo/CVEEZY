/**
 * Utility functions for processing bulleted descriptions in resume templates
 */

export interface ProcessedBullet {
  text: string;
  isBullet: boolean;
}

/**
 * Process a description string to detect and format bulleted content
 */
export function processBulletedDescription(description: string): ProcessedBullet[] {
  if (!description || description.trim() === '') {
    return [];
  }

  const lines = description.split(/\r\n|\r|\n/);
  const processedBullets: ProcessedBullet[] = [];
  let hasBullets = false;

  // First pass: detect if we have bullets
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && isBulletLine(trimmed)) {
      hasBullets = true;
      break;
    }
  }

  if (hasBullets) {
    // Process as bulleted content
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (isBulletLine(trimmed)) {
        // Extract content after bullet
        const content = extractBulletContent(trimmed);
        if (content) {
          processedBullets.push({ text: content, isBullet: true });
        }
      } else {
        // Non-bullet line - could be continuation or separate content
        processedBullets.push({ text: trimmed, isBullet: false });
      }
    }
  } else {
    // No bullets detected, check if it's a long description that should be split
    const longDescription = description.trim();
    if (longDescription.length > 200) {
      // Try to split long descriptions into multiple bullets
      const splitBullets = splitLongDescription(longDescription);
      if (splitBullets.length > 1) {
        return splitBullets.map(bullet => ({ text: bullet, isBullet: true }));
      }
    }
    
    // Return as single non-bullet item
    processedBullets.push({ text: longDescription, isBullet: false });
  }

  return processedBullets;
}

/**
 * Check if a line looks like a bullet point
 */
function isBulletLine(line: string): boolean {
  return /^[•\-\*]\s+/.test(line) ||
         /^\d+\.\s+/.test(line) ||
         /^[a-z]\)\s+/i.test(line) ||
         /^[A-Z][\.\)]\s+/.test(line);
}

/**
 * Extract content after bullet point
 */
function extractBulletContent(line: string): string {
  // Remove bullet point and return content
  return line.replace(/^[•\-\*]\s+/, '')
             .replace(/^\d+\.\s+/, '')
             .replace(/^[a-z]\)\s+/i, '')
             .replace(/^[A-Z][\.\)]\s+/, '')
             .trim();
}

/**
 * Split a long description into multiple bullets based on sentence structure
 */
function splitLongDescription(description: string): string[] {
  const bullets: string[] = [];
  
  // Try to split on colons (common pattern for job descriptions)
  const colonMatches = description.match(/([A-Z][^:]*):\s*([^.!?]*[.!?]?)/g);
  if (colonMatches && colonMatches.length > 1) {
    for (const match of colonMatches) {
      const parts = match.split(':');
      if (parts.length === 2) {
        const title = parts[0].trim();
        const content = parts[1].trim();
        if (content) {
          bullets.push(`${title}: ${content}`);
        }
      }
    }
    if (bullets.length > 1) {
      return bullets;
    }
  }

  // Try to split on action words with better pattern matching
  const actionWords = [
    'managed', 'led', 'developed', 'implemented', 'designed', 'created', 'built', 'improved',
    'optimized', 'increased', 'reduced', 'achieved', 'delivered', 'collaborated', 'mentored',
    'trained', 'supervised', 'analyzed', 'researched', 'maintained', 'supported', 'configured',
    'deployed', 'integrated', 'automated', 'streamlined', 'enhanced', 'established', 'ensures',
    'defines', 'manages', 'tech skills', 'responsible', 'oversaw', 'coordinated', 'facilitated',
    'executed', 'administered', 'monitored', 'evaluated', 'planned', 'organized', 'directed'
  ];

  // More comprehensive action word splitting
  for (const actionWord of actionWords) {
    const pattern = new RegExp(`\\b${actionWord}\\b[:\s]+([^.!?]*[.!?]?)`, 'gi');
    const matches = description.match(pattern);
    
    if (matches && matches.length > 1) {
      for (const match of matches) {
        const content = match.replace(new RegExp(`\\b${actionWord}\\b[:\s]+`, 'i'), '').trim();
        if (content && content.length > 10) {
          bullets.push(`${actionWord.charAt(0).toUpperCase() + actionWord.slice(1)}: ${content}`);
        }
      }
      if (bullets.length > 1) {
        return bullets;
      }
    }
  }

  // Try to split on common separators and patterns
  const separators = [
    /\.\s+(?=[A-Z])/g,  // Period followed by capital letter
    /;\s+/g,            // Semicolons
    /,\s+(?=[A-Z][a-z]*\s+[a-z])/g,  // Comma followed by action word
  ];

  for (const separator of separators) {
    const parts = description.split(separator);
    if (parts.length > 2) {
      const result: string[] = [];
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed && trimmed.length > 20) {
          result.push(trimmed);
        }
      }
      if (result.length > 1) {
        return result;
      }
    }
  }

  // Try to split on sentence boundaries
  const sentences = description.split(/([.!?])\s+/);
  if (sentences.length > 2) {
    const result: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      let sentence = sentences[i].trim();
      if (i + 1 < sentences.length) {
        sentence += sentences[i + 1]; // Add punctuation
      }
      if (sentence && sentence.length > 20) {
        result.push(sentence);
      }
    }
    if (result.length > 1) {
      return result;
    }
  }

  // If no splitting worked, return original as single item
  return [description];
}

/**
 * Get the text content from processed bullets
 */
export function getBulletTexts(bullets: ProcessedBullet[]): string[] {
  return bullets.map(bullet => bullet.text);
}
