(function(){
  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeIcon = document.getElementById('themeIcon');
  const STORAGE_KEY = 'lal-ioc-theme';

  function applyTheme(theme){
    if (theme === 'light'){
      root.setAttribute('data-theme', 'light');
      themeIcon.textContent = '☾';
    } else {
      root.removeAttribute('data-theme');
      themeIcon.textContent = '☀';
    }
  }

  function getStoredTheme(){
    try { return localStorage.getItem(STORAGE_KEY); } catch(e){ return null; }
  }
  function storeTheme(theme){
    try { localStorage.setItem(STORAGE_KEY, theme); } catch(e){ /* ignore */ }
  }

  const stored = getStoredTheme();
  if (stored){
    applyTheme(stored);
  } else {
    applyTheme('dark'); // site default
  }

  document.getElementById('themeToggle').addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    storeTheme(next);
  });

  /* ---------- IOC extraction ---------- */
  const iocPatterns = [
    { type: 'url',    re: /\bhttps?:\/\/[^\s"'<>]+/g },
    { type: 'ipv4',   re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
    { type: 'hash',   re: /\b[a-fA-F0-9]{64}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{32}\b/g },
    { type: 'domain', re: /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g }
  ];

  function defangString(str){
    return str
      .replace(/:\/\//g, '[:]//')
      .replace(/\./g, '[.]')
      .replace(/:/g, '[:]');
  }

  function extractDefangedIOCs(text){
    const results = [];
    const claimedRanges = [];

    function overlaps(start, end){
      return claimedRanges.some(r => start < r.end && end > r.start);
    }

    for (const { type, re } of iocPatterns){
      re.lastIndex = 0;
      let match;
      while ((match = re.exec(text)) !== null){
        const start = match.index;
        const end = start + match[0].length;
        if (overlaps(start, end)) continue;
        claimedRanges.push({ start, end });
        const original = match[0];
        const defanged = type === 'hash' ? original : defangString(original);
        results.push({ type, original, defanged });
        if (re.lastIndex === match.index) re.lastIndex++;
      }
    }
    return results;
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderIOCs(iocs){
    const tbody = document.getElementById('iocTableBody');
    const countLabel = document.getElementById('countLabel');

    if (iocs.length === 0){
      tbody.innerHTML = '<tr><td colspan="4" class="empty">// no IOCs found _</td></tr>';
      countLabel.textContent = '';
      return;
    }

    countLabel.textContent = `${iocs.length} IOC${iocs.length === 1 ? '' : 's'} found`;

    tbody.innerHTML = iocs.map((ioc, i) => `
      <tr>
        <td><span class="badge">${escapeHtml(ioc.type)}</span></td>
        <td class="mono">${escapeHtml(ioc.original)}</td>
        <td class="mono">${escapeHtml(ioc.defanged)}</td>
        <td><button class="copy-btn" data-idx="${i}">Copy</button></td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        copyText(iocs[parseInt(btn.dataset.idx, 10)].defanged);
      });
    });
  }

  function copyText(text){
    const done = () => showToast('Copied!');
    const fail = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied!');
      } catch(e){
        showToast('Copy failed');
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(fail);
    } else {
      fail();
    }
  }

  let toastTimer = null;
  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
  }

  let currentIOCs = [];

  document.getElementById('generateBtn').addEventListener('click', () => {
    const raw = document.getElementById('inputText').value.trim();
    if (!raw){
      showToast('Paste some text first');
      return;
    }
    const sanitized = (window.DOMPurify ? DOMPurify.sanitize(raw, { ALLOWED_TAGS: [] }) : raw);
    currentIOCs = extractDefangedIOCs(sanitized);
    renderIOCs(currentIOCs);
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('inputText').value = '';
    currentIOCs = [];
    renderIOCs([]);
  });

  document.getElementById('copyAllBtn').addEventListener('click', () => {
    if (currentIOCs.length === 0){
      showToast('Nothing to copy');
      return;
    }
    const text = currentIOCs.map(i => `${i.type}: ${i.defanged}`).join('\n');
    copyText(text);
  });
})();
