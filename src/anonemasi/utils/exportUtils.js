const escHtml = (str) => {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
};

const sanitizeForWord = (html) => {
  if (!html) return '';
  return html
    .replace(/<button[^>]*>.*?<\/button>/g, '')
    .replace(/<script[^>]*>.*?<\/script>/g, '');
};

export const buildWordDoc = (title, bodyHtml) => {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Transform common HTML to Mso-specific styles
  const msoContent = bodyHtml
    .replace(/<h3>/g, '<p class="MsoHeading3"><b><span style="font-size:12.0pt">')
    .replace(/<\/h3>/g, '</span></b></p>')
    .replace(/<h2>/g, '<p class="MsoHeading2"><b><span style="font-size:14.0pt">')
    .replace(/<\/h2>/g, '</span></b></p>')
    .replace(/<p>/g, '<p class="MsoNormal">')
    .replace(/<\/p>/g, '</p>')
    .replace(/<br\s*\/?>/g, '<br clear="all" style="page-break-before:always" />'); // Only if needed for breaks

  const cleanBody = sanitizeForWord(msoContent);

  // High-compatibility Microsoft Word HTML Template
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="Microsoft Word 11">
  <meta name="Originator" content="Microsoft Word 11">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    <!--
    /* Font Definitions */
    @font-face { font-family: "Times New Roman"; panose-1: 2 2 6 3 5 4 5 2 3 4; }
    
    /* Style Definitions */
    p.MsoNormal, li.MsoNormal, div.MsoNormal {
      mso-style-parent: "";
      margin: 0in;
      margin-bottom: .0001pt;
      mso-pagination: widow-orphan;
      font-size: 12.0pt;
      font-family: "Times New Roman", serif;
    }
    p.MsoHeading2 {
      margin-top: 12.0pt;
      margin-right: 0in;
      margin-bottom: 3.0pt;
      margin-left: 0in;
      page-break-after: avoid;
      font-size: 14.0pt;
      font-family: "Times New Roman", serif;
      font-weight: bold;
    }
    p.MsoHeading3 {
      margin-top: 12.0pt;
      margin-right: 0in;
      margin-bottom: 3.0pt;
      margin-left: 0in;
      page-break-after: avoid;
      font-size: 12.0pt;
      font-family: "Times New Roman", serif;
      font-weight: bold;
    }
    @page Section1 {
      size: 8.5in 11.0in;
      margin: 1.0in 1.0in 1.0in 1.0in;
      mso-header-margin: .5in;
      mso-footer-margin: .5in;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    -->
  </style>
</head>
<body lang="EN-US" style="tab-interval:.5in">
  <div class="Section1">
    <p class="MsoNormal" style="text-align:center; margin-bottom: 24pt;">
      <b><span style="font-size:16.0pt; text-transform:uppercase">${escHtml(title)}</span></b>
    </p>
    <p class="MsoNormal" style="text-align:center; margin-bottom: 36pt;">
      <i>Generated on ${date}</i>
    </p>
    ${cleanBody}
  </div>
</body>
</html>`;
};

export const triggerDownload = (htmlContent, filename) => {
  // Use a Blob with the specific application/msword type and a BOM
  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};
