/**
 * Utility for generating professional, printable PDF documents
 * Optimized for Devanagari Hindi typography and Bihar Board (BSEB) format.
 */

interface PdfExportOptions {
  title: string;
  subtitle?: string;
  subject?: string;
  badge?: string;
  contentHtml: string;
}

export function exportToPrintablePdf(options: PdfExportOptions): void {
  const { title, subtitle, subject, badge, contentHtml } = options;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('कृपया पॉप-अप की अनुमति दें ताकि PDF जनरेट हो सके।');
    return;
  }

  const currentDate = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="UTF-8">
      <title>${title} - बिहार बोर्ड 10वीं</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 18mm 15mm 18mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: 'Noto Sans Devanagari', sans-serif;
          color: #1c1917;
          background: #ffffff;
          line-height: 1.7;
          font-size: 13.5pt;
          margin: 0;
          padding: 0;
        }
        .header-container {
          border-bottom: 3px double #d97706;
          padding-bottom: 12px;
          margin-bottom: 20px;
          text-align: center;
        }
        .board-tag {
          font-size: 10pt;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #92400e;
          background: #fef3c7;
          display: inline-block;
          padding: 3px 12px;
          border-radius: 4px;
          border: 1px solid #fde68a;
          margin-bottom: 6px;
        }
        h1.doc-title {
          font-size: 20pt;
          font-weight: 800;
          color: #78350f;
          margin: 6px 0 4px 0;
        }
        .meta-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10pt;
          color: #78716c;
          margin-top: 8px;
          border-top: 1px solid #f5f5f4;
          padding-top: 6px;
        }
        .section-title {
          font-size: 15pt;
          font-weight: 800;
          color: #92400e;
          background: #fffbeb;
          border-left: 5px solid #d97706;
          padding: 6px 12px;
          margin: 22px 0 12px 0;
          border-radius: 0 6px 6px 0;
        }
        .subsection-title {
          font-size: 13pt;
          font-weight: 700;
          color: #b45309;
          margin: 16px 0 8px 0;
        }
        .formula-box {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 14px 0;
          color: #14532d;
          font-weight: 600;
        }
        .question-card {
          background: #fafaf9;
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 14px 0;
          page-break-inside: avoid;
        }
        .q-badge {
          display: inline-block;
          font-size: 9.5pt;
          font-weight: 700;
          background: #d97706;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
        }
        .q-text {
          font-size: 13pt;
          font-weight: 700;
          color: #1c1917;
          margin-bottom: 8px;
        }
        .q-answer {
          font-size: 12pt;
          color: #292524;
          border-left: 3px solid #d97706;
          padding-left: 10px;
          margin-top: 8px;
        }
        .exam-tip-box {
          background: #fefce8;
          border: 1.5px solid #fef08a;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 16px 0;
          color: #713f12;
        }
        ul, ol {
          margin: 8px 0;
          padding-left: 24px;
        }
        li {
          margin-bottom: 6px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #e7e5e4;
          text-align: center;
          font-size: 9pt;
          color: #a8a29e;
        }
        .no-print-bar {
          background: #292524;
          color: #ffffff;
          padding: 12px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          margin-bottom: 20px;
        }
        .print-btn {
          background: #f59e0b;
          color: #1c1917;
          font-weight: 700;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12pt;
          font-family: inherit;
        }
        .print-btn:hover {
          background: #d97706;
          color: #ffffff;
        }
        @media print {
          .no-print-bar {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <div>
          <strong>BSEB 10वीं AI गुरु</strong> • PDF डाउनलोड करने के लिए दाहिने दिए गए बटन पर क्लिक करें।
        </div>
        <button class="print-btn" onclick="window.print()">🖨️ अभी PDF डाउनलोड / प्रिंट करें</button>
      </div>

      <div class="header-container">
        <div style="display: flex; justify-content: center; margin-bottom: 12px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #d97706; background: #292524; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <span style="font-size: 30px; line-height: 1; margin-top: 4px;">🎓</span>
            <span style="color: white; font-weight: 800; font-size: 16px; line-height: 1; font-family: sans-serif;">PB</span>
          </div>
        </div>
        <div class="board-tag">${badge || 'बिहार विद्यालय परीक्षा समिति (BSEB) पटना • कक्षा 10वीं'}</div>
        <h1 class="doc-title">${title}</h1>
        ${subtitle ? `<div style="font-size: 12pt; color: #57534e; margin-top: 4px;">${subtitle}</div>` : ''}
        <div class="meta-bar">
          <span>विषय: <strong>${subject || 'संपूर्ण पाठ्यक्रम'}</strong></span>
          <span>सत्र: <strong>2025-2026</strong></span>
          <span>दिनांक: <strong>${currentDate}</strong></span>
        </div>
      </div>

      <div class="content-body">
        ${contentHtml}
      </div>

      <div class="footer">
        बिहार बोर्ड (BSEB) कक्षा 10वीं परीक्षा की तैयारी • BSEB 10th AI गुरु • 100% शुद्ध हिंदी माध्यम
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
}
