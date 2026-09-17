/**
 * Notes Formatter & Sanitizer
 * Strips raw markdown asterisks (* and **) and standardizes
 * Question numbers (e.g. प्रश्न संख्या 1, प्रश्न संख्या 2)
 * for a clean, professional textbook-grade display.
 */

export function cleanAsterisksAndFormat(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove triple and double asterisks (e.g. *** or **) while keeping the inner text intact
  cleaned = cleaned.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');

  // 2. Remove single asterisks used for italic (e.g. *text*)
  cleaned = cleaned.replace(/\*([^*\n]+)\*/g, '$1');

  // 3. Remove bullet asterisks at the beginning of lines and replace with clean Devnagari bullet
  cleaned = cleaned.replace(/^[\t ]*\*[\t ]+/gm, '• ');

  // 4. Standardize Question labeling: ensure clear question numbers (e.g., 'प्रश्न 1:', 'प्रश्न संख्या 1:')
  cleaned = cleaned.replace(/Q\s*([0-9]+)\s*[:.]/gi, 'प्रश्न संख्या $1:');
  cleaned = cleaned.replace(/Question\s*([0-9]+)\s*[:.]/gi, 'प्रश्न संख्या $1:');
  cleaned = cleaned.replace(/Ans\s*[:.]/gi, 'उत्तर:');
  cleaned = cleaned.replace(/Answer\s*[:.]/gi, 'उत्तर:');

  // 5. If any stray asterisks remain, remove them cleanly
  cleaned = cleaned.replace(/\*/g, '');

  return cleaned.trim();
}

/**
 * Converts sanitized notes into professional HTML structure for PDF export
 */
export function notesToHtmlForPdf(rawNotes: string): string {
  const cleaned = cleanAsterisksAndFormat(rawNotes);
  const lines = cleaned.split('\n');

  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    // Heading 1 (# or 1.)
    if (line.startsWith('# ') || /^[1-5]\.\s+/.test(line) && line.length < 60) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const titleText = line.replace(/^#\s*/, '');
      html += `<div class="section-title">${titleText}</div>`;
    }
    // Heading 2 (##)
    else if (line.startsWith('## ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<div class="subsection-title">${line.replace(/^##\s*/, '')}</div>`;
    }
    // Heading 3 (###)
    else if (line.startsWith('### ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<div class="subsection-title" style="font-size: 11pt; color: #78350f;">${line.replace(/^###\s*/, '')}</div>`;
    }
    // Question Detection (e.g., प्रश्न संख्या 1: or प्रश्न 1:)
    else if (/^(प्रश्न\s*(संख्या)?\s*[0-9]+|वस्तुनिष्ठ प्रश्न|लघु उत्तरीय|दीर्घ उत्तरीय)/i.test(line)) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `
        <div class="question-card">
          <div class="q-badge">BSEB महत्वपूर्ण प्रश्न</div>
          <div class="q-text">${line}</div>
      `;

      // Read subsequent lines until next question or empty line
      let answerBlock = '';
      while (i + 1 < lines.length && !/^(#|[1-5]\.\s+|प्रश्न\s*(संख्या)?\s*[0-9]+)/i.test(lines[i + 1].trim())) {
        i++;
        const nextLine = lines[i].trim();
        if (nextLine) {
          answerBlock += `<p style="margin: 4px 0;">${nextLine}</p>`;
        }
      }
      if (answerBlock) {
        html += `<div class="q-answer">${answerBlock}</div>`;
      }
      html += `</div>`;
    }
    // Formula detection
    else if (line.includes('सूत्र:') || line.includes('समीकरण:') || line.startsWith('सूत्र') || line.includes('Formula:')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<div class="formula-box">📐 ${line}</div>`;
    }
    // Exam Tip detection
    else if (line.includes('टिप्स') || line.includes('सुझाव') || line.includes('Exam Tips')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<div class="exam-tip-box">💡 <strong>परीक्षा सुझाव:</strong> ${line.replace(/^.*(टिप्स|सुझाव):?\s*/, '')}</div>`;
    }
    // Bullet item (• or -)
    else if (line.startsWith('• ') || line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      const itemText = line.replace(/^[•-]\s*/, '');
      html += `<li>${itemText}</li>`;
    }
    // Regular paragraph
    else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p style="margin: 6px 0;">${line}</p>`;
    }
  }

  if (inList) {
    html += '</ul>';
  }

  return html;
}
