// Regex patterns for IOC extraction
const iocPatterns = {
  ipv4: /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g,
  domain: /\b([a-zA-Z0-9-]+\.[a-zA-Z]{2,})\b/g,
  url: /(https?:\/\/[^\s]+)/g,
  hash: /([a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})/g
};

// Defang a string (e.g., replace . with [.])
function defangString(str) {
  return str.replace(/\./g, '[.]')
             .replace(/:\\/\\//g, '[:]//')
             .replace(/:/g, '[:]')
             .replace(/\//g, '[/]');
}

// Extract and defang IOCs from sanitized text
function extractDefangedIOCs(text) {
  const iocs = [];
  for (const [type, pattern] of Object.entries(iocPatterns)) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const originalValue = match[0];
      const defangedValue = type === 'hash' ? originalValue : defangString(originalValue);
      iocs.push({ type, original: originalValue, defanged: defangedValue });
    }
  }
  return iocs;
}

// Render IOCs in the table
function renderIOCs(iocs) {
  const tableBody = document.getElementById('iocTableBody');
  tableBody.innerHTML = iocs.length === 0
    ? '<tr><td colspan="3">No IOCs found.</td></tr>'
    : iocs.map(ioc => `
        <tr>
          <td>${ioc.type}</td>
          <td>${ioc.original}</td>
          <td>${ioc.defanged}</td>
        </tr>
      `).join('');
}

// Main function to handle IOC generation
document.getElementById('generateBtn').addEventListener('click', () => {
  const rawText = document.getElementById('inputText').value.trim();
  if (!rawText) return alert('Please paste some text first.');

  // Sanitize input using DOMPurify (strip all HTML tags)
  const sanitizedText = DOMPurify.sanitize(rawText, { ALLOWED_TAGS: [] });

  // Extract and defang IOCs
  const iocs = extractDefangedIOCs(sanitizedText);
  renderIOCs(iocs);
});
